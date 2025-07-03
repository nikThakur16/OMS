import { useEffect, useState, useRef } from "react";
import socket from "@/utils/socket";

export default function ChatBox({ chatId, userId, messages,name }:{chatId: string, userId: string, messages: any[], name: string}) {
  const [realtimeMessages, setRealtimeMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setRealtimeMessages([]); // Clear on chat change
    socket.emit("join_chat", chatId);
    socket.on("receive_message", (msg) => {
      setRealtimeMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.emit("leave_chat", chatId);
      socket.off("receive_message");
    };
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, realtimeMessages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = { chatId, sender: userId, content: input };
    socket.emit("send_message", msg);
    setInput("");
  };

  const allMessages = [...messages, ...realtimeMessages];

  return (
    <div style={{
      background: "#fff",
      borderRadius: "16px",
      boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      padding: "0",
      minHeight: "500px",
      maxWidth: "700px",
      margin: "32px auto",
      display: "flex",
      flexDirection: "column",
      height: "70vh"
    }}>
      {/* Chat header */}
      <div style={{
        padding: "18px 24px",
        borderBottom: "1px solid #e0e0e0",
        fontWeight: "bold",
        fontSize: "1.2rem",
        color: "#1976d2",
        background: "#f5faff",
        borderTopLeftRadius: "16px",
        borderTopRightRadius: "16px"
      }}>
        {name || "Chat Room"}
        
      </div>
      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "24px",
        background: "#f9fafd",
        display: "flex",
        flexDirection: "column"
      }}>
        {allMessages.length === 0 && (
          <div style={{ color: "#888", textAlign: "center", marginTop: "40px" }}>
            No messages yet. Start the conversation!
          </div>
        )}
        {allMessages.map((m, i) => {
          const senderId = typeof m.sender === "string" ? m.sender : m.sender?._id;
          const isMe = senderId === userId;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
                marginBottom: "10px"
              }}
            >
              <div className="font-semibold" style={{
                background: isMe ? "#04567B" : "#e0e0e0",
                color: isMe ? "#fff" : "#222",
                borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                padding: "10px 18px",
                maxWidth: "60%",
                
                fontSize: "1rem",
                boxShadow: isMe ? "0 2px 8px rgba(25,118,210,0.08)" : "0 2px 8px rgba(0,0,0,0.04)",
                wordBreak: "break-word",
                border: isMe ? "1px solid #1976d2" : "1px solid #e0e0e0"
              }}>
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {/* Input */}
      <div style={{
        borderTop: "1px solid #e0e0e0",
        padding: "18px 24px",
        background: "#f5faff",
        borderBottomLeftRadius: "16px",
        borderBottomRightRadius: "16px"
      }}>
        <form
          style={{ display: "flex", gap: "12px" }}
          onSubmit={e => { e.preventDefault(); sendMessage(); }}
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            style={{
              flex: 1,
              borderRadius: "24px",
              border: "1px solid #cfd8dc",
              padding: "12px 18px",
              fontSize: "1rem",
              outline: "none",
              background: "#fff"
            }}
            placeholder="Type your message..."
          />
          <button
            type="submit"
            style={{
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: "24px",
              padding: "0 28px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
              transition: "background 0.2s"
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}