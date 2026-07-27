"use client";

import { useMemo, useState } from "react";
import ChatSessionList from "./ChatSessionList";
import ChatWindow from "./ChatWindow";
import Sidebar from "./ChatBoxSidebar";
import { mockChatUsers } from "@/mocks/ai-chatbox.mock";
import { useGetUsersQuery } from "@/services/ai-Chatbox.api";

export default function AiChatbox() {
  const [selectedUserId, setSelectedUserId] = useState<string>(
    mockChatUsers[0]?.id ?? "",
  );
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );

  const { data: users, isLoading, error } = useGetUsersQuery();
  console.log("Aichat", users);

  const selectedUser = useMemo(
    () =>
      mockChatUsers.find((user) => user.id === selectedUserId) ||
      mockChatUsers[0],
    [selectedUserId],
  );

  const selectedSession = useMemo(
    () =>
      selectedUser?.sessions.find(
        (session) => session.id === selectedSessionId,
      ) || null,
    [selectedUser, selectedSessionId],
  );

  return (
    <div className="h-[80vh]">
      <h2 className="mb-8 text-2xl font-semibold">Overview of AI Chats</h2>

      <div className="grid h-full grid-cols-[344px_1fr] gap-4">
        <Sidebar
          selectedUser={selectedUserId}
          onSelectUser={(id: string) => {
            setSelectedUserId(id);
            setSelectedSessionId(null);
          }}
        />

        {selectedSession ? (
          <ChatWindow
            user={selectedUser}
            session={selectedSession}
            onCloseSession={() => setSelectedSessionId(null)}
          />
        ) : (
          <ChatSessionList
            user={selectedUser}
            selectedSession={selectedSessionId}
            onSelectSession={setSelectedSessionId}
          />
        )}
      </div>
    </div>
  );
}
