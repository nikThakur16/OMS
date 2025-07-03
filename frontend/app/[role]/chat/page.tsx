'use client';

import { useEffect, useState } from "react";

import socket from "@/utils/socket";
import { useGetUsersQuery, useGetOrCreateOneToOneChatMutation,useGetChatUserDirectoryQuery, useGetChatMessagesQuery } from "@/store/api";
import ChatBox from "@/components/chat/ChatBox";
import { useAppSelector } from "@/store/hooks";

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
  const { data: messages = [], refetch } = useGetChatMessagesQuery(chatId, { skip: !chatId });

  useEffect(() => {
    if (!selectedFriend || !user?.id) return;
    getOrCreateChat({ userId1: user.id, userId2: selectedFriend._id })
      .then(res => {
        if (res?.data?._id) setChatId(res.data._id);
      });
  }, [selectedFriend, user, getOrCreateChat]);

  return (
    <div style={{ display: "flex" }}>
      <div>
        <h3>Users</h3>
        <ul>
          {users.filter(u => u._id !== user?.id).map(friend => (
            <li
              key={friend._id}
              onClick={() => {
                setSelectedFriend(friend);
                console.log("Selected friend:", friend);
              }}
              style={{ cursor: "pointer", padding: "4px", background: selectedFriend?._id === friend._id ? "#e0e0e0" : "transparent" }}
            >
              {friend.personalDetails.firstName} {friend.personalDetails.lastName}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ marginLeft: "2rem", flex: 1 }}>
        {chatId && (
          <ChatBox
            chatId={chatId}
            userId={user.id}
            messages={messages}
            name={selectedFriend ? `${selectedFriend.personalDetails.firstName} ${selectedFriend.personalDetails.lastName}` : "Chat"}
          />
        )}
      </div>
    </div>
  );
}
