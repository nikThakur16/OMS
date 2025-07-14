"use client";

import { useEffect, useState } from "react";

import socket from "@/utils/socket";
import {
  useGetUsersQuery,
  useGetOrCreateOneToOneChatMutation,
  useGetChatUserDirectoryQuery,
  useGetChatMessagesQuery,
} from "@/store/api";
import ChatBox from "@/components/chat/ChatBox";
import { useAppSelector } from "@/store/hooks";
import NoConversation from "@/components/chat/NoConversation";
import UserInfo from "@/components/chat/UserInfo";
import { formatTime } from "@/utils/time/Time&Date";



export default function ChatPage() {
  const user = useAppSelector((state: any) => state.login.user);

  const { data: users = [], refetch: refetchDirectory } = useGetChatUserDirectoryQuery();
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [chatId, setChatId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [getOrCreateChat] = useGetOrCreateOneToOneChatMutation();
  const [showSearch, setShowSearch] = useState(false);
  const { data: messages = [], refetch } = useGetChatMessagesQuery(chatId, { skip: !chatId });
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedFriend || !user?.id) return;
    getOrCreateChat({ userId1: user.id, userId2: selectedFriend._id }).then(
      (res) => {
        if (res?.data?._id) setChatId(res.data._id);
      }
    );
  }, [selectedFriend, user, getOrCreateChat]);

  // Refetch messages when chatId changes
  useEffect(() => {
    if (chatId) {
      refetch();
    }
  }, [chatId, refetch]);

  // Listen for new messages and update both messages and last message preview
  useEffect(() => {
    function handleNewMessage(message) {
      if (message.chatId === chatId) {
        refetch();
      }
      refetchDirectory();
    }
    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [chatId, refetch, refetchDirectory]);

  useEffect(() => {
    socket.emit("user_online", user?.id);
    socket.on("user_online", (userId) => {
      setOnlineUsers((prev) => [...new Set([...prev, userId])]);
    });
    socket.on("user_offline", (userId) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });
    return () => {
      socket.off("user_online");
      socket.off("user_offline");
    };
  }, [user?.id]);

  console.log(users)
  return (
    <div
      onClick={() => {
        setShowSearch(false);
      }}
      className="flex w-full h-full  gap-2  "
    >
      <div className="max-w-1/4 min-w-1/4  bg-white  rounded-md overflow-y-auto hide-scrollbar shadow-[4px_0_8px_0_rgba(0,0,0,0.1)]">
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
            style={{ zIndex: 10 }}
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

        <div className="  px-1.5 py-3 m-0 mb-2 flex flex-col gap-4 ">
          {users
            .filter((u) => u._id !== user?.id)
            .filter((friend) => {
              const fullName =
                `${friend.personalDetails.firstName} ${friend.personalDetails.lastName}`.toLowerCase();
            
              return fullName.includes(searchTerm.toLowerCase());
              
            }).filter((friend) => {
              // Filter out friends that have no messages
              return friend.lastMessage && friend.lastMessage.content;
            })
            .map((friend) => {
            
          
              return (
                <div
                  className="hover:bg-gray-200 flex items-center justify-between gap-4 px-2 py-3 rounded-lg cursor-pointer shadow-[0_4px_8px_0_rgba(0,0,0,0.1)]"
                  key={friend._id}
                  onClick={() => setSelectedFriend(friend)}
                >
                  <div className="flex items-center gap-4">
                    <img width={35} height={35} className="rounded-full" src="/images/cat.jpg" alt="" />
                    <div className="flex flex-col">
                      <span className="font-semibold tracking-wider">
                        {friend.personalDetails.firstName} {friend.personalDetails.lastName}
                      </span>
                      <span className="text-gray-700 font-medium flex items-center">
                          {friend?.lastMessage?.content ? (
                          <>
                            {friend?.lastMessage?.sender?._id === user?._id && (
                              <span className="text-blue-500 mr-1">
                                {/* Double tick SVG or icon */}
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M1.5 8.5l4 4 9-9" stroke="currentColor" strokeWidth="2" fill="none"/>
                                  <path d="M5.5 8.5l4 4 5-5" stroke="currentColor" strokeWidth="2" fill="none"/>
                                </svg>
                              </span>
                            )}
                            {friend?.lastMessage?.content}
                          </>
                        ) : (
                          "No messages yet"
                        )}
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold text-sm text-gray-600">
                    {/* Optionally, show time of last message */}
                    {friend?.lastMessage ? formatTime(friend?.lastMessage?.createdAt) : ""}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
      <div
        className={`${
          showUserInfo ? "w-1/2" : "w-3/4"
        } bg-white p-4 rounded-md overflow-y-scroll hide-scrollbar`}
      >
        {chatId ? (
          <ChatBox
            chatId={chatId}
            userId={user?._id}
            messages={messages}
            name={
              selectedFriend
                ? `${selectedFriend.personalDetails.firstName} ${selectedFriend.personalDetails.lastName}`
                : "Chat"
            }
            isOnline={onlineUsers.includes(selectedFriend?._id)}
            lastSeen={users.find(u => u._id === selectedFriend?._id)?.lastSeen}
            onClick={() => setShowUserInfo(!showUserInfo)}
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
