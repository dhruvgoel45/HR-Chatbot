import React, { useState, useEffect } from "react";
import {
  Button,
  Typography,
  Card,
  Dialog,
  DialogHeader,
  DialogBody,
    Input,
  IconButton,
} from "@material-tailwind/react";
import Upload from "../assets/upload.svg"
import pdfIcon from "../assets/images/pdf.jpg";
import { FaChevronRight, FaEllipsisV } from "react-icons/fa";

const TaskManager = ({ email, cachedTasks, setCachedTasks, displayLimit }) => {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comment, setComment] = useState("");
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const categorizeTasks = (tasks) => {
      setPendingTasks(tasks.filter((task) => !task.submitted));
      setCompletedTasks(tasks.filter((task) => task.submitted));
    };

    if (cachedTasks) {
      categorizeTasks(cachedTasks);
    } else {
      const fetchTasks = async () => {
        try {
          const response = await fetch(`http://127.0.0.1:8000/tasks/${email}`);
          if (!response.ok) throw new Error(`Error: ${response.statusText}`);
          const data = await response.json();
          setCachedTasks(data.tasks);
          categorizeTasks(data.tasks);
        } catch (error) {
          console.error(error.message);
        }
      };

      fetchTasks();
    }
  }, [email, cachedTasks, setCachedTasks]);

  const handleOpenDialog = (task) => {
    setSelectedTask(task);
    setComment("");
    setUploadedDocuments([]);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTask(null);
  };

  const handleDocumentUpload = (event) => {
    const files = Array.from(event.target.files);
    setUploadedDocuments([...uploadedDocuments, ...files]);
  };

  const handleSubmitTask = async () => {
    if (!selectedTask || isSubmitting) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("email", email);
    formData.append("task_id", selectedTask.task_id);
    formData.append("comments", comment);

    uploadedDocuments.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("http://localhost:8000/tasks/submit", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(`Error: ${response.statusText}`);

      const result = await response.json();
      console.log("Task submitted successfully:", result);

      setPendingTasks((prevTasks) =>
        prevTasks.filter((task) => task.task_id !== selectedTask.task_id)
      );
      setCompletedTasks((prevTasks) => [...prevTasks, selectedTask]);
      handleCloseDialog();
    } catch (error) {
      console.error("Failed to submit task:", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="p-6 bg-white rounded-lg ">
      {!displayLimit && (
        <Typography variant="h4" className="mb-6">
          Tasks for {email}
        </Typography>
      )}

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div>
          <Typography variant="h5" color="blue-gray" className="mb-4">
            Pending Tasks
          </Typography>
          <div className="grid gap-4">
            {pendingTasks.slice(0, displayLimit || pendingTasks.length).map((task, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 cursor-pointer 
                    ${selectedTask?.task_id === task.task_id ? "bg-blue-500 text-white" : "bg-[#FBFCFF] border border-[#D5D5D5]"}
                    rounded-[12px] shadow-sm transition duration-300 hover:shadow-md`}
                onClick={() => handleOpenDialog(task)}
              >
                <div className="flex items-center space-x-2">
                  <FaChevronRight />
                  <Typography variant="body1">{task.task_description}</Typography>
                </div>
                <FaEllipsisV />
              </div>
            ))}
          </div>
        </div>
      )}

{!displayLimit && completedTasks.length > 0 && (
        <>
          <Typography variant="h5" color="blue-gray" className="mt-8 mb-4">
            Completed Tasks
          </Typography>
          <div className="grid gap-4">
            {completedTasks.map((task, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-green-100 border border-green-300 
                  rounded-[12px] shadow-sm transition duration-300 hover:shadow-md cursor-pointer"
                onClick={() => handleOpenDialog(task)}
              >
                <div className="flex items-center space-x-2">
                  <FaChevronRight className="text-green-500" />
                  <Typography variant="body1">{task.task_description}</Typography>
                </div>
                <FaEllipsisV className="text-green-500" />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Task Dialog */}
      <Dialog open={openDialog} handler={handleCloseDialog} className="w-2/3 mx-auto">
        {selectedTask && (
          <>
            <DialogHeader className="relative text-center bg-[#F5F6FA] p-6">
            Task: {selectedTask.task_name}
              <button
                onClick={handleCloseDialog}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </DialogHeader>

            <DialogBody divider className="bg-[#F5F6FA] p-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <Typography variant="body1" color="blue-gray" className="mb-4 text-[#202224]">
                  {selectedTask.task_description}
                </Typography>
                <Typography variant="body1" color="blue-gray" className="mt-4 mb-2">
            Task Document:
          </Typography>
          <div className=" rounded-lg p-4 mb-4 flex items-center justify-between">
  <div className="flex items-center space-x-4">
    <div className="text-black font-semibold flex">
      <div className="flex"><img src={pdfIcon} alt="PDF Icon" className="h-6 w-6 mr-3" /> {/* PDF Icon */}
      {selectedTask.task_document.split("/").pop()}
 </div>
          </div>
    <div className="text-gray-500 text-sm">
      ({selectedTask.task_document.split(".").pop().toUpperCase()})
    </div>
  </div>
  <a
    href={selectedTask.file_link}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-500 underline"
  >
    <FaChevronRight />
  </a>
  </div>


                <Typography variant="p" color="blue-gray" className="mt-4 mb-2">
                  Comments (optional):
                </Typography>
                <div className="relative w-full mb-6">
  <textarea
    id="comment"
    value={comment}
    onChange={(e) => setComment(e.target.value)}
    className="peer h-48 w-full rounded-md border border-gray-300 bg-[#F1F4F9] px-4 pt-5 pb-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
    placeholder=" "
  ></textarea>
  <label
    htmlFor="comment"
    className="absolute left-4 top-3 text-gray-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-3 peer-focus:text-sm peer-focus:text-blue-500"
  >
    Enter comments if required
  </label>
</div>
<Typography variant="body1" color="blue-gray" className="mt-4 mb-2">
            Upload Documents
          </Typography>
          <div className="border bg-[#F1F4F9] border-gray-300 p-6 rounded-lg mb-6 text-center h-48">
            <input
              type="file"
              multiple
              onChange={handleDocumentUpload}
              className="hidden"
              id="document-upload"
            />
              <img 
        src={Upload} 
        alt="Upload Icon" 
        className="w-12 h-12 mx-auto mb-2" // Adjust size and spacing as needed
      />

            <label
              htmlFor="document-upload"
              className="cursor-pointer"
            >
              Click or Drag files to upload
            </label>
            <div className="mt-4">
              <Button
                variant="filled"
                color="blue"
                className="normal-case font-normal"
                onClick={() => document.getElementById("document-upload").click()}
              >
                browse files from this computer
              </Button>
            </div>
          </div>

          {uploadedDocuments.length > 0 && (
            <div className="mt-4">
              <Typography variant="h6" color="blue-gray">
                Uploaded Documents ({uploadedDocuments.length})
              </Typography>
              <div className="flex space-x-4 mt-2">
                {uploadedDocuments.map((file, index) => (
                  <div
                    key={index}
                    className="bg-blue-500 text-white p-2 rounded-lg"
                  >
                    {file.name}
                  </div>
                ))}
              </div>
            </div>
          )}

                {/* Submit Button (Only for Pending Tasks) */}
                {!selectedTask.submitted && (
                  <div className="flex justify-center w-full">
                    <Button
                      variant="gradient"
                      color="blue"
                      onClick={handleSubmitTask}
                      disabled={isSubmitting}
                      className="w-full max-w-xs bg-blue-500"
                    >
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                  </div>
                )}
              </div>
            </DialogBody>
          </>
        )}
      </Dialog>
    </div>
  );
};

export default TaskManager;
