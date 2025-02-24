from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from .prompt import QUESTION_REFINE_TEMPLATE

async def refine_user_query(query_text, get_chat):
    try:
        prompt_template = ChatPromptTemplate.from_template(
            QUESTION_REFINE_TEMPLATE
        )
        messages = get_chat['messages']
        last_two_messages = messages[-2:]  # Get the last two messages (if available)
        
        # Prepare chat details
        chat_details = [
            {"question": msg['content'], "answer": ""}
            if msg['sender'] == 'user'
            else {"question": "", "answer": msg['content']}
            for msg in last_two_messages
        ]
        
        prompt = prompt_template.format(
            question=chat_details,
            query=query_text,
        )

        model = ChatOpenAI(
            temperature=0,
            model="gpt-4o-mini",
        )
        response_text = model.invoke(prompt)
        refined_query_text = response_text.content
        return refined_query_text
    except Exception as e:
        print(repr(e))
        return None

async def classify_query_intent_llm(query_text):
    """
    Use an LLM to classify the intent of the query into structured/unstructured/tasks
    """
    from langchain.prompts import PromptTemplate
    from langchain_openai import ChatOpenAI

    intent_prompt_template = PromptTemplate.from_template(
        """
        Classify user queries into THREE categories: 
        1. "structured" - SQL/database queries about these tables:
           - Login Details, Employee Personal/Employment Details, Documents
           - Payroll, Leave, Escalated Queries, Policy Documents
        2. "unstructured" - Document/PDF content questions
        3. "tasks" - Task-related queries about:
           - Assigned tasks (task_name, deadline, requirements)
           - Task submissions (uploaded_documents, comments)
           - Task status/progress (completed_count, submissions)

        Examples of TASK queries:
        - "What tasks are assigned to me?"
        - "When is the documentation deadline?"
        - "Did I submit my internship assignment?"
        - "How many documents need to be uploaded?"

        Classify this query:
        Query: {query}
        
        Answer ONLY with: "structured", "unstructured", or "tasks"
        """
    )

    intent_prompt = intent_prompt_template.format(query=query_text)

    model = ChatOpenAI(
        model="gpt-4",
        temperature=0,
    )

    response = model.invoke(intent_prompt)
    decision = response.content.strip().lower()
    
    # Validate response
    valid_decisions = ["structured", "unstructured", "tasks"]
    return decision if decision in valid_decisions else "unstructured"