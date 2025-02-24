import React from "react";
import { useState, useEffect } from "react";
import KnowledgeBasePage from "../components/PolicyDocumentsPage";
import Navbar from "../components/navbar";
import PaginatedTable from "../components/PaginatedTable";
import UploadPolicyCard from "../components/UploadPolicyCard";
import { useLocation } from "react-router-dom";// Update the path as needed
import { useNavigate } from 'react-router-dom';
import TasksTable from "../components/tasktable";
import CreateTaskForm from "../components/CreateTaskForm";





const AdminPage = ({ }) => {
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const [documents, setDocuments] = useState([]);
  const [queries, setQueries] = useState([]);
  const [firstThreeDocuments, setFirstThreeDocuments] = useState([]);
  const [firstThreeTasks, setFirstThreeTasks] = useState([]);
  const [firstThreeQueries, setFirstThreeQueries] = useState([]);// Default view
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadCard, setShowUploadCard] = useState(false);
  const location = useLocation();
  const { username, email } = location.state || {};
  const isAdmin = location.state?.isAdmin || localStorage.getItem("isAdmin") === "true";
  const [tasks, setTasks] = useState([]); // Store all tasks
  const [showCreateTaskForm, setShowCreateTaskForm] = useState(false);
// To toggle the visibility of the upload card

const navigate = useNavigate(); // Initialize navigate
  useEffect(() => {
    // Check if user data exists in localStorage
    const username = localStorage.getItem("username");
    if (!username) {
      // Redirect to login if no username is found
      navigate("/login");
    }
  }, [navigate]);  
const handleLogout = () => {
   
  
    // Clear the localStorage
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("is_admin");
  
  
    // Redirect to the login screen
    navigate("/login");
  };    
  

  const fetchDocuments = async () => {
    try {
        const res = await fetch("http://127.0.0.1:8000/document");
        if (!res.ok) throw new Error(`Error: ${res.statusText}`);

        const data = await res.json();
        setDocuments(data.documents); // Ensure all fields are stored here
        setFirstThreeDocuments(data.documents.slice(0, 3)); // Show first 3 documents if needed
    } catch (err) {
        console.error(err.message);
    }
};
const handleDocumentUpload = (newDocument) => {
  setDocuments((prevDocuments) => [newDocument, ...prevDocuments]);
  setFirstThreeDocuments((prevDocuments) => [newDocument, ...prevDocuments.slice(0, 2)]);
};


  

  useEffect((username) => {  fetchDocuments();
  }, []);

  const handleTaskCreated = (newTask) => {
    setTasks((prevTasks) => [...prevTasks, newTask]);
    setShowCreateTaskForm(false); // Close the form after creating a task
  };

  return (<>
    
          <Navbar></Navbar>
          <div className="w-full flex mt-20 bg-gray-100">


          <div className="w-1/5 min-w-[200px] max-w-[300px] fixed bg-white flex flex-col h-[calc(100vh-80px)] pt-8 justify-between">
  <div className="items-center mt-4 text-center">
    {[
      { label: "Dashboard", value: "dashboard" },
      { label: "Policies", value: "policy" },
      { label: "Tasks", value: "tasks" },
      { label: "Queries", value: "escalated" }
    ].map((tab) => (
      <div key={tab.value} className="relative flex items-center w-full justify-start mb-4">
        {/* Left Indicator (Only for Selected Tab) */}
        {activeTab === tab.value && (
          <span className="absolute left-0 w-2 h-full bg-blue-700 rounded-r-md"></span>
        )}

        {/* Button */}
        <button
          onClick={() => setActiveTab(tab.value)}
          className={`px-6 py-3 w-[90%] ml-2 flex items-center rounded-lg transition-all duration-300 
            ${activeTab === tab.value ? "bg-blue-500 ml-4 text-white" : "bg-white hover:bg-gray-100"}
          `}
        >
          <span className="w-full text-left">{tab.label}</span>
        </button>
      </div>
    ))}
  </div>

  <div className="items-center text-center border-t-2 font-Nunito pt-4">
    <div className="relative flex items-center w-full justify-start">
      {activeTab === "settings" && (
        <span className="absolute left-0 w-2 h-10 bg-blue-700 rounded-r-md"></span>
      )}
      <button
        onClick={() => setActiveTab("settings")}
        className={`px-6 py-3 w-[90%] ml-2 flex items-center rounded-lg transition-all duration-300 
          ${activeTab === "settings" ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-100"}
        `}
      >
        <span className="w-full text-left">Settings</span>
      </button>
    </div>

    <div className="relative flex items-center w-full justify-start">
      <button
        onClick={handleLogout}
        className={`px-6 py-1 w-[90%] ml-2 flex items-center rounded-lg transition-all duration-300
          ${activeTab === "logout" ? "bg-red-600 text-white" : "bg-white hover:bg-gray-100"}
        `}
      >
        <span className="w-full text-left">Logout</span>
      </button>
    </div>
  </div>
</div>
            
            <div className="w-4/5 ml-[300px] h-full">
            <div className="flex-1 p-8 overflow-auto">
                    {activeTab === "dashboard" && (
                        <div>
                                    <h1 className="text-3xl px-2 font-bold text-black mb-6">
                                    Welcome {username},
                                </h1>
                                <button
                                    onClick={() => {
                                        const storedUsername = localStorage.getItem("username");
                                        const storedEmail = localStorage.getItem("email");

                                        navigate("/chat", {
                                            state: { username: storedUsername, email: storedEmail }
                                        });
                                    }}
                                    className="mb-4 px-4 py-2 bg-[#FFF] rounded-[10px] border text-start w-1/5 shadow-md"
                                    style={{ boxShadow: "0px 1px 9px 0px rgba(0, 0, 0, 0.15)" }}             >
                                    <h3 className="text-bold pt-4 pl-2 text-[20px] font-rubik">Start New Chat <span className="text-blue-500">+</span> </h3>
                                    <p className="text-gray-400 font-rubik pl-2 pb-2">Begin a new conversation to get the information you need quickly.</p>                           </button>

                            {/* Recent Documents */}
                            <div><div className="flex justify-between items-center">
                                    <h2 className="text-[28px] px-2 text-[#202224] font-rubik leading-normal text-bold">
                                        View Policies
                                    </h2>
                                    <button
                                        onClick={() => {
                                            navigate("/chat", { state: { username, email, selectedDocs } });
                                        }}
                                        className="px-4 py-2 mr-4 bg-white rounded-lg shadow-md transition w-1/6 flex items-center justify-between"
                                    >
                                        <span className="text-left">Proceed to Chat</span>
                                        <img src="../assets/redarrow.svg" alt="chat-icon" className="w-5 h-5 ml-2" />
                                    </button>
                                </div></div>                            {firstThreeDocuments.length === 0 ? (
            <p className="text-gray-500">No documents available.</p>
        ) : (
            <>
                <PaginatedTable
                    documents={firstThreeDocuments} // Passing only the recent 3 documents
                />
                <button
                    onClick={() => setActiveTab("policy")}
                    className="mt-4 px-6 py-2 text-blue-700 rounded-lg "
                >
                    View All 
                </button>
            </>
        )}
            <h2 className="text-xl font-semibold mt-8 mb-4">Escalated Queries Responses</h2>
                            {firstThreeQueries.length === 0 ? (
                                <p className="text-gray-500">No queries found.</p>
                            ) : (
                                <>
                                <PaginatedTable
                                    documents={firstThreeQueries} // Passing only the recent 3 documents
                                />
                                <button
                                    onClick={() => setActiveTab("policy")}
                                    className="mt-4 px-6 py-2 text-blue-700 rounded-lg "
                                >
                                    View All 
                                </button>
                            </>
                            )}

                            {/* Recent Tasks */}
                            <h2 className="text-xl font-semibold mt-8 mb-4">Recent Tasks</h2>
                            {firstThreeTasks.length === 0 ? (
                                <p className="text-gray-500">No tasks available.</p>
                            ) : (
                                <ul className="list-disc pl-6 space-y-2">
                                    {firstThreeTasks.map((task) => (
                                        <li key={task.id}>{task.title}</li>
                                    ))}
                                </ul>
                            )}

                            {/* Recent Queries */}
                        
                        </div>
                    )}
                 {/* Other Tabs */}
{activeTab === "policy" && (
  <div>
    <h1 className="text-[28px] font-medium leading-normal tracking-[-0.114px] text-[#202224] font-rubik">
      View Policies
    </h1>
    <br />

    {/* Search and Upload Button */}
    <div>
      {/* Search and Upload */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search policies..."
          className="w-1/3 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300"
        />
        <button
          onClick={() => setShowUploadCard(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Upload Document
        </button>
      </div>

      {/* Upload Card */}
      {showUploadCard && (
        <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-30 z-50">
          <UploadPolicyCard
            onClose={() => setShowUploadCard(false)}
            onDocumentUpload={handleDocumentUpload} // Pass the function

          />
        </div>
      )}
    </div>

    <PaginatedTable
  documents={documents.filter((doc) => {
    const name = doc.file_name || doc.document_name || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  })}
/>
  </div>
)}

                    {activeTab === "tasks" && (
                       <div>
                       <h1 className="text-3xl font-bold text-blue-500 mb-6">
                         Tasks Management
                       </h1>
                       <button
                         onClick={() => setShowCreateTaskForm(!showCreateTaskForm)}
                         className="mb-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                       >
                         {showCreateTaskForm ? "Close Form" : "Create New Task"}
                       </button>
             
                       {showCreateTaskForm && (
                         <CreateTaskForm onTaskCreated={handleTaskCreated} />
                       )}
             
                       <TasksTable tasks={tasks} />
                     </div>
                    )}
                    {activeTab === "escalated" && (
                        <div>
                            <h1 className="text-3xl font-bold text-blue-500 mb-6">
                                Escalated Queries
                            </h1>
                            <p className="text-gray-500">No escalated queries found.</p>
                        </div>
                    )}
                    {activeTab === "settings" && (
                        <div>
                            <h1 className="text-3xl font-bold text-blue-500 mb-6">Settings</h1>
                            <p className="text-gray-500">Settings panel coming soon.</p>
                        </div>
                    )}
                </div>

     </div>
      

    </div>
    </>

  );
};

export default AdminPage;
