import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"; // Import Eye Icons
import adminLoginBg from "../assets/images/login.png"; // Background Image
import loginScreenImg from "../assets/loginscreen.svg"; // Right section image

const UsernameScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Password visibility toggle
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.status === "success") {
        const { username, is_admin, email } = data.data;

        localStorage.setItem("username", username);
        localStorage.setItem("email", email);
        localStorage.setItem("is_admin", is_admin ? "true" : "false");

        navigate("/chat", { state: { username, email, isAdmin: is_admin } });
      } else {
        setError(data.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("An error occurred while logging in. Please try again later.");
    }
  };

  return (
    <div
      className="flex w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${adminLoginBg})`, backgroundSize: "cover" }} // Adjust Background
    >
      {/* Left Section - Login Box */}
      <div className="w-5/12 h-full bg-white flex items-center justify-center">
        <div className="w-full text-left max-w-md ">
          {/* Employee Login Title */}
          <h1 className="text-black text-[48px] font-bold leading-normal font-[Poppins]">
  Employee Login
</h1>
<p className="text-[rgba(0,0,0,0.70)] text-[16px] font-medium leading-normal font-[Poppins] mb-6">
  Enter your details
</p>

          {/* Email Input */}
         {/* Email Input */}
<div className="mb-4">
  <input
    type="email"
    placeholder="Email Address"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="border-b border-gray-300 p-2 w-full 
               text-[rgba(0,0,0,0.85)] text-[16px] font-normal 
               leading-normal font-[Poppins] outline-none"
  />
</div>

{/* Password Input with Eye Toggle */}
<div className="mb-4 relative">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="border-b border-gray-300 p-2 w-full 
               text-[rgba(0,0,0,0.85)] text-[16px] font-normal 
               leading-normal font-[Poppins] outline-none"
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-3 text-gray-500"
  >
    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
  </button>
</div>


          {/* Forgot Password (Centered) */}
          <div className="text-center mb-8">
            <a href="#" className="text-gray-500 hover:underline">Forgot Password?</a>
          </div>

          {/* Login Button */}
          <button
  onClick={handleLogin}
  className="w-full px-4 py-2 bg-[#3B63F3] text-white 
             rounded-[12px] hover:bg-[#2C4BCC] transition duration-300"
>
  Login
</button>

          {/* Error Message */}
          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        </div>
      </div>

      {/* Right Section - Info & Image */}
     {/* Right Section - Info & Image */}
     <div className="w-1/2 h-full flex flex-col justify-center text-white p-10 m-4">
  {/* Text Section with 1-column left margin */}
  <div className="ml-[17.33%]">
    {/* "Welcome to" Text */}
    <h1 className="text-[#FFF] text-[80px] font-[Poppins] font-bold leading-[70px]">
      Welcome to
    </h1>

    {/* "HR Nexus" Text */}
    <h2 className="text-[#FFF] text-[80px] font-[Poppins] font-normal leading-[70px]">
      HR Nexus
    </h2>

    {/* Paragraph */}
    <p className="text-[#FFF] text-[16px] font-[Poppins] font-medium leading-normal max-w-lg">
      Your all-in-one HR assistant, here to help with everything from leave policies and benefits 
      to payroll, onboarding, and more.
    </p>
  </div>

  {/* Image with 1.5-column margins on each side */}
  <div className="flex justify-center w-full mt-6">
    <img src={loginScreenImg} 
         alt="Login Screen Illustration" 
         className="w-full h-auto mx-[12.5%]" />
  </div>
</div>


    </div>
  );
};

export default UsernameScreen;
