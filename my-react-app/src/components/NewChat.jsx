import React, { useState, useRef, useEffect } from "react";

const NewChat = ({ username, onNewChatCreated, email_id, selectedDocuments }) => {
  const [queryText, setQueryText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fullBotContent, setFullBotContent] = useState(""); // State to hold the complete bot response
  const [isStreaming, setIsStreaming] = useState(false); // State to track streaming
  
  




  const handleNewChatSubmit = async (e) => {
    e.preventDefault();
    if (!queryText.trim()) return;
    setError("");
    setIsLoading(true);

    const timestamp = new Date().toISOString();
    const tempChatId = `temp-${Date.now()}`;

    const tempChat = {
      chat_id: tempChatId,
      chat_title: queryText,
      messages: [
        {
          sender: "user",
          content: queryText,
          timestamp,
        },
        {
          sender: "bot",
          content: "",
          timestamp,
          isLoading: true,
        },
      ],
      is_active: true,
      isTemp: true,
    };

    onNewChatCreated(tempChat);

    console.log("selectedDocuments", selectedDocuments);

    try {
      const documentIds = selectedDocuments.map((doc) => doc.value).join(",");
      console.log("documentIds", documentIds);
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          query_text: queryText,
          new_chat: true,
          email_id,
          document_ids: documentIds,
        }),
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.statusText}`);
      }

      const chatId = res.headers.get("X-Chat-ID") || res.headers.get("x-chat-id");
      console.log("chatId", chatId);
      const chatTitle = res.headers.get("x-chat-title");
      const documentIdsHeader = res.headers.get("x-document-ids") || res.headers.get("X-Document-Ids");
      console.log("documentIdsHeader", documentIdsHeader);
      const documentIdsArray = documentIdsHeader ? documentIdsHeader.split(",") : [];

      const realChat = {
        chat_id: chatId,
        chat_title: chatTitle,
        messages: [
          {
            sender: "user",
            content: queryText,
            timestamp,
          },
          {
            sender: "bot",
            content: "",
            timestamp,
            isLoading: true,
          },
        ],
        document_ids: documentIdsArray,
        is_active: true,
        isTemp: false, // Not a temp chat

        
      };

      onNewChatCreated(realChat);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let botContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        // Extract only content values
        const parsedChunks = chunk.match(/\{"type":\s*"text",\s*"content":\s*"(.*?)"\}/g);
        if (parsedChunks) {
          parsedChunks.forEach((jsonChunk) => {
            try {
              const parsed = JSON.parse(jsonChunk);
              botContent += parsed.content.replace(/\n\n/g, "\n"); // Use "\n" for plain text
            } catch (err) {
              console.error("JSON Parse Error:", err);
            }
          });
        }

        onNewChatCreated({
          chat_id: chatId,
          chat_title: chatTitle,
          messages: [
            {
              sender: "user",
              content: queryText,
              timestamp,
            },
            {
              sender: "bot",
              content: botContent,
              timestamp: new Date().toISOString(),
              isLoading: false,
            },
          ],
          document_ids: documentIdsArray,
          is_active: true,
        });
      }

      setQueryText("");
    } catch (err) {
      console.error("Error:", err.message);
      setError(err.message);
      // onNewChatCreated({ chat_id: tempChatId, remove: true });
    } finally {
      setIsLoading(false);
    }
  };
  const suggestedQuestions = [
    "How does this platform work?",
    "What are the pricing plans?",
    "Can I integrate with third-party apps?",
    "How do I reset my password?"
  ];

  return (
    <form onSubmit={handleNewChatSubmit} className="w-full pt-20">
      <div
        style={{
          display: "flex",
          width: "100%",
          borderRadius: "10px",
          border: "1px solid #CBCBCB",
          background: "#F9F9F9",
        }}
      >
        <input
          type="text"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleNewChatSubmit(e);
            }
          }}
          required
          style={{
            flex: "1",
            padding: "10px 15px",
            border: "none",
            outline: "none",
            background: "#F9F9F9",
            borderRadius: "20px 0 0 20px",
          }}
          placeholder="Type your query..."
        />
        <button
          type="submit"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            borderRadius: "0 20px 20px 0",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <line x1="12" y1="5" x2="12" y2="19"></line>
          </svg>
        </button>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          borderRadius: "10px",
          background: "white"
        }} className="pt-4"
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              type="button"  // Add this line

              onClick={() => {
                setQueryText(question);
                // Optional: Auto-submit when clicking suggestion
                handleNewChatSubmit(new Event('submit')); 
              }}              style={{
                flex: "1",
                margin: "0 5px",
                padding: "8px 10px",
                borderRadius: "10px",
                border: "1px solid #CBCBCB",
                background: "#F9f9f9",
                cursor: "pointer",
                textAlign: "center"
              }}
            >
              {question}
            </button>
          ))}
        </div>

      </div>
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </form>

  );
};

export default NewChat;
