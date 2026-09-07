"use client";

import React, { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatbotProps {
  portalType: "doctor" | "user";
  contextData?: any;
}

export const ChatbotWidget: React.FC<ChatbotProps> = ({
  portalType,
  contextData,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content:
        portalType === "doctor"
          ? "Hello Doctor! How can I assist you with your schedule or patients today?"
          : "Hello! How can I help you with your appointments or prescriptions today?",
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  const sendMessage = async (e?: React.FormEvent) => {
  if (e) e.preventDefault();
  if (!input.trim() || loading) return;

  const userMessage: Message = {
    id: Date.now().toString(),
    role: "user",
    content: input.trim(),
  };

  const updated = [...messages, userMessage];
  setMessages(updated);
  setInput("");
  setLoading(true);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: updated,
        portalType,
        context: contextData,
      }),
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error || "Failed to fetch response");
    }

    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
      },
    ]);
  } catch (err) {
    console.error("Chatbot Error:", err);
    // Show error toast or state
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center justify-center"
        >
          💬
        </button>
      )}

      {isOpen && (
        <div
          className={`bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-2xl flex flex-col ${
            isMinimized ? "h-12 w-64" : "h-[450px] w-80 sm:w-96"
          }`}
        >
          <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center font-semibold text-sm">
            <span>{portalType === "doctor" ? "Doctor AI" : "Patient AI"}</span>
            <div className="flex gap-2">
              <button onClick={() => setIsMinimized(!isMinimized)}>
                {isMinimized ? "▲" : "━"}
              </button>
              <button onClick={() => setIsOpen(false)}>✕</button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="flex-1 p-3 overflow-y-auto space-y-2 text-sm bg-gray-50 dark:bg-gray-900">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-2 rounded-lg ${
                        m.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="text-xs text-gray-500 animate-pulse">
                    AI is thinking...
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={sendMessage} className="p-2 border-t flex gap-2">
                <input
                  className="flex-1 border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-3 py-1 text-sm rounded disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};