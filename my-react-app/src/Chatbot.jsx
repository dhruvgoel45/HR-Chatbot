import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import UsernameScreen from "./pages/UsernameScreen";
import ChatScreen from "./pages/ChatScreen";
import AdminPage from "./pages/AdminPage";
import EmployeeDashboardPage from "./pages/EmployeeDashboardPage";
import PolicyDocumentsPage from "./components/PolicyDocumentsPage";

const ChatBot = () => {
  const isUsernameEntered = !!localStorage.getItem("username");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  return (
    <Router>
      <Routes>
        {/* Redirect to login as the default route */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login Screen */}
        <Route path="/login" element={<UsernameScreen />} />

        {/* Chat Screen */}
        <Route
          path="/chat"
          element={isUsernameEntered ? <ChatScreen /> : <Navigate to="/login" />}
        />

        {/* Employee Dashboard */}
        <Route
          path="/employee-dashboard"
          element={isUsernameEntered ? <EmployeeDashboardPage /> : <Navigate to="/login" />}
        />

        {/* Policy Documents */}
        <Route
          path="/policy-documents"
          element={isUsernameEntered ? <PolicyDocumentsPage /> : <Navigate to="/login" />}
        />

        {/* Admin Page */}
        <Route
          path="/admin"
          element={isUsernameEntered ? <AdminPage /> : <Navigate to="/login" />}
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default ChatBot;
