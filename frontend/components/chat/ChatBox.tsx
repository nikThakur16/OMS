import { useEffect, useState, useRef } from "react";
import socket from "@/utils/socket";
import { formatToUserTimeZone } from "@/utils/time/Time&Date";

export default function ChatBox({
  chatId,
  userId,
  messages,
  name,
  onClick
}: {
  chatId: string;
  userId: string;
  messages: any[];
  name: string;
  onClick?: () => void;
}) {
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
    const msg = {
      chatId,
      sender: userId,
      content: input,
    };
    socket.emit("send_message", msg);
    setInput("");
  };

  const allMessages = [...messages, ...realtimeMessages];

  return (
    <div
      className="bg-white "
      style={{
        borderRadius: "16px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        padding: "0",
        minHeight: "100%",
        maxWidth: "100%",

        display: "flex",
        flexDirection: "column",
        height: "70vh",
      }}
    >
      {/* Chat header */}
      <div
        className="flex items-center justify-between"
        style={{
          background: "#f5faff",
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",

          boxShadow: "0 4px 8px 0 rgba(0,0,0,0.15)",
          padding: "18px 24px",
          fontWeight: "bold",
          fontSize: "1.2rem",
          color: "#111111",
          zIndex: 10,
        }}
      >
        <div className="flex items-center gap-4">
          <img
            height={43}
            width={43}
            className="rounded-full"
            src="/images/cat.jpg"
            alt="cat"
          />{" "}
          <div className="flex flex-col">
            <span>{name}</span>{" "}
            <span className="font-medium text-sm text-gray-700">
              Last seen 3 Jun at 04:21 PM
            </span>
          </div>
        </div>
        <div onClick={onClick} className="cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="32"
            height="32"
            viewBox="0 0 24 24"
          >
            <path d="M 12 2 C 6.4889971 2 2 6.4889971 2 12 C 2 17.511003 6.4889971 22 12 22 C 17.511003 22 22 17.511003 22 12 C 22 6.4889971 17.511003 2 12 2 z M 12 4 C 16.430123 4 20 7.5698774 20 12 C 20 16.430123 16.430123 20 12 20 C 7.5698774 20 4 16.430123 4 12 C 4 7.5698774 7.5698774 4 12 4 z M 11 7 L 11 9 L 13 9 L 13 7 L 11 7 z M 11 11 L 11 17 L 13 17 L 13 11 L 11 11 z"></path>
          </svg>
        </div>
      </div>
      {/* Messages */}
      <div
        className="bg-white"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px",

          display: "flex",
          flexDirection: "column",
        }}
      >
        {allMessages.length === 0 && (
          <div
            style={{ color: "#888", textAlign: "center", marginTop: "40px" }}
          >
            No messages yet. Start the conversation!
          </div>
        )}
        {allMessages.map((m, i) => {
          const senderId =
            typeof m.sender === "string" ? m.sender : m.sender?._id;
          const isMe = senderId === userId;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
                marginBottom: "10px",
              }}
            >
              <div
                className="font-semibold"
                style={{
                  background: isMe ? "#04567B" : "#e0e0e0",
                  color: isMe ? "#fff" : "#222",
                  borderRadius: isMe
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
                  padding: "10px 18px",
                  maxWidth: "60%",

                  fontSize: "1rem",
                  boxShadow: isMe
                    ? "0 2px 8px rgba(25,118,210,0.08)"
                    : "0 2px 8px rgba(0,0,0,0.04)",
                  wordBreak: "break-word",
                  border: isMe ? "1px solid #1976d2" : "1px solid #e0e0e0",
                }}
              >
                <div>
                  {" "}
                  <span className="mr-4 text-lg">{m.content}</span>{" "}
                  <sub
                    className={`${
                      isMe ? "text-zinc-200" : "text-zinc-700"
                    } font-medium`}
                  >
                    {formatToUserTimeZone(m.createdAt)}
                  </sub>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {/* Input */}
      <div
        style={{
          borderTop: "1px solid #e0e0e0",
          padding: "18px 24px",
          background: "#f5faff",
          borderBottomLeftRadius: "16px",
          borderBottomRightRadius: "16px",
        }}
      >
        <form
          style={{ display: "flex", gap: "12px" }}
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              borderRadius: "24px",
              border: "1px solid #cfd8dc",
              padding: "12px 18px",
              fontSize: "1rem",
              outline: "none",
              background: "#fff",
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
              transition: "background 0.2s",
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
