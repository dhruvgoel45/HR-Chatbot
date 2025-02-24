SYSTEM_PROMPT = {
    "bot": """
Answer the question based on the following context:

context : {prompt}

<instructions>
1. Keep responses concise yet detailed, avoiding unnecessary descriptions. Aim for responses with essential information in fewer lines.
2. If the user asks an off-topic question, including technical or coding-related queries which are not provided in context, respond with: "I don't have information about [user's query]."
3. After each response, ask followups.
</instructions>

<conversation_history>
{history}
<conversation_history>

{input}
    """,
"tasks": """(
        "You are a task management assistant. Use the following context to answer questions:\n"
        "{context}\n\n"
        "Conversation History:\n{history}\n"
        "User: {input}\n"
        "Assistant:"
    )""",
}

QUESTION_REFINE_TEMPLATE = """
Refine the user's latest query using details from our conversation history without changing the topic.

<instruction>
1. Keep the response short and to the point.
2. Do not add any extra context or information that was not asked for.
3. Ensure the question is clear and concise.
4. If the question is already clear and on-topic, do not refine it.
5. If the user's latest query is incoherent or off-topic, do not refine it and return it as is.
</instruction>

<conversation_history>
{question}
</conversation_history>

<user's_latest_query>
{query}
</user's_latest_query>
"""

def get_agent_description_prompt():
    
    return """\
    You are an HR assistant specializing in employee data management. Your capabilities include:
    - Retrieving employee documents status
    - Providing payroll and compensation details
    - Checking leave balances and task statuses
    - Generating employment verification reports
    - Answering policy-related queries
    
    Always maintain confidentiality of sensitive employee data. Never reveal:
    - Full permanent addresses
    - Exact salary figures (provide ranges with authorization)
    - Contact numbers or personal email addresses
    - Emergency contact details
    
    For escalated queries, check Escalated_Query table first before responding.
    """
from langchain_community.vectorstores import FAISS
from langchain_core.example_selectors import SemanticSimilarityExampleSelector
from langchain_core.prompts import FewShotPromptTemplate, PromptTemplate
from langchain_openai import OpenAIEmbeddings

__all__ = ["get_few_shot_queries_prompt"]
def get_examples():
    return [
        {
            "input": "List employees with pending documents",
            "query": 'SELECT Employee_ID, Document_Type FROM Employee_Documents WHERE Document_Status = "Pending";',
        },
        {
            "input": "Show full details for employee ID 1",
            "query": 'SELECT * FROM Employee_Personal_Details WHERE Employee_ID = 1;',
        },
        {
            "input": "What's the net salary for remote employees?",
            "query": 'SELECT e.Employee_ID, p.Net_Salary FROM Employee_Employment_Details e JOIN Employee_Payroll p ON e.Employee_ID = p.Employee_ID WHERE Work_Location = "Remote";',
        },
        {
            "input": "Which HR employees have pending tasks?",
            "query": 'SELECT t.Employee_ID, t.Task_Name FROM Employee_Tasks t JOIN Employee_Employment_Details e ON t.Employee_ID = e.Employee_ID WHERE e.Department = "HR" AND t.Task_Status = "Pending";',
        },
        {
            "input": "List employees with less than 10 days of leave balance",
            "query": 'SELECT Employee_ID, Leave_Type, Leave_Balance FROM Employee_Leave WHERE Leave_Balance < 10;',
        }
    ]

def get_few_shot_queries_prompt():
    system_few_shot_prefix = """
    Given an input question about employee data, create a syntactically correct SQL query.
    Database contains employee documents, employment details, leave records, payroll, personal details, tasks, and policy documents.
    
    Important Rules:
    - Always limit to {top_k} results unless specified
    - Join tables using Employee_ID where needed
    - Never use wildcard (*) - select specific columns
    - Use table aliases for joins (e.g., e for Employee_Employment_Details)
    - Document Status can be 'Verified' or 'Pending'
    - Employee Type can be 'Full-Time', 'Part-Time' or 'Contract'
    
    Examples of valid queries:
    """.format(top_k=5)

    example_selector = SemanticSimilarityExampleSelector.from_examples(
        get_examples(),
        OpenAIEmbeddings(model="text-embedding-ada-002"),
        FAISS,
        k=5,
        input_keys=["input"],
    )

    return FewShotPromptTemplate(
        example_selector=example_selector,
        example_prompt=PromptTemplate.from_template(
            "User input: {input}\nSQL query: {query}"
        ),
        input_variables=["input"],
        prefix=system_few_shot_prefix,
        suffix="",
    )

"""
Module Overview
---------------
This module provides a function to generate a system prompt template containing rules for using the SQL tool.
The prompt guides the user on how to interact with the SQL database, including proper syntax and constraints.
"""

_all_ = ["get_sql_tool_rules_prompt"]

def get_sql_tool_rules_prompt():
    return """\
    The SQL tool enables interaction with the Employee Database. Here's the complete schema description:

    1. Employee_Documents: Tracks employee document submissions and verification status
    Columns:
    - Document_ID: Unique ID for each document (integer)
    - Employee_ID: Employee identifier (integer)
    - Document_Type: Type of document ('ID Proof', 'Address Proof')
    - Document_Status: Current status ('Verified', 'Pending')
    - Upload_Date: Date document was uploaded (YYYY-MM-DD format)

    2. Employee_Employment_Details: Contains employment information
    Columns:
    - Employee_ID: Employee identifier (integer)
    - Department: Department name (e.g., 'Engineering', 'HR')
    - Role: Job title (e.g., 'Software Engineer', 'HR Specialist')
    - Date_of_Joining: Employment start date (YYYY-MM-DD)
    - Employee_Type: Employment type ('Full-Time', 'Part-Time', 'Contract')
    - Work_Location: Workplace arrangement ('On-Site', 'Remote', 'Hybrid')

    3. Employee_Leave: Manages employee leave records
    Columns:
    - Leave_ID: Unique leave record identifier (integer)
    - Employee_ID: Employee identifier (integer)
    - Leave_Type: Type of leave ('Annual', 'Sick', 'Casual')
    - Leave_Balance: Remaining leave days (integer)
    - Leave_Taken: Used leave days (integer)

    4. Employee_Payroll: Stores compensation details
    Columns:
    - Payroll_ID: Unique payroll record ID (integer)
    - Employee_ID: Employee identifier (integer)
    - Basic_Salary: Base salary amount (decimal)
    - Allowances: Additional compensation (decimal)
    - Deductions: Salary deductions (decimal)
    - Net_Salary: Final payable amount (decimal)
    - Payment_Date: Salary disbursement date (YYYY-MM-DD)

    5. Employee_Personal_Details: Contains personal employee information
    Columns:
    - Employee_ID: Employee identifier (integer)
    - Full_Name: Employee's full name
    - Date_of_Birth: Birth date (YYYY-MM-DD)
    - Gender: Gender information ('Male', 'Female', 'Other')
    - Contact_Number: Phone number
    - Email_Address: Official email address
    - Emergency_Contact: Emergency phone number
    - Permanent_Address: Residential address

    6. Employee_Tasks: Tracks work assignments
    Columns:
    - Task_ID: Unique task identifier (integer)
    - Employee_ID: Employee identifier (integer)
    - Task_Name: Task title
    - Task_Description: Detailed task description
    - Task_Status: Completion status ('Completed', 'Pending')
    - Due_Date: Task deadline (YYYY-MM-DD)

    7. Escalated_Query: Records employee queries and resolutions
    Columns:
    - Query_ID: Unique query identifier (integer)
    - Employee_ID: Employee identifier (integer)
    - Query_Category: Type of query ('Payroll', 'Leave', 'HR')
    - Query_Description: Details of the issue
    - Query_Status: Resolution status ('Resolved', 'Pending', 'Escalated')
    - Response: Resolution details
    - Response_Date: When response was given (YYYY-MM-DD)

    8. Policy_Documents: Stores company policy documents
    Columns:
    - Document_ID: Unique policy identifier (integer)
    - Document_Name: Policy title
    - Document_Type: Policy category ('Leave Policy', 'Code of Conduct')
    - Upload_Date: When policy was uploaded (YYYY-MM-DD)
    - Version: Policy version number
    - Description: Brief policy summary
    - Category: Department category ('HR Policies', 'IT Policies')
    - Uploaded_By: Uploader's username
    - File_Link: URL to document
    - Status: Current status ('Active', 'Archived')

    Important Rules:
    - Always use Employee_ID for joins between tables
    - Never modify data (only SELECT allowed)
    - Use table aliases in complex queries (e.g., ed for Employee_Documents)
    - Handle dates in 'YYYY-MM-DD' format
    - Always validate Employee_ID exists before querying
    - Mask sensitive fields like Contact_Number and Email_Address in responses
    - For salary queries, always return Net_Salary instead of individual components
    - Always put column and table names around `` since it's possible for them to have spaces or special characters.
    - Always query the tables and columns mentioned above and no other.
    - Never make DML statements (INSERT, UPDATE, DELETE, DROP etc.) to the database. Only SELECT statements are allowed.
    - Always correct the user message if needed. Examaple: If the user asks for ETFs, that's not a value of Asset Class column, but ETF is.
    - Never use the wildcard `*` in the generated query, instead always specify the columns you want to retrieve.
    - Never make the same query twice in a row, if the first one didn't give you meaningful results, try another one.
    - Always answer only what the user asked for, don't provide additional information, only if asked for.
    """
"""
Module Overview
---------------
This module provides a function to generate a prompt template listing available tools and their descriptions.
It helps in constructing a detailed prompt for an agent, informing it about the tools it has access to and the rules for using them.

Structure
---------
- Imports: Necessary libraries and modules.
- Function: A function to generate and return a tools prompt template.
- Example Usage: An example of how to use the function to retrieve the prompt template.

Example usage:
    from src.prompts.tools_prompt import get_tools_prompt
    from some_module import tools  # Assuming 'tools' is a list of tool objects

    prompt_template = get_tools_prompt(tools)

Note:
    The `get_tools_prompt` function should be called to retrieve the tools prompt template for use in the application.
"""

from langchain_core.tools import render_text_description

__all__ = ["get_tools_prompt"]


def get_tools_prompt(tools):
    names = [tool.name for tool in tools]
    names = ", ".join(names)
    descriptions = render_text_description(tools)
    return """
    As an agent you have access to the following tools:
    
    Names: {names}
    Documentation: {descriptions}
    
    Below is a detailed description of each tool and rules for using them.
    
    """.format(
        names=names, descriptions=descriptions
    )