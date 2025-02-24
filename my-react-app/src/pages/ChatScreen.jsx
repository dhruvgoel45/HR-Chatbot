import React, { useState, useEffect, useRef } from "react";
import NewChat from "../components/NewChat";
import ActivateChat from "../components/ActivateChat";
import logo from "../assets/images/logo.png";
import userPhoto from "../assets/images/user.png";
import { Menu, MenuHandler, MenuList, MenuItem, Button, Input } from "@material-tailwind/react";
import Select from "react-select";
import { format, isToday, isYesterday, subDays } from "date-fns";
import { FaBell, FaBars } from "react-icons/fa";
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import pdfIcon from "../assets/images/pdf.jpg"; // Import PDF icon
import ReactMarkdown from "react-markdown";
import reloadIcon from "../assets/images/reloadi.svg";
import dots from "../assets/images/dots.svg";
import searchIcon from "../assets/images/search.svg";
import { ChevronDownIcon } from "@heroicons/react/24/solid"; // Tailwind Heroicons for the dropdown arrow
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import remarkGfm from "remark-gfm";
import {Spinner} from "@material-tailwind/react";
import { motion } from "framer-motion"; // ✅ Import Framer Motion for animation







const ChatScreen = ({ }) => {
  const [chats, setChats] = useState([]);
  const [isOpen, setIsOpen] = useState(false); // ✅ Declare isOpen state
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [documents, setDocuments] = useState([]);
  const [groupedChats, setGroupedChats] = useState({});
  const [editingChatId, setEditingChatId] = useState(null); // To track the chat being edited
  const [newTitle, setNewTitle] = useState("");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]); // State to store notifications
  const [isNotificationOpen, setIsNotificationOpen] = useState(false); // State to toggle notification dropdown
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true); // ✅ Track loading state
  const [isSelectOpen, setIsSelectOpen] = useState(false); // ✅ Control select dropdown state
  const [querySubmitted, setQuerySubmitted] = useState(false);
  const activateChatRef = useRef();

  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };
  
    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);
  
  // Handle notification click
  const handleNotificationClick = (notification) => {
    navigate(isAdmin ? "/admin" : "/employee-dashboard", { 
      state: { 
        username, 
        email, 
        isAdmin,
        notification // Pass notification data if needed
      } 
    });
    setIsNotificationOpen(false);
  };


  
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  // Trigger scroll on activeChat changes and messages updates
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100); // Small delay to ensure DOM updates
    return () => clearTimeout(timer);
  }, [activeChat?.messages]); // Watch for message changes

  const location = useLocation();
  const { username, email, selectedDocs = [] } = location.state || {};
  useEffect(() => {
    console.log('Received selected documents:', selectedDocs);
  }, []);
  const documentOptions = documents.map((doc) => ({
    value: doc.document_id,  // Ensure this is correctly populated
    label: doc.file_name,
    key: doc.document_id,  // Add a unique key
  }));
  useEffect(() => {
    if (selectedDocs.length > 0) {
      setIsLoading(true); // Start loading animation

      // Simulate loading delay (adjust as needed)
      setTimeout(() => {
        setSelectedDocuments(selectedDocs);
        setIsLoading(false);  // Stop loading animation
        setIsSelectOpen(true); // ✅ Open dropdown automatically
      }, 1500); // Simulated delay for effect
    }
  }, [selectedDocs]);

  
  const [selectedDocuments, setSelectedDocuments] = useState(
    selectedDocs.map(doc => ({
      value: doc.document_id,
      label: doc.file_name,
    }))
  );    
  const handleDocumentSelect = (selectedOptions) => {
      setSelectedDocuments(selectedOptions || []);
    };
  const navigate = useNavigate(); 
    // Toggle notification dropdown
  const handleNewChatClick = () => {
      setActiveChat(null);
      setQuerySubmitted(false);
      setSearchQuery('');
      fetchChats();
      setSelectedDocuments([]); // Reset selected documents

    };
    const toggleNotifications = () => {
      setIsNotificationOpen((prev) => !prev);
    };
    


  
  // ✅ WebSocket for real-time notifications
  useEffect(() => {
    if (!email) return;

    const ws = new WebSocket(`ws://localhost:8000/tasks/ws/${encodeURIComponent(email)}`);

    ws.onmessage = (event) => {
        const notification = JSON.parse(event.data);
        setNotifications((prev) => [...prev, notification]);
    };

    return () => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.close();
        }
    };
}, [email]);  // Ensure `email` is stable and doesn't change unnecessarily
  
    // ✅ Redirect to login if session expires
    useEffect(() => {
      const storedUsername = localStorage.getItem("username");
      if (!storedUsername) {
        toast.error("Session expired! Redirecting to login.");
        navigate("/login");
      }
    }, [navigate]);
  
    const handleLogout = () => {
      localStorage.clear();
      navigate("/login");
    };
  
    // ✅ Fetch documents
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://127.0.0.1:8000/document");
        if (!res.ok) throw new Error(`Error: ${res.statusText}`);
  
        const data = await res.json();
        setDocuments(data.documents);
        console.log(data.documents);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load documents.");
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchDocuments();
    }, []);
  
    // ✅ Fetch chat history
    const fetchChats = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://127.0.0.1:8000/allchats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });
  
        if (!res.ok) throw new Error(`Error: ${res.statusText}`);
  
        const data = await res.json();
        if (data.status_code === 200) {
          const threads = data.data.thread;
          
  
          // Sort chats by timestamp
          threads.sort((a, b) => {
            const lastMsgA = a.messages[a.messages.length - 1]?.timestamp;
            const lastMsgB = b.messages[b.messages.length - 1]?.timestamp;
            return new Date(lastMsgB) - new Date(lastMsgA);
          });
  
          // ✅ Group chats by date
          const grouped = threads.reduce((acc, chat) => {
            const lastMsgTimestamp = chat.messages[chat.messages.length - 1]?.timestamp;
            const lastMsgDate = new Date(lastMsgTimestamp);
  
            let group = "Older";
            if (isToday(lastMsgDate)) group = "Today";
            else if (isYesterday(lastMsgDate)) group = "Yesterday";
            else if (lastMsgDate >= subDays(new Date(), 7)) group = "Last 7 Days";
  
            if (!acc[group]) acc[group] = [];
            acc[group].push(chat);
            return acc;
          }, {});
          const sortedGroups = {};
          ["Today", "Yesterday", "Last 7 Days", "Older"].forEach((key) => {
            if (grouped[key]) {
              sortedGroups[key] = grouped[key];
            }
          });
  
          setGroupedChats(sortedGroups);
        } else {
          throw new Error("No chats found");
        }
      } catch (err) {
        console.error(err.message);
        toast.error("Failed to load chats.");
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchChats();
    }, [username]);
  
    const handleSidebarToggle = () => setSidebarOpen((prev) => !prev);
    const isAdmin = location.state?.isAdmin || localStorage.getItem("isAdmin") === "true";
  
    const handleDashboardRedirect = () => {
      navigate(isAdmin ? "/admin" : "/employee-dashboard", { state: { username, email, isAdmin } });
    };
  
    const handleChatSelect = (chat) => setActiveChat(chat);
  
    // ✅ Rename Chat
    const renameChat = async (chatId, newTitle) => {
      try {
        const res = await fetch("http://127.0.0.1:8000/chat_operations/chats/rename", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, chat_id: chatId, new_title: newTitle }),
        });
  
        if (!res.ok) throw new Error(`Error: ${res.statusText}`);
  
        setGroupedChats((prevGroupedChats) => {
          const updatedGroupedChats = { ...prevGroupedChats };
          for (const group in updatedGroupedChats) {
            updatedGroupedChats[group] = updatedGroupedChats[group].map((chat) =>
              chat.chat_id === chatId ? { ...chat, chat_title: newTitle } : chat
            );
          }
          return updatedGroupedChats;
        });
  
        toast.success("Chat renamed successfully.");
      } catch (err) {
        console.error("Failed to rename chat:", err.message);
        toast.error("Chat rename failed.");
      }
    };
    const handleRename = async (chatId) => {
      if (!newTitle.trim()) {
        setEditingChatId(null); // Exit rename mode if the title is empty
        return;
      }
    
      try {
        await renameChat(chatId, newTitle);
      } finally {
        setEditingChatId(null); // Ensure input box closes only after renaming
      }
    };
    
  
    // ✅ Delete Chat (Functional State Update)
    const deleteChat = async (chatId) => {
      try {
        const res = await fetch("http://127.0.0.1:8000/chat_operations/chats/delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, chat_id: chatId }),
        });
  
        if (!res.ok) throw new Error(`Error: ${res.statusText}`);
  
        // ✅ Correct way to update grouped chats
        setGroupedChats((prevGroupedChats) => {
          const updatedGroupedChats = { ...prevGroupedChats };
          for (const group in updatedGroupedChats) {
            updatedGroupedChats[group] = updatedGroupedChats[group].filter(
              (chat) => chat.chat_id !== chatId
            );
          }
          return updatedGroupedChats;
        });
  
        toast.success("Chat deleted successfully.");
      } catch (err) {
        console.error(err.message);
        toast.error("Failed to delete chat.");
      }
    };
  
    // ✅ Handle New Chat Updates
    const handleNewChatCreated = (newChatData) => {
      setGroupedChats((prevGroupedChats) => {
        const updatedGroupedChats = { ...prevGroupedChats
         };
    
        // Remove temporary chat if it exists
        Object.keys(updatedGroupedChats).forEach((group) => {
          updatedGroupedChats[group] = updatedGroupedChats[group].filter(
            (chat) => chat.chat_id !== newChatData.chat_id

          );
        });
        if (!newChatData.isTemp) {
          Object.keys(updatedGroupedChats).forEach((group) => {
            updatedGroupedChats[group] = updatedGroupedChats[group].filter(
              (chat) => !chat.isTemp
            );
          });
        }
        
    
        // Determine correct group based on timestamp
        const lastMsgTimestamp = newChatData.messages?.[newChatData.messages.length - 1]?.timestamp;
        const lastMsgDate = lastMsgTimestamp ? new Date(lastMsgTimestamp) : new Date();
    
        let group = "Older";
        if (isToday(lastMsgDate)) group = "Today";
        else if (isYesterday(lastMsgDate)) group = "Yesterday";
        else if (lastMsgDate >= subDays(new Date(), 7)) group = "Last 7 Days";
    
        // Ensure the group exists
        if (!updatedGroupedChats[group]) updatedGroupedChats[group] = [];
    
        // Add new chat at the top of its group
        updatedGroupedChats[group].unshift(newChatData);
    
        return updatedGroupedChats;
      });
    
      // If this chat is active, update activeChat
      
        setActiveChat(newChatData);
      
    };    
    

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden font-inter">
      {/* Top Strip */}
      <div className="w-full bg-[#3B63F3] text-white text-left py-2 px-4 font-bold flex items-center font-rubik">
        <button
          className="text-white mr-4 md:hidden"
          onClick={handleSidebarToggle}
        >
          <FaBars size={24} />
        </button>
        HR Chatbot
      </div>
      {/* ✅ Add ToastContainer here */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      
      {/* Your existing component code */}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left Section - Chat List */}
        <div
          className={`fixed z-20 md:relative transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } md:translate-x-0 w-3/4 md:w-1/5 h-full bg-white flex flex-col`}
        >
          {/* Header */}
          <div className="flex items-center gap-2 p-4 mb-2 mt-2 bg-white ">
            <img src={logo} alt="HR Nexus Logo" className="h-8 w-8" />
            <h2 className="font-rubik text-[22px] font-black text-[#3B63F3] leading-normal">
              HR NEXUS
            </h2>
          </div>

          {/* Search & Reload */}
          <div className="mt-4 px-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Chats</h2>
              <button onClick={handleNewChatClick} className="text-blue-500 hover:text-blue-600">
  <img src={reloadIcon} alt="Reload" className="h-6 w-6" />
</button>
            </div>
            <div className="relative w-full mt-2">
              {/* Search Icon */}
              <img
                src={searchIcon}
                alt="Search"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
              />

              {/* Search Input */}
              <input
                type="text"
                placeholder="Search chats"
                className="w-full p-2 pl-10 border border-[#E5E5E5] rounded-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Chat List  */}
          <div className="flex-1 overflow-y-auto custom-scrollbar  mt-4 relative">
            {Object.keys(groupedChats).map((group) => {
              const filteredChats = groupedChats[group].filter((chat) =>
                chat.chat_title?.toLowerCase().includes(searchQuery.toLowerCase())
              );

              if (filteredChats.length === 0) return null;

              return (
                <div key={group}>
                  <h3 className="text-sm text-gray-400 uppercase mt-3 px-4">{group}</h3>

                  {filteredChats.map((chat) => (
                    <div key={chat.chat_id} className="relative flex items-center w-full">
                      {/* Active Chat Indicator - Positioned at the absolute left */}
                      {chat.chat_id === activeChat?.chat_id && (
                        <span className="absolute left-0 w-2 h-full bg-blue-700 "></span>
                      )}

                      {/* Wrapped Chat Button inside another div with padding */}
                      <div className="flex-1 pl-4 pr-2 py-1.5 rounded-md cursor-pointer transition-all duration-300 w-full">
                        <div
                          className={`p-2 pr-8 rounded-md w-full flex flex-col gap-1 ${chat.chat_id === activeChat?.chat_id
                              ? "bg-blue-500 text-white"
                              : "bg-white hover:bg-gray-100 text-black"
                            }`}
                        
                          onClick={() => handleChatSelect(chat)}
                        >
                          {editingChatId === chat.chat_id ? (
  <input
    type="text"
    value={newTitle}
    className="w-full p-1 bg-white focus:outline-none"
    onChange={(e) => setNewTitle(e.target.value)}
    onBlur={() => handleRename(chat.chat_id)}
    onKeyDown={(e) => {
      if (e.key === "Enter") handleRename(chat.chat_id);
      else if (e.key === "Escape") setEditingChatId(null);
    }}
    autoFocus
  />
) : (
  <p
    className="overflow-hidden whitespace-nowrap truncate pr-12 text-[15px]"
    onDoubleClick={() => {
      setEditingChatId(chat.chat_id);
      setNewTitle(chat.chat_title || ""); // Ensure correct value
    }}
  >
    {chat.chat_title || "No messages yet"}
  </p>
)}
{editingChatId !== chat.chat_id && (  
<>                          {/* Menu Button */}
                          <Menu>
                            <MenuHandler>
                              <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
                                <img src={dots} alt="Options" className="h-4 w-4 mr-12 mt-1.5" />
                              </button>
                            </MenuHandler>
                            <MenuList className="z-50 bg-white shadow-lg border border-gray-300">
                              <MenuItem onClick={() => setEditingChatId(chat.chat_id)}>Rename</MenuItem>
                              <MenuItem onClick={() => deleteChat(chat.chat_id)}>Delete</MenuItem>
                            </MenuList>
                          </Menu>
                          </>

                        )}
                        </div>


                      </div>

                      {/* Menu Button */}

                    </div>
                  ))}
                </div>
              );
            })}

            {/* No Chat Found Message */}
            {Object.keys(groupedChats).every(
              (group) =>
                groupedChats[group].filter((chat) =>
                  chat.chat_title?.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0
            ) && (
                <div className="text-center text-gray-500 mt-4 ">                       <div className="flex justify-center items-center ">
             <Spinner className="h-6 w-6 text-gray align-center" />
</div>
</div>
              )}
          </div>

          {/* Bottom Buttons - More Left Space */}
          <div className="flex flex-col items-start gap-2 px-6 mt-6 border-t pt-4">
            <button
              onClick={handleDashboardRedirect}
              className="py-3 pl-6 w-full text-gray-800 text-left hover:bg-gray-100 rounded-md transition pl-4"
            >
              {isAdmin ? "Dashboard" : "Dashboard"}
            </button>
            <button className="py-2 pl-6 w-full text-gray-800 text-left hover:bg-gray-100 rounded-md transition pl-4">
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="py-2 pl-6 w-full text-gray-800 text-left hover:bg-gray-100 rounded-md transition pl-4"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Middle Section - Chat Content */}
        <div className="flex-1 p-4 overflow-y-auto scrollbar-hide relative mt-20 pb-20">
  {!activeChat ? (
    <div className="flex flex-col items-center justify-center h-full text-center relative">
      <h1 className="text-4xl font-bold text-gray-700 mb-8">How Can I Assist You Today?</h1>

      {/* Centered NewChat component initially */}
      <div className={`transition-all duration-300 ${querySubmitted ? "absolute bottom-0 left-0 w-full md:w-3/5 md:left-auto" : ""}`}>
        <NewChat 
          username={username} 
          email_id={email} 
          onNewChatCreated={(chat) => {
            handleNewChatCreated(chat);
            setQuerySubmitted(true);  // Move the chat box down after submission
          }} 
          selectedDocuments={selectedDocuments} 
          querySubmitted={querySubmitted} // Pass this prop to control UI
        />
      </div>
    </div>
  ) : (
    <div>
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 scrollbar-hide" >
        {activeChat.messages && activeChat.messages.length > 0 ? (
          activeChat.messages.map((message, index) => (
            <div
              key={`message-${index}`}
              className={`flex items-center ${message.sender === "user" ? "justify-end" : "justify-start"} mb-4`}
            >
              {message.sender === "bot" && (
                <img
                  src={logo}
                  alt="Bot Logo"
                  className=" bottom-0 w-10 h-10 rounded-full mr-4"
                />
              )}
              <div
                className={`p-4 rounded-lg ${message.sender === "user"
                    ? "bg-[#F3F5FF] text-black border-r-31 m-4 p-4 px-8"
                    : "bg-white text-black"
                  }`}
                style={{ maxWidth: "85%", borderRadius: "31.5px" }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]} >
                  {message.content}
                </ReactMarkdown>
                {message.isLoading && (
                  <div className="mt-2 flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
                  </div>
                )}
              </div>
              {message.sender === "user" && (
                <img
                  src={userPhoto}
                  alt="User Photo"
                  className="w-10 h-10 rounded-full ml-4"
                />
              )}
                          <div ref={messagesEndRef} />

            </div>
          ))
        ) : (
          <p>No messages yet in this chat.</p>
        )}
      </div>

      <div className="fixed rounded-[20px] border border-[#CBCBCB] bottom-0 left-0 w-3/5 ml-96 bg-[#F9F9F9] p-4 flex items-center b-1 gap-2">
        <input
          type="text"
          placeholder="Enter your query"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (activateChatRef.current) {
                activateChatRef.current.click();
              }
            }
          }}
          className=" p-2 w-full bg-[#F9F9F9]"
        />
        <ActivateChat
          ref={activateChatRef}// Clear the input after sending the query
          username={username}
          email_id={email} // Pass email_id here
          chatId={activeChat.chat_id}
          queryText={queryText}
          setActiveChat={(updatedChat) => {
            setActiveChat(updatedChat);
            setQueryText(""); 
          }}
        />
      </div>
    </div>
  )}
</div>


        {/* Right Section */}
        <div className="hidden md:flex w-1/5 flex-col p-4">
          {/* User Info */}
          <div className="flex items-center w-full mb-4">
            <div className="relative flex items-center justify-center p-2 border-2 border-white rounded-full shadow-lg mr-4">
              <button
                onClick={toggleNotifications}
                className="relative flex items-center justify-center border-white rounded-full m-1"
                >
                <FaBell className="text-2xl" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 inline-block w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotificationOpen && (
                <div ref={notificationRef} className="absolute right-0 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                  <div className="p-4">
                    <h4 className="font-bold mb-2">Notifications</h4>
                    {notifications.length === 0 ? (
                      <p className="text-gray-600">No new notifications</p>
                    ) : (
                      <ul>
                        {notifications.map((notification, index) => (
                          <li key={index} className="text-sm text-gray-700 mb-2 hover:bg-gray-100 rounded cursor-point"
                          onClick={() => handleNotificationClick(notification)}
>
                            {notification.message}
                          </li>
                        ))}  
                     
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>

            <img src={userPhoto} alt="User" className="w-16 h-16 rounded-full mr-4" />
            <div className="flex flex-col">
              <h3 className="text-lg font-bold">{username}</h3>
              <p className="text-gray-600">{email}</p>
            </div>
          </div>
          {/* Document List Section */}
          {!activeChat && (
            <div className="relative w-full max-w-sm mx-auto">
              {/* Card Container */}
              <div className="bg-white  rounded-lg  px-2 py-1  mx-8 border border-gray-200">
                {/* Select Box */}
                <div
                  className={`w-full p-2  bg-white flex justify-between items-center cursor-pointer  transition-all ${isOpen ? "" : ""
                    }`}
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <span className="ml-2 text-gray-500">Files</span>
                  <div className="rounded-full inline-flex items-center mr-2 justify-center border border-red-600">
  <ChevronDownIcon className="h-5 w-5 text-red-500" />
</div>            </div>

                {/* Dropdown Content (Search & Selected Files) */}
                <div
                  className={`transition-all duration-200 ${isOpen ? "opacity-100 scale-100 mt-2" : "opacity-0 scale-95 hidden"
                    }`}
                >
                  {/* Searchable Select */}
                 <Select
                   key={selectedDocuments.length} // Force re-render on selection change
  options={documentOptions}
  onChange={handleDocumentSelect}
  placeholder="Search files..."
  isSearchable
  isMulti
  value={selectedDocuments}  // Now correctly reflects actual selections
  noOptionsMessage={() => "No documents found"}
  className="mt-5 mb-4"
  components={{
    MultiValue: () => null,  // Hide pills in input
    IndicatorSeparator: () => null,
    placeholder: () => "Search files..."
  }}
  closeMenuOnSelect={false}  // Keep dropdown open for multi-select
/>

                  {/* Selected Documents (Only Visible When Dropdown is Open) */}
               {/* Selected Documents (Only Visible When Dropdown is Open) */}
{selectedDocuments.length > 0 && (
  <div className="my-4">
    <h3 className="text-sm text-gray-500 mb-1">Selected Files:</h3>
    <div className="space-y-2">
      {selectedDocuments.map((doc) => (
        <div key={doc.value} className="flex items-center space-x-2 text-gray-800 text-sm">
          <img src={pdfIcon} alt="PDF Icon" className="h-4 w-4" /> {/* PDF Icon */}
          <span>{doc.label}</span>
        </div>
      ))}
    </div>
  </div>
)}

                </div>
              </div>
            </div>
          )}


          {activeChat?.document_ids?.length > 0 && (
            <div className="mt-6 flex justify-center">
              <div className="w-72 bg-white shadow-lg rounded-lg p-4">
                <h4 className="font-bold mb-2 text-gray-900">Files Selected</h4>
                <ul className="space-y-2">
                  {documents
                    .filter(doc => activeChat.document_ids.includes(doc.document_id))
                    .map((doc) => (
                      <li key={doc.document_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200 transition">
                        <img src={pdfIcon} alt="PDF Icon" className="w-6 h-6" />
                        <a
                          href={doc.file_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-black-600 hover:underline text-sm"
                        >
                          {doc.file_name}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>

  );
};
export default ChatScreen;