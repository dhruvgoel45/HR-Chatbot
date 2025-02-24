// src/components/CreateTaskForm.jsx
import React, { useState } from "react";

const CreateTaskForm = ({ onTaskCreated }) => {
  const [formData, setFormData] = useState({
    task_name: "",
    task_description: "",
    deadline: "",
    no_of_documents_required: "",
    assign_to: "",
    task_document: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, task_document: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formatDate = (dateString) => {
      const [year, month, day] = dateString.split("-");
      return `${day}/${month}/${year}`; // Convert to DD/MM/YYYY
  };

    // Validation: Ensure all fields are filled
    if (
        !formData.task_name.trim() ||
        !formData.task_description.trim() ||
        !formData.deadline.trim() ||
        !formData.no_of_documents_required.trim() ||
        !formData.assign_to.trim() ||
        !formData.task_document
    ) {
        alert("All fields are required!");
        setIsSubmitting(false);
        return;
    }

    const form = new FormData();
    form.append("task_name", formData.task_name);
    form.append("task_description", formData.task_description);
    form.append("deadline", formatDate(formData.deadline)); // Convert date format
    form.append("no_of_documents_required", formData.no_of_documents_required);
    
    // Ensure emails are properly formatted (API might expect a list)
    form.append("assign_to", formData.assign_to.split(",").map(email => email.trim()));

    form.append("task_document", formData.task_document);

    console.log("Submitting Task Data:", Object.fromEntries(form.entries())); // Debugging

    try {
        const res = await fetch("http://127.0.0.1:8000/tasks/create", {
            method: "POST",
            body: form,
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Error response:", errorText);
            throw new Error(`Failed to create task: ${errorText}`);
        }

        const newTask = await res.json();
        onTaskCreated(newTask); // Update parent state
        alert("Task created successfully!");
    } catch (err) {
        console.error("Error:", err.message);
        alert("Failed to create task.");
    } finally {
        setIsSubmitting(false);
    }
};


  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create New Task</h2>

      <div className="mb-4">
        <label className="block font-medium mb-1">Task Name</label>
        <input
          type="text"
          name="task_name"
          value={formData.task_name}
          onChange={handleInputChange}
          required
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Task Description</label>
        <textarea
          name="task_description"
          value={formData.task_description}
          onChange={handleInputChange}
          required
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Deadline</label>
        <input
          type="date"
          name="deadline"
          value={formData.deadline}
          onChange={handleInputChange}
          required
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Number of Documents Required</label>
        <input
          type="number"
          name="no_of_documents_required"
          value={formData.no_of_documents_required}
          onChange={handleInputChange}
          required
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Assign To (Emails, comma-separated)</label>
        <input
          type="text"
          name="assign_to"
          value={formData.assign_to}
          onChange={handleInputChange}
          required
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Task Document</label>
        <input
          type="file"
          name="task_document"
          onChange={handleFileChange}
          required
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        {isSubmitting ? "Creating..." : "Create Task"}
      </button>
    </form>
  );
};

export default CreateTaskForm;
