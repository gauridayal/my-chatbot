import { useState, useRef, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: "model", content: "Hi! I'm your AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message to the chat display
    const updatedMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // Send to backend (exclude first greeting from history)
      const history = updatedMessages.slice(1, -1).map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await axios.post(`${BACKEND_URL}/chat`, {
        messages: history,
        user_message: userMessage
      });

      const botReply = response.data.reply;
      setMessages(prev => [...prev, { role: "model", content: botReply }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: "model",
        content: "Sorry, something went wrong. Please try again."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header">
          <div className="header-dot" />
          <span className="header-title">AI Assistant</span>
          <span className="header-status">online</span>
        </div>

        {/* Messages */}
        <div className="messages-area">
          {messages.map((msg, i) => (
            <div key={i} className={`message-row ${msg.role === "user" ? "user-row" : "bot-row"}`}>
              {msg.role === "model" && <div className="avatar bot-avatar">AI</div>}
              <div className={`bubble ${msg.role === "user" ? "user-bubble" : "bot-bubble"}`}>
                {msg.content}
              </div>
              {msg.role === "user" && <div className="avatar user-avatar">You</div>}
            </div>
          ))}

          {loading && (
            <div className="message-row bot-row">
              <div className="avatar bot-avatar">AI</div>
              <div className="bubble bot-bubble typing-bubble">
                <span className="dot" /><span className="dot" /><span className="dot" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="input-area">
          <textarea
            className="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send)"
            rows={1}
            disabled={loading}
          />
          <button
            className={`send-btn ${loading ? "disabled" : ""}`}
            onClick={sendMessage}
            disabled={loading}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}