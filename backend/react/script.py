import csv

# Employee Personal Details
personal_details = [
    ["Employee_ID", "Full_Name", "Date_of_Birth", "Gender", "Contact_Number", "Email_Address", "Emergency_Contact", "Permanent_Address"],
    [1, "John Doe", "1990-05-15", "Male", "1234567890", "john.doe@example.com", "9876543210", "123 Main St, CityA, CountryX"],
    [2, "Jane Smith", "1985-08-22", "Female", "2345678901", "jane.smith@example.com", "8765432109", "456 Elm St, CityB, CountryY"],
    [3, "Alex Brown", "1992-11-30", "Other", "3456789012", "alex.brown@example.com", "7654321098", "789 Oak St, CityC, CountryZ"]
]

# Employee Employment Details
employment_details = [
    ["Employee_ID", "Department", "Role", "Date_of_Joining", "Employee_Type", "Work_Location"],
    [1, "Engineering", "Software Engineer", "2020-06-01", "Full-Time", "On-Site"],
    [2, "Marketing", "Marketing Manager", "2019-03-15", "Full-Time", "Remote"],
    [3, "HR", "HR Specialist", "2021-09-10", "Part-Time", "Hybrid"]
]

# Employee Documents
employee_documents = [
    ["Document_ID", "Employee_ID", "Document_Type", "Document_Status", "Upload_Date"],
    [101, 1, "ID Proof", "Verified", "2023-01-10"],
    [102, 1, "Address Proof", "Pending", "2023-01-12"],
    [103, 2, "ID Proof", "Verified", "2023-02-05"],
    [104, 3, "Address Proof", "Verified", "2023-03-20"]
]

# Employee Tasks
employee_tasks = [
    ["Task_ID", "Employee_ID", "Task_Name", "Task_Description", "Task_Status", "Due_Date"],
    [201, 1, "Code Review", "Review code for Project X", "Completed", "2023-10-15"],
    [202, 2, "Marketing Campaign", "Launch Q4 marketing campaign", "Pending", "2023-11-01"],
    [203, 3, "Recruitment Drive", "Hire 5 new engineers", "Pending", "2023-10-30"]
]

# Policy Documents
policy_documents = [
    ["Document_ID", "Document_Name", "Document_Type", "Upload_Date", "Version", "Description", "Category", "Uploaded_By", "File_Link", "Status"],
    [301, "Leave Policy", "Leave Policy", "2023-01-01", "1.0", "Policy for leave management", "HR Policies", "HR User1", "http://example.com/leave_policy.pdf", "Active"],
    [302, "Code of Conduct", "Code of Conduct", "2023-02-15", "2.0", "Employee code of conduct", "HR Policies", "HR User2", "http://example.com/code_of_conduct.pdf", "Active"],
    [303, "IT Security Policy", "IT Policy", "2023-03-10", "1.5", "Policy for IT security", "IT Policies", "HR User3", "http://example.com/it_security.pdf", "Archived"]
]

# Employee Leave
employee_leave = [
    ["Leave_ID", "Employee_ID", "Leave_Type", "Leave_Balance", "Leave_Taken"],
    [401, 1, "Annual", 15, 5],
    [402, 2, "Sick", 10, 2],
    [403, 3, "Casual", 8, 3]
]

# Employee Payroll
employee_payroll = [
    ["Payroll_ID", "Employee_ID", "Basic_Salary", "Allowances", "Deductions", "Net_Salary", "Payment_Date"],
    [501, 1, 5000, 1000, 500, 5500, "2023-10-31"],
    [502, 2, 6000, 1200, 600, 6600, "2023-10-31"],
    [503, 3, 4000, 800, 400, 4400, "2023-10-31"]
]

# Escalated Query
escalated_query = [
    ["Query_ID", "Employee_ID", "Query_Category", "Query_Description", "Query_Status", "Response", "Response_Date"],
    [601, 1, "Payroll", "Incorrect salary calculation", "Resolved", "Salary recalculated and corrected", "2023-10-20"],
    [602, 2, "Leave", "Leave balance not updated", "Pending", "", "2023-10-25"],
    [603, 3, "HR", "Query about promotion policy", "Escalated", "Under review by HR", "2023-10-28"]
]

# Function to write data to CSV
def write_to_csv(filename, data):
    with open(filename, mode="w", newline="") as file:
        writer = csv.writer(file)
        writer.writerows(data)
    print(f"{filename} created successfully!")

# Generate all CSV files
write_to_csv("Employee_Personal_Details.csv", personal_details)
write_to_csv("Employee_Employment_Details.csv", employment_details)
write_to_csv("Employee_Documents.csv", employee_documents)
write_to_csv("Employee_Tasks.csv", employee_tasks)
write_to_csv("Policy_Documents.csv", policy_documents)
write_to_csv("Employee_Leave.csv", employee_leave)
write_to_csv("Employee_Payroll.csv", employee_payroll)
write_to_csv("Escalated_Query.csv", escalated_query)