import React from "react";
import ReactDOM from "react-dom/client";
import ChatBot from "./Chatbot"
import "./index.css";
import { registerLicense } from '@syncfusion/ej2-base';

registerLicense('Ngo9BigBOggjHTQxAR8/V1NMaF1cXmhKYVJzWmFZfVtgdVRMYVtbR35PIiBoS35Rc0VhWHxcc3VSQmBZWUV+');


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChatBot />
  </React.StrictMode>
);
