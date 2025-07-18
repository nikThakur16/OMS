"use client";

import { useEffect, useState } from "react";

import socket from "@/utils/socket";
import {
  useGetUsersQuery,
  useGetOrCreateOneToOneChatMutation,
  useGetChatUserDirectoryQuery,
  useGetChatMessagesQuery,
  useMarkChatAsSeenMutation,
} from "@/store/api";
import ChatBox from "@/components/chat/ChatBox";
import { useAppSelector } from "@/store/hooks";
import NoConversation from "@/components/chat/NoConversation";
import UserInfo from "@/components/chat/UserInfo";
import { formatTime } from "@/utils/time/Time&Date";
import React from "react";



export default function ChatPage() {
  const user = useAppSelector((state: any) => state.login.user);
  // Removed console.log

  const { data: users = [], refetch: refetchDirectory, error: userDirectoryError } = useGetChatUserDirectoryQuery();
  // Extend Message type to include _id for lastMessage real-time updates
  interface MessageWithId {
    _id?: string;
    content?: string;
    sender?: any;
    chatId?: string;
    createdAt?: string;
    status?: string;
    seen?: boolean;
    seenBy?: any[];
  }
  // Fix: Extend User type to include unreadCount
  type UserWithUnread = typeof users[0] & { unreadCount?: number; lastMessage?: MessageWithId };
  const [userList, setUserList] = useState<UserWithUnread[]>(users as UserWithUnread[]);

  useEffect(() => {
    setUserList(users);
  }, [users]);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [chatId, setChatId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [getOrCreateChat] = useGetOrCreateOneToOneChatMutation();
  const [showSearch, setShowSearch] = useState(false);
  const { data: messages = [], refetch, error: messagesError } = useGetChatMessagesQuery(chatId, { skip: !chatId });
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  // Removed console.log

  const [markChatAsSeen] = useMarkChatAsSeenMutation();
  const [prevChatId, setPrevChatId] = useState<string>("");

  useEffect(() => {
    if (!selectedFriend || !(user?.id || user?._id)) return;
    getOrCreateChat({ userId1: user?.id || user?._id, userId2: selectedFriend?._id }).then(
      (res) => {
        if (res?.data?._id) setChatId(res.data?._id);
      }
    ).catch((err) => {
      // Basic error handling
      alert("Failed to get or create chat");
    });
  }, [selectedFriend, user, getOrCreateChat]);

  // Refetch messages when chatId changes
  useEffect(() => {
    if (chatId) {
      refetch();
    }
  }, [chatId, refetch]);

  useEffect(() => {
    if (chatId && user?.id) {
      markChatAsSeen(chatId);
      refetchDirectory(); // unread count will become zero
    }
  }, [chatId, user?.id, markChatAsSeen, refetchDirectory]);

  // Listen for new messages and update both messages and last message preview
  useEffect(() => {
    function handleNewMessage(message: any) {
      let found = false;
      setUserList(prev => {
        const idx = prev.findIndex(u => u.lastMessage && (u.lastMessage.chatId || u.lastMessage.chat) === (message.chatId || message.chat));
        if (idx === -1) {
          found = false;
          return prev;
        }
        found = true;
        const updatedUser = {
          ...prev[idx],
          lastMessage: {
            _id: message._id,
            content: message.content,
            sender: message.sender,
            chatId: message.chatId,
            createdAt: message.createdAt,
            status: message.status,
            seen: message.seen,
            seenBy: message.seenBy || [],
          }
        };
        const newList = [updatedUser, ...prev.filter((_, i) => i !== idx)];
        return newList.sort((a, b) => {
          const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
          const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
          return bTime - aTime;
        });
      });
      // If not found in userList, refetch the directory to update the chat list
      if (!found) {
        refetchDirectory();
      }
      // Only refetch messages if the message is for the currently open chat
      if ((message.chatId || message.chat) === chatId) {
        refetch();
      }
    }
    socket.on("newMessage", handleNewMessage);

    function handleLastMessageUpdate({ lastMessageId, status }: any) {
      setUserList(prev =>
        prev.map(u =>
          u.lastMessage && u.lastMessage._id === lastMessageId
            ? { ...u, lastMessage: { ...u.lastMessage, status } }
            : u
        )
      );
      refetchDirectory(); // <-- Add this line
    }
    socket.on("last_message_update", handleLastMessageUpdate);

    function handleMessageSeen({ messageId, userId }: any) {
      refetchDirectory(); // Update user list and chat status in real time
    }
    socket.on("message_seen", handleMessageSeen);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("last_message_update", handleLastMessageUpdate);
      socket.off("message_seen", handleMessageSeen);
    };
  }, [chatId]); // Only include chatId as dependency

  useEffect(() => {
    if (!user?.id) return;

    // Ensure we emit user_online on every (re)connect
    const handleConnect = () => {
      socket.emit("user_online", user?.id);
      socket.emit("get_online_users");
    };

    socket.on("connect", handleConnect);

    // Listen for the full list once
    const handleOnlineUsersList = (userIds: string[]) => setOnlineUsers(userIds);
    const handleUserOnline = (userId: string) =>
      setOnlineUsers((prev) => [...new Set([...prev, userId])]);
    const handleUserOffline = (userId: string) =>
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));

    socket.on("online_users_list", handleOnlineUsersList);
    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);

    // If already connected, trigger manually
    if (socket.connected) handleConnect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("online_users_list", handleOnlineUsersList);
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    if (chatId) {
      if (prevChatId && prevChatId !== chatId) {
        socket.emit("leave_chat", prevChatId, user.id);
      }
      socket.emit("join_chat", chatId, user.id);
      setPrevChatId(chatId);
    }
    // Clean up on unmount
    return () => {
      if (chatId) {
        socket.emit("leave_chat", chatId, user.id);
      }
    };
  }, [chatId, user?.id]);

  // Add error display for user directory and messages
  if (userDirectoryError) {
    return <div>Error loading user directory.</div>;
  }
  if (messagesError) {
    return <div>Error loading messages.</div>;
  }
  return (
    <div
      onClick={() => {
        setShowSearch(false);
      }}
      className="flex w-full h-full  gap-2  "
    >
      <div className="max-w-1/4 min-w-1/4 bg-white relative rounded-md shadow-[4px_0_8px_0_rgba(0,0,0,0.1)]" style={{ height: "100%" }}>
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="flex items-center justify-between py-3 px-3 font-semibold text-xl shadow-[0_4px_8px_0_rgba(0,0,0,0.2)] relative h-[50px]"
        >
          {/* Heading and search icon */}
          <h3
            className={`transition-opacity duration-300 ${
              showSearch ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            Chats
          </h3>
          <span
            onClick={() => setShowSearch(true)}
            className={`ri-search-line flex items-center right-4 cursor-pointer transition-opacity duration-300 ${
              showSearch ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          ></span>

          {/* Search input sliding in */}
          <div
            className={`
              absolute left-0 top-0 w-full h-full flex items-center gap-2 px-3

              transition-transform duration-300
              ${showSearch ? "translate-x-0" : "translate-x-full"}
              bg-white
            `}
      
          >
            <input
              type="search"
              placeholder="Search Here"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-[35px] h-[39px] w-full text-[14px] [&::-webkit-search-cancel-button]:hidden
              [&::-webkit-search-decoration]:hidden
              [&::-webkit-search-results-button]:hidden
              appearance-none   border border-none focus:outline-none px-4"
            />
            <svg
              onClick={() => setShowSearch(false)}
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              className="cursor-pointer"
            >
              <path d="M 4.9902344 3.9902344 A 1.0001 1.0001 0 0 0 4.2929688 5.7070312 L 10.585938 12 L 4.2929688 18.292969 A 1.0001 1.0001 0 1 0 5.7070312 19.707031 L 12 13.414062 L 18.292969 19.707031 A 1.0001 1.0001 0 1 0 19.707031 18.292969 L 13.414062 12 L 19.707031 5.7070312 A 1.0001 1.0001 0 0 0 18.980469 3.9902344 A 1.0001 1.0001 0 0 0 18.292969 4.2929688 L 12 10.585938 L 5.7070312 4.2929688 A 1.0001 1.0001 0 0 0 4.9902344 3.9902344 z"></path>
            </svg>
          </div>
        </div>

        <div
          className="px-1.5 py-3 m-0 mb-2 flex flex-col gap-4 overflow-y-auto hide-scrollbar"
          style={{ height: "calc(100% - 143px)" }} // 100px is the height of the red bar
        >
          {userList
            .filter((u) => u._id !== (user?.id || user?._id))
            .filter((friend) => {
              const fullName =
                `${friend.personalDetails.firstName} ${friend.personalDetails.lastName}`.toLowerCase();
            
              return fullName.includes(searchTerm.toLowerCase());
              
            }).filter((friend) => {
              // Filter out friends that have no messages
              return friend.lastMessage && friend.lastMessage.content;
            })
            .map((friend) => {
              if (!friend) return null;
              const lastMessage = friend?.lastMessage as any;
              const senderId = typeof lastMessage?.sender === 'string' ? lastMessage?.sender : lastMessage?.sender?._id;
              const isMe = senderId === (user?.id || user?._id);

              // --- NEW: Calculate unread count ---
              // If you have unreadCount from backend, use that. Otherwise, fallback to 1 if lastMessage is not seen and not sent by me.
              const unreadCount =
                typeof friend.unreadCount === "number"
                  ? friend.unreadCount
                  : (!isMe && !lastMessage.seen ? 1 : 0);

              // --- NEW: Highlight if unread ---
              const isUnread = unreadCount > 0;

              return (
                <React.Fragment key={friend._id}>
                  <div
                    className={`hover:bg-gray-200 flex items-center justify-between gap-4 px-2 py-4 rounded-lg cursor-pointer shadow-[0_4px_8px_0_rgba(0,0,0,0.1)]
                      ${selectedFriend?._id === friend._id ? 'bg-blue-100' : ''}
                      ${isUnread ? 'bg-blue-50 font-bold' : ''}
                    `}
                    onClick={() => setSelectedFriend(friend)}
                  >
                    <div className="flex items-center gap-4">
                      <img width={35} height={35} className="rounded-full" src="/images/cat.jpg" alt="" />
                      <div className="flex flex-col">
                        <span className="font-semibold tracking-wider">
                          {friend.personalDetails.firstName} {friend.personalDetails.lastName}
                        </span>
                        <span className="text-gray-700 font-medium flex items-center">
                          {lastMessage?.content ? (
                            <>
                              {isMe && (
                                lastMessage.seen || lastMessage.status === "seen" ? (
                                  <span className="text-blue-500 mr-1">seen</span>
                                ) : lastMessage.status === "delivered" ? (
                                  <span className="text-gray-500 mr-1">delivered</span>
                                ) : (
                                  <span className="text-gray-500 mr-1">sent</span>
                                )
                              )}
                              {lastMessage?.content}
                            </>
                          ) : (
                            "No messages yet"
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-semibold text-sm text-gray-600">
                        {lastMessage ? formatTime(lastMessage?.createdAt): ""}
                      </span>
                      {/* --- NEW: Unread badge --- */}
                      {isUnread && (
                        <span className="mt-1 inline-block min-w-[20px] px-2 py-0.5 text-xs text-white bg-blue-500 rounded-full text-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                
                </React.Fragment>
              );
            })}
           
        </div>
        <div className="absolute bottom-0 left-0 w-full h-[100px] bg-red-100 flex items-center justify-center z-10">
          dafwfwe
        </div>
      </div>
     
      <div
        className={`${
          showUserInfo ? "w-1/2" : "w-3/4"
        } bg-white p-4 rounded-md overflow-y-scroll hide-scrollbar`}
      >
        {chatId && selectedFriend ? (
          <ChatBox
            chatId={chatId}
            userId={user?.id}
            messages={messages}
            name={selectedFriend ? `${selectedFriend.personalDetails.firstName} ${selectedFriend.personalDetails.lastName}` : "Chat"}
            isOnline={onlineUsers.includes(selectedFriend?._id)}
            lastSeen={users.find(u => u._id === selectedFriend?._id)?.lastSeen}
            onClick={() => setShowUserInfo(!showUserInfo)}
            refetch={refetch}
          />
        ) : (
          <NoConversation />
        )}
      </div>
      <div
        className={`${
          showUserInfo ? "block" : "hidden"
        }  w-1/4 h-full bg-white p-2 rounded-md overflow-y-auto hide-scrollbar`}
      >
        <UserInfo
        
          name={
            selectedFriend
              ? `${selectedFriend.personalDetails.firstName} ${selectedFriend.personalDetails.lastName}`
              : "Chat"
          }
          onClose={() => setShowUserInfo(false)}
        />
      </div>
    </div>
  );
}
