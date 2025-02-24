import React, { useState, useEffect } from "react";
import logo from "../assets/images/logo.png";
import redarrow from "../assets/redarrow.svg"
import userPhoto from "../assets/images/user.png";
import { FaBell } from "react-icons/fa";
import PaginatedTable from "../components/PaginatedTable"; // Update the path as needed
import TaskManager from "../components/TaskManager";
import { useLocation } from "react-router-dom";// Update the path as needed
import { useNavigate } from 'react-router-dom';
import {Spinner} from "@material-tailwind/react";

const EmployeeDashboardPage = ({ }) => {
    const [activeTab, setActiveTab] = useState("dashboard"); // Default view
    const [documents, setDocuments] = useState([]);
    const [firstThreeDocuments, setFirstThreeDocuments] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [cachedTasks, setCachedTasks] = useState(null);
    const location = useLocation();
    const { username, email } = location.state || {};
    const isAdmin = location.state?.isAdmin || localStorage.getItem("isAdmin") === "true";
    const [selectedDocs, setSelectedDocs] = useState([]); // State to track selected documents
    const [loading, setLoading] = useState(true); // ✅ Single Loading State





    // Fetch documents
    const navigate = useNavigate(); // Initialize navigate
    useEffect(() => {
        // Check if user data exists in localStorage
        const username = localStorage.getItem("username");
        if (!username) {
            // Redirect to login if no username is found
            navigate("/login");
        }
    }, [navigate]);
    const fetchDocuments = async () => {
        try {
            const res = await fetch("http://127.0.0.1:8000/document");
            if (!res.ok) throw new Error(`Error: ${res.statusText}`);

            const data = await res.json();
            setDocuments(data.documents);
            setFirstThreeDocuments(data.documents.slice(0, 3));
            console.log(data.documents);
        } catch (err) {
            console.error(err.message);
        } finally {
            setLoading(false); // ✅ Stop loading once data is fetched
        }
    };
    const Navbar = async () => {
        const handleSearch = (query) => {
            console.log("Searching for:", query);
            // Implement your search logic here, such as filtering projects or pages
        };
    }

    const handleLogout = () => {


        // Clear the localStorage
        localStorage.removeItem("username");
        localStorage.removeItem("email");
        localStorage.removeItem("is_admin");


        // Redirect to the login screen
        navigate("/login");
    };



    useEffect(() => {
        fetchDocuments();

    }, []);

    return (

        <div className="bg-[#F5F6FA] min-h-screen font-rubik">
              {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <Spinner className="h-12 w-12 text-blue-500" />
                </div>
            ) : (
                <>
            <nav className="fixed top-0 left-0 w-full z-10  bg-white h-20">
                <div className="flex items-center h-full px-10">
                    {/* Logo Section */}
                    <div className="flex items-center space-x-2">
                        <a href="/" className="flex items-center">
                            <img className="h-10 w-auto" src={logo} alt="Auto Dev" />
                            <span className="text-[#3B63F3] text-2xl font-bold ml-2">HR NEXUS</span>
                        </a>
                    </div>

                    {/* Spacer to align search and notifications to the right */}
                    <div className="flex-1 flex justify-center">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-1/3 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                        />
                        {/* Search Bar */}

                    </div>

                    {/* Notification Bell */}
                    <div className="relative flex items-center justify-center p-2 border-2 border-gray-700 rounded-full shadow-lg mr-6">
                        <FaBell className="text-gray-700 text-2xl" />
                        <span className="absolute top-0 right-0 inline-block w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                    </div>

                    {/* User Information */}
                    <div className="flex items-center space-x-2">
                        <img
                            className="h-10 w-10 rounded-full"
                            src={userPhoto}
                            alt="User"
                        />
                        <div className="text-sm text-left">
                            <h3 className="text-lg font-bold">{username}</h3>
                            <p className="text-gray-600">user@example.com</p>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex w-full pt-16 h-full">
                {/* Sidebar */}
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
                                className={` px-6 py-3 w-[90%] ml-2 flex items-center rounded-lg transition-all duration-300 
                ${activeTab === "settings" ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-100"}
            `}
                            >
                                <span className="w-full text-left">Settings</span>
                            </button>
                        </div>

                        <div className="relative flex items-center w-full justify-start">
                            {activeTab === "logout" && (
                                <span className="absolute left-0 w-2 h-10 bg-red-600 rounded-r-md"></span>
                            )}
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



                {/* Main Content */}
                <div className="w-4/5 ml-[300px] h-full">
                    <div className="flex-1 p-8 overflow-auto-y">
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
                                <div><div className="flex justify-between items-center">
                                    <h2 className="text-[28px] px-2 text-[#202224] font-rubik leading-normal text-bold">
                                        View Policies
                                    </h2>
                                    <button
                                        onClick={() => {
                                            navigate("/chat", { state: { username, email,  selectedDocs: selectedDocs.map(doc => ({
                                                document_id: doc.document_id,
                                                file_name: doc.file_name
                                              }))  } });
                                        }}
                                        className="px-4 py-2 mr-4 bg-white rounded-lg shadow-md transition w-1/6 flex items-center justify-between"
                                    >
                                        <span className="text-left">Proceed to Chat</span>
                                        <img src={redarrow} alt="chat-icon" className="w-5 h-5 ml-2" />
                                    </button>
                                </div>

                                    {/* Recent Documents */}
                                    {firstThreeDocuments.length === 0 ? (
                                        <p className="text-gray-500">No documents available.</p>
                                    ) : (
                                        <>
                                            <PaginatedTable
                                                documents={firstThreeDocuments}
                                                disablePagination={true}
                                                onSelectDocuments={setSelectedDocs} // Passing only the recent 3 documents
                                            />
                                            <div className="flex justify-end mt-2">
                                                <button
                                                    onClick={() => setActiveTab("policy")}
                                                    className="px-6 py-2 text-blue-700 rounded-lg"
                                                >
                                                    View All
                                                </button>
                                            </div>
                                        </>
                                    )}</div>


                                {/* Recent Tasks */}
                                <h2 className="text-[28px] px-3 pb-6 text-[#202224] font-rubik  leading-normal text-bold mt-4">
                                    Tasks Assigned
                                </h2>
                                <div className=" p-6 bg-white rounded-[14px]  border-[#B9B9B9]">
                                    <TaskManager email={email} cachedTasks={cachedTasks} setCachedTasks={setCachedTasks} displayLimit={3} />
                                </div>
                                <div className="flex justify-end mt-2">
                                    <button
                                        onClick={() => setActiveTab("tasks")}
                                        className="px-6 py-2 text-blue-700 rounded-lg"
                                    >
                                        View All
                                    </button>
                                </div>

                                {/* Recent Queries */}
                                <h2 className="text-xl font-semibold mt-8 mb-4">Escalated Queries Responses</h2>

                            </div>
                        )}
                        {/* Other Tabs */}
                        {activeTab === "policy" && (
                            <div>
                                <h1 className="text-[28px] font-medium leading-normal tracking-[-0.114px] text-[#202224] font-rubik">
                                    View Policies
                                </h1>
                                <br />
                                <input
                                    type="text"
                                    placeholder="Search policies..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-1/3 mb-4 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                                />
                                <PaginatedTable documents={documents.filter((doc) =>
                                    doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())
                                )} />
                            </div>
                        )}

                        {activeTab === "tasks" && (
                            <div>
                                <h1></h1>
                                {activeTab === "tasks" && (
                                    <TaskManager
                                        email={email}
                                        cachedTasks={cachedTasks}
                                        setCachedTasks={setCachedTasks}
                                    />
                                )}


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
            </>)}
        </div>);
};

export default EmployeeDashboardPage;
