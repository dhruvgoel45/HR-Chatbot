import React from 'react';
import logo from "../assets/images/logo.png";
import { FaBell } from "react-icons/fa";
import userPhoto from "../assets/images/user.png";


const Navbar = () => {
    const handleSearch = (query) => {
        console.log("Searching for:", query);
        // Implement your search logic here, such as filtering projects or pages
      };
    
      return (
    
               <nav className="fixed top-0 left-0 w-full z-10  bg-white">
               <div className="flex items-center h-20 px-10">
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
                   <h3 className="text-lg font-bold">User5</h3>
                   <p className="text-gray-600">user@example.com</p>
                   </div>
                 </div>
               </div>
             </nav>
    );
};

export default Navbar;