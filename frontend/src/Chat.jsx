import { useState, useRef, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const QUICK_CHIPS = [
  "How many leaves do I get?",
  "What does medical insurance cover?",
  "Can I work from home?",
  "How do I claim a comp off?",
  "What is the notice period?",
  "How do I refer someone?",
  "Can I get a salary advance?",
  "What is the attire policy?",
];

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: "model",
      content: "Hello! I'm **Neha**, NEC India's HR Assistant 👋\n\nI can help you with any HR policy — leaves, insurance, WFH, benefits, and more. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chipsVisible, setChipsVisible] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userMessage = (text || input).trim();
    if (!userMessage || loading) return;
    setInput("");
    setChipsVisible(false);

    const updatedMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const history = updatedMessages.slice(1, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await axios.post(`${BACKEND_URL}/chat`, {
        messages: history,
        user_message: userMessage,
      });

      setMessages((prev) => [...prev, { role: "model", content: response.data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "I'm having trouble connecting right now. Please try again in a moment." },
      ]);
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

  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");
  };

  return (
    <div className="page">
      <div className="chat-card">

        {/* Header */}
        <div className="chat-header">
          <div className="header-left">
            <div className="nec-logo-mark">NEC</div>
            <div className="header-text">
              <span className="header-title">HR Assistant — Neha</span>
              <span className="header-sub">NEC India · Human Resources</span>
            </div>
          </div>
          <div className="header-status">
            <span className="status-dot" />
            Online
          </div>
        </div>

        {/* Messages */}
        <div className="messages-area">
          {messages.map((msg, i) => (
            <div key={i} className={`message-row ${msg.role === "user" ? "user-row" : "bot-row"}`}>
              {msg.role === "model" && (
                <div className="avatar bot-avatar">HR</div>
              )}
              <div
                className={`bubble ${msg.role === "user" ? "user-bubble" : "bot-bubble"}`}
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
              />
              {msg.role === "user" && (
                <div className="avatar user-avatar">You</div>
              )}
            </div>
          ))}

          {/* Quick chips — show only at start */}
          {chipsVisible && (
            <div className="chips-row">
              {QUICK_CHIPS.map((chip, i) => (
                <button key={i} className="chip" onClick={() => sendMessage(chip)}>
                  {chip}
                </button>
              ))}
            </div>
          )}

          {loading && (
            <div className="message-row bot-row">
              <div className="avatar bot-avatar">HR</div>
              <div className="bubble bot-bubble typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="input-area">
          <textarea
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about any NEC India HR policy..."
            rows={1}
            disabled={loading}
          />
          <button
            className={`send-btn ${loading ? "disabled" : ""}`}
            onClick={() => sendMessage()}
            disabled={loading}
          >
            Send
          </button>
        </div>

        {/* Footer */}
        <div className="chat-footer">
          NEC India · HR Policy Assistant · For official policy queries contact hr@necindia.in
        </div>

      </div>
    </div>
  );
}