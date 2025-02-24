"""
Module Overview
---------------
This module is designed to create and configure a SQLite database for employee-related data.
It includes functionality for reading CSV files into the database, checking the health of database tables,
and executing SQL queries.

Structure
---------
- Imports: Necessary libraries and modules.
- Global Variables: Paths and settings for database and CSV files.
- Functions: Functions for database connections, executing queries, and table health checks.
- Initialization: Steps to create and populate the database, and initialize the SQL agent.

Example Usage:
    from database import get_connection, get_cursor, execute, ping_table, sql_tool

    # Establishing a connection
    connection = get_connection()

    # Getting a cursor
    connection, cursor = get_cursor()

    # Executing a query
    connection, cursor = execute("SELECT * FROM employee_personal_details")

    # Pinging a table to check its health
    ping_table("employee_personal_details")

    # Running a custom SQL query using the sql_tool function
    result = sql_tool("SELECT * FROM employee_personal_details WHERE Gender = 'Male'")
"""

import ast
import os
import re
import sqlite3
import pandas as pd
from langchain_community.utilities import SQLDatabase

def get_connection():
    return sqlite3.connect(db_path)

def get_cursor():
    connection = get_connection()
    return connection, connection.cursor()

def execute(query: str):
    connection, cursor = get_cursor()
    cursor.execute(query)
    connection.commit()
    return connection, cursor

def ping_table(table_name: str):
    connection, cursor = execute(f"SELECT * FROM {table_name} LIMIT 1")
    try:
        rows = cursor.fetchmany(1)
        if rows and len(rows) == 1:
            print(f"Table {table_name} is healthy")
        else:
            print(f"ERROR: Table {table_name} is not healthy")
            raise Exception(f"Table {table_name} is not healthy, something went wrong during DB creation")
    except Exception as e:
        print(f"ERROR: Failed to ping table {table_name}: {str(e)}")
        raise e
    finally:
        cursor.close()
        connection.close()

# Initialize configuration
print("Initializing Employee Database System")

path = "/home/dhruvnew/Downloads/hr-main/backend/bot"  # Update this path
db_name = "employee_db"
csv_folder = f"{path}/data"
db_path = f"{path}/{db_name}.db"
chat_history = {}

print(f"Creating database {db_name} in {path}")
os.makedirs(os.path.dirname(db_path), exist_ok=True)

print(f"Connecting to database {db_name}")
connection = sqlite3.connect(db_path)

# Read all CSV files
print("Reading CSV files")
tables = {
    "employee_personal_details": pd.read_csv(f"{csv_folder}/Employee_Personal_Details.csv"),
    "employee_employment_details": pd.read_csv(f"{csv_folder}/Employee_Employment_Details.csv"),
    "employee_documents": pd.read_csv(f"{csv_folder}/Employee_Documents.csv"),
    "employee_tasks": pd.read_csv(f"{csv_folder}/Employee_Tasks.csv"),
    "policy_documents": pd.read_csv(f"{csv_folder}/Policy_Documents.csv"),
    "employee_leave": pd.read_csv(f"{csv_folder}/Employee_Leave.csv"),
    "employee_payroll": pd.read_csv(f"{csv_folder}/Employee_Payroll.csv"),
    "escalated_query": pd.read_csv(f"{csv_folder}/Escalated_Query.csv"),
    "interns_assignment":pd.read_csv(f"{csv_folder}/Interns Assignment Topics(2024-25) - Assignment List.csv")

}

# Write all tables to database
print("Writing CSV files to database")
for table_name, df in tables.items():
    df.to_sql(table_name, connection, if_exists="replace", index=False)
    print(f"Created table: {table_name}")

connection.close()

# Health check all tables
print("Running health check on created tables")
for table_name in tables.keys():
    ping_table(table_name)

print("Initializing SQL Database tool")
db = SQLDatabase.from_uri(f"sqlite:///{db_path}")

# Define table columns for query processing
tables_columns = {table: list(df.columns) for table, df in tables.items()}

def extract_columns(query: str) -> list[str]:
    pattern = re.compile(r"SELECT\s+(?:DISTINCT\s+)?(.*?)\s+FROM", re.IGNORECASE | re.DOTALL)
    match = pattern.search(query)
    if not match:
        return []

    columns_string = match.group(1)
    column_pattern = re.compile(r"`([^`]+)`|(\b\w+\b(?:,\s*\w+\b)*)")
    matches = column_pattern.findall(columns_string)
    columns = []
    for match in matches:
        if match[0]:
            columns.append(match[0])
        elif match[1]:
            columns.extend([col.strip() for col in match[1].split(',')])
    return columns

def replace_null_values(columns: list, result: pd.DataFrame) -> str:
    """
    Replaces null values in the result list with default values based on the column name.

    Args:
        columns (list): A list of column names.
        result (str): A string representation of a list containing the query result.

    Returns:
        str: A string representation of the updated result list with null values replaced.

    Example:
        columns = ["Target Portfolio", "Asset Class", "Client"]
        result = '[[None, "Stocks", "John Doe"], ["Aggressive", None, "Unknown Client"]]'
        replace_null_values(columns, result)
        # Output: '[[Conservative, Stocks, John Doe], [Aggressive, Cash, Unknown Client]]'
    """

    default_values = {
        "Gender": "Unknown",
        "Document_Status": "Pending",
        "Task_Status": "Pending",
        "Leave_Balance": 0,
        "Net_Salary": 0,
        "Query_Status": "Pending",
        "Response": "Under Review"
    }

    result_list = ast.literal_eval(result)
    df = pd.DataFrame(result_list, columns=columns)
    
    for column, default_value in default_values.items():
        if column in df.columns:
            df[column] = df[column].fillna(default_value)
    
    return str(df.values.tolist())

def update_select_columns(query: str, table: str) -> str:
    """
    Updates the SELECT statement in the given SQL query to include all columns from the specified table.

    Args:
        query (str): The SQL query to update.
        table (str): The name of the table.

    Returns:
        str: The updated SQL query with the SELECT statement modified to include all columns from the table.
    """
    if f"SELECT * FROM `{table}`" in query or f"SELECT * FROM {table}" in query:
        backticked_columns = ", ".join(f"`{col}`" for col in tables_columns[table])
        query = query.replace(
            f"SELECT * FROM `{table}`",
            f"SELECT {backticked_columns} FROM `{table}`"
        ).replace(
            f"SELECT * FROM {table}",
            f"SELECT {backticked_columns} FROM {table}"
        )
    return query

def replace_wildcard(query: str) -> str:
    """
    Replaces the wildcard in the given SQL query with the appropriate select columns.

    Args:
        query (str): The SQL query to be modified.

    Returns:
        str: The modified SQL query with the wildcard replaced.

    """
    for table in tables_columns.keys():
        if f"FROM {table}" in query or f"FROM `{table}`" in query:
            query = update_select_columns(query, table)
            break
    return query

def sql_tool(query: str):
    """
    Executes an SQL query using the provided query string.

    Args:
        query (str): The SQL query to be executed.

    Returns:
        The result of the SQL query execution.
    """
    query = replace_wildcard(query)
    print(f"Executing SQL query: {query}")
    result = db.run(query)

    if not result:
        return "No results found in the database. Please try another query."

    ordered_columns = extract_columns(query)
    result = replace_null_values(ordered_columns, result)

    return result