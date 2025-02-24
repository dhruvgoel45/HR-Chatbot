import React, { forwardRef, useState } from "react";

const ActivateChat = forwardRef(({ username, chatId, queryText, setActiveChat, email_id },ref) => {
  const [isLoading, setIsLoading] = useState(false);

  const activateExistingChat = async () => {
    if (!queryText) {
      alert("Please enter a query.");
      return;
    }

    if (!chatId) {
      console.error("No chat_id provided");
      return;
    }

    setIsLoading(true);
    const timestamp = new Date().toISOString();

    // Create temporary message with unique ID
    const tempBotMessageId = `temp-${Date.now()}`;
    const tempBotMessage = {
      id: tempBotMessageId,
      sender: "bot",
      content: "",
      timestamp,
      isLoading: true,
    };

    // Update chat with temporary bot message
    setActiveChat((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          sender: "user",
          content: queryText,
          timestamp,
        },
        tempBotMessage,
      ],
    }));

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          query_text: queryText,
          chat_id: chatId,
          email_id,
          new_chat: false,
        }),
      });

      if (!res.ok) throw new Error(res.statusText);

      // Read metadata from headers
      const documentIdsHeader = res.headers.get("X-Document-IDs");
      const documentIds = documentIdsHeader ? documentIdsHeader.split(",") : [];

      // Handle streaming response
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
              botContent += parsed.content;
            } catch (err) {
              console.error("JSON Parse Error:", err);
            }
          });
        }

        // Update the temporary bot message incrementally
        setActiveChat((prev) => ({
          ...prev,
          messages: prev.messages.map((msg) =>
            msg.id === tempBotMessageId
              ? { ...msg, content: botContent, isLoading: false }
              : msg
          ),
          document_ids: [...new Set([...prev.document_ids, ...documentIds])],
        }));
      }

    } catch (err) {
      console.error("Error:", err);
      // Update with error message
      setActiveChat((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) =>
          msg.id === tempBotMessageId
            ? { ...msg, content: "Error retrieving response.", isLoading: false }
            : msg
        ),
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      ref={ref}
      onClick={activateExistingChat}
      disabled={isLoading}
      className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-6 h-6 text-blue-500"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
        />
      </svg>
    </button>
  );

});

export default ActivateChat;
