import React, { useState, useEffect } from "react";

const TasksTable = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/tasks/admin/tasks");
        if (!res.ok) throw new Error(`Error: ${res.statusText}`);
        const data = await res.json();
        setTasks(data.tasks);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleOpenTask = (task) => {
    setSelectedTask(task);
  };

  const handleCloseTask = () => {
    setSelectedTask(null);
  };

  if (loading) {
    return <p>Loading tasks...</p>;
  }

  if (tasks.length === 0) {
    return <p>No tasks available.</p>;
  }

  return (
    <div className="p-4">
      {selectedTask ? (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">Task Details</h2>
            <p><strong>Task Name:</strong> {selectedTask.task_name}</p>
            <p><strong>Description:</strong> {selectedTask.task_description}</p>
            <p><strong>Deadline:</strong> {selectedTask.deadline}</p>
            <p><strong>No. of Documents Required:</strong> {selectedTask.no_of_documents_required}</p>
            <p><strong>Assigned To:</strong> {selectedTask.assign_to.join(", ")}</p>
            <h3 className="text-lg font-semibold mt-4">Employee Details</h3>
            <ul className="list-disc pl-6">
              {selectedTask.employee_details.map((employee) => (
                <li key={employee.email} className="mt-2">
                  <p><strong>Email:</strong> {employee.email}</p>
                  <p><strong>Submitted:</strong> {employee.submitted ? "Yes" : "No"}</p>
                  <p><strong>Comments:</strong> {employee.comments || "None"}</p>
                  <p><strong>Uploaded Documents:</strong></p>
                  <ul className="list-disc pl-6">
                    {employee.uploaded_documents.length > 0 ? (
                      employee.uploaded_documents.map((doc, index) => (
                        <li key={index}>{doc}</li>
                      ))
                    ) : (
                      <li>None</li>
                    )}
                  </ul>
                </li>
              ))}
            </ul>
            <button
              onClick={handleCloseTask}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse bg-white rounded-lg shadow-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-4 border-b">Task Name</th>
                <th className="px-6 py-4 border-b">Deadline</th>
                <th className="px-6 py-4 border-b">Assigned To</th>
                <th className="px-6 py-4 border-b">Open Task</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.task_id}>
                  <td className="px-6 py-4 border-b">{task.task_name}</td>
                  <td className="px-6 py-4 border-b">{task.deadline}</td>
                  <td className="px-6 py-4 border-b">{task.assign_to.join(", ")}</td>
                  <td className="px-6 py-4 border-b">
                    <button
                      onClick={() => handleOpenTask(task)}
                      className="text-blue-500 hover:underline"
                    >
                      Open Task
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TasksTable;
