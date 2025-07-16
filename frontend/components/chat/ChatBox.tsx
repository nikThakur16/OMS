import { useEffect, useState, useRef } from "react";
import socket from "@/utils/socket";
import { formatToUserTimeZone } from "@/utils/time/Time&Date";
import { formatLastSeen } from "@/utils/time/lastSeenFormatter";

// New: Helper for offline queue
const OFFLINE_QUEUE_KEY = 'chat_offline_queue';
function getOfflineQueue() {
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
  } catch (e) {
    // Optionally log error
    return [];
  }
}
function setOfflineQueue(queue: any[]) {
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    // Optionally log error
  }
}

export default function ChatBox({
  chatId,
  userId,
  messages,
  name,
  isOnline,
  lastSeen,
  onClick,
  refetch, // <-- Add this
}: {
  chatId: string;
  userId: string;
  messages: any[];
  name: string;
  isOnline: boolean;
  lastSeen?: string | Date;
  onClick?: () => void;
  refetch: () => void; // <-- Add this
}) {
  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const prevChatIdRef = useRef<string | null>(null);
  const [roomUsers, setRoomUsers] = useState<string[]>([]);

  // New: Send queued messages when back online
  useEffect(() => {
    function trySendQueued() {
      if (navigator.onLine) {
        const queue = getOfflineQueue();
        if (queue.length > 0) {
          queue.forEach((msg: any) => {
            socket.emit("send_message", msg);
          });
          setOfflineQueue([] as any[]); // Fix: always pass array
        }
      }
    }
    window.addEventListener('online', trySendQueued);
    trySendQueued();
    return () => {
      window.removeEventListener('online', trySendQueued);
    };
  },[]);

  // Listen for room_users event from backend
  useEffect(() => {
    function handleRoomUsers(users: string[]) {
      setRoomUsers(users);
    }
    socket.on("room_users", handleRoomUsers);
    // Request the current room users when joining
    if (chatId) {
      socket.emit("get_room_users", chatId);
    }
    return () => {
      socket.off("room_users", handleRoomUsers);
    };
  }, [chatId]);

  // 1. Send message (with offline/pending support)
  const sendMessage = () => {
    if (!input.trim()) return;
    if (!userId) {
      alert("User ID is missing! Cannot send message.");
      return;
    }
    const tempId = "temp-" + Date.now();
    const msg = {
      _id: tempId,
      chatId,
      sender: userId,
      content: input,
      createdAt: new Date().toISOString(),
      status: navigator.onLine ? "sent" : "pending"
    };
    setLocalMessages((prev) => [...prev, msg]);
    if (navigator.onLine) {
      socket.emit("send_message", msg);
    } else {
      // New: queue message if offline
      const queue = getOfflineQueue();
      setOfflineQueue([...queue, msg]);
    }
    setInput("");
  };

  // New: Retry sending a pending message
  const retrySendMessage = (pendingMsg: any) => {
    if (!navigator.onLine) return;
    // Remove from offline queue
    const queue = getOfflineQueue().filter((msg: any) => msg._id !== pendingMsg._id);
    setOfflineQueue(queue);
    // Remove from localMessages (pending)
    setLocalMessages((prev) => prev.filter((msg) => msg._id !== pendingMsg._id));
    // Resend
    socket.emit("send_message", { ...pendingMsg, status: "sent" });
  };

  // 2. Listen for newMessage, message_delivered, message_seen
  useEffect(() => {
    // Clear local messages on chat change
    setLocalMessages([]);

    // Leave previous chat room if chatId changes
    if (prevChatIdRef.current && prevChatIdRef.current !== chatId) {
      socket.emit("leave_chat", prevChatIdRef.current, userId);
    }
    // Join new chat room
    const joinUserId = userId || (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('userId'));
    console.log("[DEBUG] Emitting join_chat", chatId, joinUserId);
    socket.emit("join_chat", chatId, joinUserId);
    prevChatIdRef.current = chatId;

    // When a new message is received (from anyone)
    function handleNewMessage(msg: any) {
      if (msg.status === "delivered") {
        console.log("[DEBUG] Received message with status 'delivered'", msg);
      }
      if (msg.status === "seen" || msg.seen) {
        console.log("[DEBUG] Received message with status 'seen'", msg);
      }
      setLocalMessages((prev) => {
        // If this is my own message (optimistic), update its _id and status
        if ( msg.sender?._id === userId) {
          // Find the temp message
          const idx = prev.findIndex(
            (m) =>
              m.content === msg.content &&
              m.sender === userId &&
              m.status === "sent"
          );
          if (idx !== -1) {
            // Replace temp message with real one, set status to delivered/seen
            const updated = [...prev];
            updated[idx] = { ...msg, status: msg.status, seen: msg.seen };
            return updated;
          }
        }
        // Otherwise, just add the message (from others)
        return [...prev, { ...msg, status: msg.status, seen: msg.seen }];
      });
    }

    // When message is delivered (double gray tick)
    function handleDelivered({ messageId }: { messageId: string }) {
      console.log("delivered", messageId, "in ChatBox of", userId);
      setLocalMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, status: "delivered" } : msg
        )
        
      );
      if (refetch) refetch();
    }

    // When message is seen (double blue tick)
    function handleSeen({ messageId, userId: seenByUserId }: { messageId: string, userId: string }) {
      console.log("[DEBUG] Received message_seen event", messageId, seenByUserId, "in ChatBox of", userId);
      setLocalMessages((prev) => {
        let found = false;
        const updated = prev.map((msg) => {
          if (msg._id.toString() === messageId.toString()) {
            found = true;
            return { ...msg, status: "seen", seen: true };
          }
          return msg;
        });
        // If not found, add a minimal message object to update the UI for the sender
        if (!found) {
          return [
            ...updated,
            { _id: messageId, status: "seen", seen: true }
          ];
        }
        return updated;
      });
      if (refetch) refetch();
    }

    socket.on("newMessage", handleNewMessage);
    socket.on("message_delivered", handleDelivered);
    socket.on("message_seen", handleSeen);

    return () => {
      // On unmount, leave the current chat room
      socket.emit("leave_chat", chatId, userId);
      socket.off("newMessage", handleNewMessage);
      socket.off("message_delivered", handleDelivered);
      socket.off("message_seen", handleSeen);
    };
  }, [chatId, userId, refetch, messages]);

  // 3. Scroll to bottom on new message
  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [localMessages, messages]);

  // 4. Emit seen for all unseen messages from others
  useEffect(() => {
    if (!document.hasFocus()) return;
    // Remove this check for testing: if (!roomUsers.includes(userId) || roomUsers.length < 2) return;
    const allMsgs = [...messages, ...localMessages];
    const unseenMsgs = allMsgs.filter((msg) => {
      const senderId = typeof msg.sender === "string" ? msg.sender : msg.sender?._id;
      return senderId !== userId && msg.status !== "seen";
    });
    if (unseenMsgs.length > 0) {
      unseenMsgs.forEach((msg) => {
        console.log("Emitting message_seen for", msg._id);
        socket.emit("message_seen", {
          chatId,
          messageId: msg._id,
          userId
        });
      });
    }
  }, [localMessages, messages, chatId, userId, roomUsers]);

  // 5. Combine messages for display (avoid duplicates)
  const allMessages = [
    ...messages.map((msg) => {
      // If there's a local version of this message, use it (it may have updated status)
      const local = localMessages.find((lm) => lm._id.toString() === msg._id.toString());
      return local ? { ...msg, ...local } : msg;
    }),
    // Add any local messages that aren't in messages yet (e.g., pending/outgoing)
    ...localMessages.filter((lm) => !messages.some((m) => m._id.toString() === lm._id.toString())),
  ];

  function renderStatus(msg: any) {
    console.log("[DEBUG] Rendering status for", msg._id, ":", msg.status, msg.seen);
    if (msg.status === "pending") return <span style={{ color: "#bdbdbd" }}>pending</span>;
    if (msg.seen || msg.status === "seen") return <span style={{ color: "#1976d2" }}>seen</span>;
    if (msg.status === "delivered") return <span style={{ color: "gray" }}>delivered</span>;
    if (msg.status === "sent") return <span style={{ color: "gray" }}>sent</span>;
    return null;
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 10);
  };

  useEffect(() => {
    // Whenever backend messages change (e.g., after refetch), clear localMessages
    setLocalMessages([]);
  }, [messages]);

  console.log('[DEBUG] ChatBox userId:', userId);

  return (
    <div
      className="bg-white "
      style={{
        borderRadius: "16px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        padding: "0",
        minHeight: "100%",
    

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
              {isOnline
                ? <span style={{ color: "#4caf50" }}>Online</span>
                : lastSeen
                  ? `Last seen ${formatLastSeen(lastSeen)}`
                  : "Offline"}
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
        onScroll={handleScroll}
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
                    {typeof m.createdAt === 'string' ? formatToUserTimeZone(m.createdAt, Intl.DateTimeFormat().resolvedOptions().timeZone) : ""}
                  </sub>
                  {isMe && (
                    <span style={{ marginLeft: 8 }}>
                      {renderStatus(m)}
                      {m.status === "pending" && (
                        <button
                          style={{ marginLeft: 4, color: '#1976d2', background: 'none', border: 'none', cursor: 'pointer' }}
                          title="Retry"
                          onClick={() => retrySendMessage(m)}
                        >
                          ⟳
                        </button>
                      )}
                    </span>
                  )}
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
