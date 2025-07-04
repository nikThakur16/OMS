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

interface Message {
  sender: string;
  content: string;
  chatId: string;
}

export default function ChatPage() {
  const user = useAppSelector((state: any) => state.login.user);

  const { data: users = [] } = useGetChatUserDirectoryQuery();
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [chatId, setChatId] = useState<string>("");

  const [getOrCreateChat] = useGetOrCreateOneToOneChatMutation();
  const { data: messages = [], refetch } = useGetChatMessagesQuery(chatId, {
    skip: !chatId,
  });
  const [showUserInfo, setShowUserInfo] = useState(false);

  useEffect(() => {
    if (!selectedFriend || !user?.id) return;
    getOrCreateChat({ userId1: user.id, userId2: selectedFriend._id }).then(
      (res) => {
        if (res?.data?._id) setChatId(res.data._id);
      }
    );
  }, [selectedFriend, user, getOrCreateChat]);

  return (
    <div className="flex w-full h-full  gap-2  ">
      <div className="max-w-1/4 min-w-1/4  bg-white  rounded-md overflow-y-auto hide-scrollbar shadow-[4px_0_8px_0_rgba(0,0,0,0.1)]">
        <h3 className="py-3 px-3 font-bold text-xl shadow-[0_4px_8px_0_rgba(0,0,0,0.2)]">
          Chats
        </h3>
        <div className="  px-1.5 py-3 m-0 mb-2 flex flex-col gap-4 ">
          {users
            .filter((u) => u._id !== user?.id)
            .map((friend) => (
              <div
                className="hover:bg-gray-200  flex items-center justify-between  gap-4 px-2 py-3 rounded-lg cursor-pointer  shadow-[0_4px_8px_0_rgba(0,0,0,0.1)]"
                key={friend._id}
                onClick={() => {
                  setSelectedFriend(friend);
                  console.log("Selected friend:", friend);
                }}
                // style={{ cursor: "pointer", padding: "4px", background: selectedFriend?._id === friend._id ? "#e0e0e0" : "transparent" }}
              >
                <div className=" flex items-center gap-4">
                  {" "}
                  <img
                    width={35}
                    height={35}
                    className="rounded-full"
                    src="/images/cat.jpg"
                    alt=""
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold tracking-wider">
                      {" "}
                      {friend.personalDetails.firstName}{" "}
                      {friend.personalDetails.lastName}
                    </span>{" "}
                    <span className="text-gray-700 font-medium">hi</span>
                  </div>{" "}
                </div>
                <span className="font-semibold text-sm text-gray-600">
                  11:25 PM
                </span>
              </div>
            ))}
        </div>
      </div>
      <div className={`${showUserInfo?"w-1/2":"w-3/4"} bg-white p-4 rounded-md overflow-y-scroll hide-scrollbar`}>
        {chatId ? (
          <ChatBox
            chatId={chatId}
            userId={user.id}
            messages={messages}
            name={
              selectedFriend
                ? `${selectedFriend.personalDetails.firstName} ${selectedFriend.personalDetails.lastName}`
                : "Chat"
            }
            onClick={() => setShowUserInfo(!showUserInfo)}
          />
        ) : (
          <NoConversation />
        )}
      </div>
      <div className={`${showUserInfo?"block":"hidden"}  w-1/4 h-full bg-white p-2 rounded-md overflow-y-auto hide-scrollbar`}>
        <UserInfo name={
              selectedFriend
                ? `${selectedFriend.personalDetails.firstName} ${selectedFriend.personalDetails.lastName}`
                : "Chat"
            }
            onClose={()=> setShowUserInfo(false)} />
      </div>
    </div>
  );
}
