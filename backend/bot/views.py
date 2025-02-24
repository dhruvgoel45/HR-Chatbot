from dotenv import load_dotenv
from utilities.config import OPENAI_API_KEY, chroma_client, db
from utilities.responses import success_response, error_response
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.prompts import PromptTemplate
from .prompt import SYSTEM_PROMPT
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain.memory import ConversationBufferMemory
from langchain_core.runnables import RunnableWithMessageHistory
from langchain.chains import create_sql_query_chain
from langchain_community.utilities import SQLDatabase
from langchain_core.output_parsers import StrOutputParser
from .schema import Parms
from datetime import datetime
from .utils import refine_user_query, classify_query_intent_llm
from .db import get_chat_history
from uuid import uuid4
from fastapi import Request
from starlette.responses import StreamingResponse

from langchain.chains import ConversationChain
from langchain.agents import create_openai_tools_agent
from langchain.agents.agent import AgentExecutor
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.prompts import (
    ChatPromptTemplate,
    PromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain_core.tools import StructuredTool
from langchain_openai import ChatOpenAI
from .prompt import get_agent_description_prompt, get_tools_prompt, get_sql_tool_rules_prompt, get_few_shot_queries_prompt
from .sql import sql_tool
from langchain.prompts import MessagesPlaceholder
import json


load_dotenv()

async def stream_response(response_generator):
    """Streams response chunks to the client."""
    async for chunk in response_generator:
        yield f"{chunk}\n"

# Initialize SQL Database connection
SQL_DB_PATH = "employee_db.db"
sql_db = SQLDatabase.from_uri(f"sqlite:///{SQL_DB_PATH}"
)


async def qa_bot(request: Request, _schema: Parms):
    try:
        body = await request.json()
        new_chat = body.get("new_chat", False)
        chat_id = body.get("chat_id")
        document_ids = body.get("document_ids")  
        print(document_ids)# Expecting a comma-separated string of document IDs
        chat_collection = db.get_collection(_schema.username)

        if new_chat:
            chat_title = _schema.query_text
            new_chat_document = {
                "chat_id": str(uuid4()),
                "messages": [],
                "created_on": datetime.now(),
                "is_active": True,
                "chat_title": _schema.query_text,  # Set chat_title as the first query
                "document_ids": []  # Initialize with an empty list for document IDs
            }
            await chat_collection.update_many({}, {"$set": {"is_active": False}})
            await chat_collection.insert_one(new_chat_document)
            chat_id = new_chat_document["chat_id"]
        elif chat_id:
            existing_chat = await chat_collection.find_one({"chat_id": chat_id})
            if not existing_chat:
                raise Exception(f"Chat with ID {chat_id} not found.")
            if not existing_chat.get("is_active", True):
                await chat_collection.update_one(
                    {"chat_id": chat_id}, {"$set": {"is_active": True}}
                )
                await chat_collection.update_many(
                    {"chat_id": {"$ne": chat_id}}, {"$set": {"is_active": False}}
                )
            chat_title = existing_chat["chat_title"]

        else:
            raise Exception("No chat_id provided. Please specify a chat_id to continue an existing chat.")

        # Retrieve chat history
        get_chat = await get_chat_history(_schema.username, chat_id)
        history = ChatMessageHistory()

        for message in get_chat["messages"]:
            if message["sender"] == "user":
                history.add_user_message(message["content"])
            elif message["sender"] == "bot":
                history.add_ai_message(message["content"])

        memory = ConversationBufferMemory(
            chat_memory=history, human_prefix="Human", ai_prefix="Assistant" ,    return_messages=True  # <<< Critical fix

        )

        refined_query_text = (
            _schema.query_text
            if not get_chat or not get_chat["messages"]
            else await refine_user_query(_schema.query_text, get_chat)
        )
        if document_ids:
            document_ids_list = [doc_id.strip() for doc_id in document_ids.split(",")]
            print(f"Document IDs to add: {document_ids_list}")  # Debug log
            # Update the chat document to add the document_ids
            update_result = await chat_collection.update_one(
                {"chat_id": chat_id},
                {"$addToSet": {"document_ids": {"$each": document_ids_list}}}
            )
            print(f"Update result - Matched: {update_result.matched_count}, Modified: {update_result.modified_count}")  # Debug log

        # Retrieve updated chat to get current document_ids
        updated_chat = await chat_collection.find_one({"chat_id": chat_id})
        print(f"Updated chat document: {updated_chat}")  # Debug log
        document_ids_list = updated_chat.get("document_ids", [])
        chat_title = updated_chat.get("chat_title", "New Chat")

        # Save user's message immediately
        new_user_message = {
            "sender": "user",
            "content": _schema.query_text,
            "timestamp": datetime.now()
        }
        await chat_collection.update_one(
            {"chat_id": chat_id},
            {"$push": {"messages": new_user_message}}
        )

        # Prepare headers with metadata
        headers = {
            "X-Chat-ID": chat_id,
            "X-Chat-Title": chat_title,
            "X-Document-IDs": ",".join(document_ids_list)
        }

        query_intent = await classify_query_intent_llm(refined_query_text)
        print(f"Intent Classification Decision: {query_intent}")

        async def generate_response():
            ai_text = ""
            chat_model = ChatOpenAI(model="gpt-4o-mini", api_key=OPENAI_API_KEY, max_tokens=3000, streaming=True)
       
            """Stream the response from OpenAI."""
            async def stream_chunk(content_chunk):
                chunk_json = json.dumps({"type": "text", "content": content_chunk})
                yield f"{chunk_json}\n"  # NDJSON formatting with newline
    
            if query_intent == "unstructured":
                embedding_function = OpenAIEmbeddings()
                chroma_db = Chroma(
                 embedding_function=embedding_function,
                client=chroma_client,
                persist_directory="db/",
            )
                retrieval = chroma_db.as_retriever()

                if document_ids_list:
                    results = []
                    for doc_id in document_ids_list:
                        results.extend(
                            chroma_db.similarity_search(
                query=refined_query_text,
                k=3,
filter={"document_id": doc_id}  # Match metadata key from upload
            )
        )
                else:
                    print("Searching across all documents")
                    results = chroma_db.similarity_search(refined_query_text, k=3)


                print(f"Retrieved Chunks: {results}")

                context_text = "".join([doc.page_content.replace("\n", "") for doc in results])
                system_prompt = SYSTEM_PROMPT["bot"]
                prompt_template = system_prompt.replace("{prompt}", context_text)
                PROMPT = PromptTemplate(input_variables=["history", "input"], template=prompt_template)

                async for chunk in chat_model.astream(prompt_template.format(history=memory.load_memory_variables({}), input=refined_query_text)):
                      print(chunk)
                      content_chunk = chunk.content if hasattr(chunk, 'content') else str(chunk)
                      if content_chunk.strip():
                        async for part in stream_chunk(content_chunk):
                            yield part
                        ai_text += content_chunk 

            elif query_intent == "tasks":

        # Query MongoDB tasks and employee_tasks collections
              tasks_collection = db.get_collection("tasks")
              employee_tasks_collection = db.get_collection("employee_tasks")
            
            # Fetch tasks assigned to the user using email_id
              user_tasks = await tasks_collection.find(
                {"assign_to": _schema.email_id}  # Use email_id instead of username
            ).to_list(length=100)  # Adjust limit as needed
            
            # Fetch user's task submissions using email_id
              user_submissions = await employee_tasks_collection.find(
                {"email": _schema.email_id}  # Use email_id instead of username
            ).to_list(length=100)
            
            # Build context
              context_text = "=== TASKS ASSIGNED TO YOU ===\n"
              for task in user_tasks:
                context_text += (
                    f"Task: {task.get('task_name', 'N/A')}\n\n"
                    f"Description: {task.get('task_description', 'N/A')}\n\n"
                    f"Deadline: {task.get('deadline', 'N/A')}\n\n"
                    f"Documents Required: {task.get('no_of_documents_required', 0)}\n\n"
                )
            
              context_text += "\n=== YOUR SUBMISSIONS ===\n"
              for sub in user_submissions:
                context_text += (
                    f"Comments: {sub.get('comments', 'N/A')}\n"
                    f"Uploaded Documents: {', '.join(sub.get('uploaded_documents', []))}\n\n"
                )
            
            # Use task-specific prompt
              system_prompt = SYSTEM_PROMPT["tasks"]
              prompt_template = system_prompt.replace("{context}", context_text)
              PROMPT = PromptTemplate(
                input_variables=["history", "input"], 
                template=prompt_template
            )
            
            # Generate response
              buffer = ""
              async for chunk in chat_model.astream(prompt_template.format(history=memory.load_memory_variables({}), input=refined_query_text)):
                   content_chunk = chunk.content if hasattr(chunk, 'content') else str(chunk)
                   buffer+=content_chunk

                   while True:
            # Find the last safe split point (space, newline, or markdown)
                    split_pos = max(
                buffer.rfind(' '),
                buffer.rfind('\n'),
                buffer.rfind('**')
            )
            
                    if split_pos == -1:
                            break  # No safe split found
            
            # Split buffer into sendable part and remainder
                    part_to_send = buffer[:split_pos+1]
                    remaining = buffer[split_pos+1:]
            
            # Add newline before headings if needed
                    formatted_part = part_to_send.replace('**', '\n**')
            
                    if formatted_part.strip():
                        async for part in stream_chunk(formatted_part):
                            yield part
                    ai_text += formatted_part
            
                    buffer = remaining

                # Send remaining buffer content
              if buffer.strip():
        # Final formatting check
                formatted_buffer = buffer.replace('**', '\n**')
                async for part in stream_chunk(formatted_buffer):
                    yield part
                ai_text += formatted_buffer
 
            else:
              llm = ChatOpenAI(model="gpt-4o-mini", api_key=OPENAI_API_KEY, max_tokens=3000)
              # Create tools (SQL tool in this case)
              tools = [StructuredTool.from_function(func=sql_tool, handle_tool_error=True)]
              llm.bind_tools(tools)
              system_prompt = PromptTemplate.from_template(
        "".join([
            get_agent_description_prompt(),
            get_tools_prompt(tools),
            get_sql_tool_rules_prompt(),
        
        ])
     )

              prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate(prompt=system_prompt),
    MessagesPlaceholder(variable_name="history"),  # <<< Matches memory key
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

    # Create agent executor
              react_agent = create_openai_tools_agent(llm=llm, prompt=prompt, tools=tools)
              agent_executor = AgentExecutor(
    agent=react_agent,
    tools=tools,
    memory=memory,  # <<< Inject memory here
    max_iterations=3,
    verbose=True,
    handle_parsing_errors=True,
    return_intermediate_steps=True,
         
)

              async for event in agent_executor.astream({"input": refined_query_text}):
                if "output" in event:
                    content_chunk = event["output"]
                    async for part in stream_chunk(content_chunk):
                     yield part
                     print(content_chunk)
                    ai_text += content_chunk
                elif "steps" in event:  # Skip intermediate steps
                    continue
            final_chunk = json.dumps({"type": "messageId", "content": str(chat_id)})
            yield f"{final_chunk}\n"


            if not await request.is_disconnected():
                bot_message = {"sender": "bot", "content": ai_text, "timestamp": datetime.now()}
                await chat_collection.update_one({"chat_id": chat_id}, {"$push": {"messages": bot_message}})
                yield json.dumps({"type": "messageId", "content": str(chat_id)})
            
            
        return StreamingResponse(generate_response(), media_type="application/x-ndjson", headers=headers)


            
           
       
        # Retrieve the updated chat document
        # updated_chat = await chat_collection.find_one({"chat_id": chat_id})
        # return success_response(msg="Success", data={
        #     "response": formatted_response,
        #     "chat_id": chat_id,
        #     "chat_title": chat_title,
        #     "document_ids": updated_chat.get("document_ids", [])
        # })
    except Exception as e:
        print(repr(e))
        return error_response(msg="Something went wrong")
