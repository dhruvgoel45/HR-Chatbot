# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
ChatBot Frontend Project

This is a React-based frontend project for a chatbot application. It allows users to view and interact with their chat sessions. The application supports creating new chats, viewing existing chats, and sending queries to activate closed chats.

Features

User Authentication: Users can log in using their username.

View Chats: Displays a list of all chat sessions associated with the logged-in user.

Create New Chat: Users can start a new chat session.

Activate Existing Chats: Users can activate closed chats by entering a query.

Dynamic UI: The application updates dynamically based on user actions.

Prerequisites

To run this project, ensure you have the following installed:

Node.js (v14 or later)

npm or yarn

Getting Started

Follow these steps to set up and run the project locally:

1. Clone the Repository

git clone <repository-url>
cd <repository-folder>

2. Install Dependencies

Use npm or yarn to install the required packages:

npm install
# or
yarn install

3. Start the Development Server

Run the following command to start the development server:

npm start
# or
yarn start

The application will be accessible at http://localhost:3000 in your web browser.

Project Structure

The project is structured as follows:

src/
├── components/
│   ├── ChatBot.jsx      # Main ChatBot component
│   ├── NewChat.jsx      # Component for creating new chats
├── App.js               # Main entry point for the app
├── index.js             # Renders the React app

Key Components

ChatBot.jsx: Handles the main UI and functionality for displaying and interacting with chats.

NewChat.jsx: Provides a form for creating new chat sessions.

API Integration

The frontend communicates with a backend server via the following endpoints:

1. Fetch All Chats

URL: http://127.0.0.1:8000/allchats

Method: POST

Body:

{
  "username": "<username>"
}

2. Activate Chat

URL: http://127.0.0.1:8000/chat

Method: POST

Body:

{
  "username": "<username>",
  "query_text": "<query>",
  "chat_id": "<chat-id>",
  "new_chat": false
}

3. Create New Chat

URL: http://127.0.0.1:8000/chat

Method: POST

Body:

{
  "username": "<username>",
  "query_text": "<query>",
  "new_chat": true
}

