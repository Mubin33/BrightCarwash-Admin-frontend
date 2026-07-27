"use client";

import { useMemo, useState } from "react";
import ChatSessionList from "./ChatSessionList";
import ChatWindow from "./ChatWindow";
import Sidebar from "./ChatBoxSidebar";
import {
  ApiMessage,
  ApiSession,
  ApiUser,
  ChatMessage,
  ChatSession,
  ChatUser,
} from "@/types/aiChatbox";
import {
  useGetSessionChatsQuery,
  useGetUsersQuery,
  useGetUserSessionsQuery,
} from "@/services/ai-Chatbox.api";

const formatDate = (date?: string | null) =>
  date ? new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(new Date(date)) : "—";

const formatTime = (date?: string | null) =>
  date ? new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(date)) : "";

const getList = <T,>(data: unknown, keys: string[]): T[] => {
  if (Array.isArray(data)) return data as T[];

  if (data && typeof data === "object") {
    const payload = data as Record<string, unknown>;

    for (const key of keys) {
      if (Array.isArray(payload[key])) return payload[key] as T[];
    }
  }

  return [];
};

export default function AiChatbox() {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );

  const { data: usersResponse, isLoading: isUsersLoading } = useGetUsersQuery();
  const users = useMemo<ChatUser[]>(() => getList<ApiUser>(usersResponse?.data, ["users", "results"]).map((user) => ({
    id: user.user_id,
    name: user.name || "Unknown user",
    email: user.email || "No email address",
    lastActive: formatDate(user.updated_at || user.created_at),
  })), [usersResponse]);

  const activeUserId = selectedUserId || users[0]?.id || "";

  const { data: sessionsResponse, isLoading: isSessionsLoading, refetch: refetchSessions } = useGetUserSessionsQuery(activeUserId, { skip: !activeUserId });
  const sessions = useMemo<ChatSession[]>(() => getList<ApiSession>(sessionsResponse?.data, ["sessions", "results"]).map((session) => ({
    id: session.session_id,
    date: formatDate(session.updated_at || session.created_at),
    label: session.status || "Normal",
    preview: session.last_message || session.preview || "No messages in this session.",
  })), [sessionsResponse]);

  const { data: messagesResponse, isFetching: isMessagesFetching } = useGetSessionChatsQuery(selectedSessionId ?? "", { skip: !selectedSessionId });
  const messages = useMemo<ChatMessage[]>(() => getList<ApiMessage>(messagesResponse?.data, ["chats", "messages", "conversation", "results"]).map((message) => ({
    sender: message.role === "user" || message.sender === "user" ? "user" : "bot",
    text: message.content || message.message || message.text || "",
    time: formatTime(message.created_at || message.timestamp),
  })), [messagesResponse]);

  const selectedUser = useMemo(
    () =>
      users.find((user) => user.id === activeUserId) || users[0],
    [activeUserId, users],
  );

  const selectedSession = sessions.find((session) => session.id === selectedSessionId) || null;

  return (
    <div className="h-[80vh]">
      <h2 className="mb-8 text-2xl font-semibold">Overview of AI Chats</h2>

      <div className="grid h-full min-h-0 grid-cols-[344px_1fr] gap-4">
        <Sidebar
          selectedUser={activeUserId}
          users={users}
          isLoading={isUsersLoading}
          onSelectUser={(id: string) => {
            setSelectedUserId(id);
            setSelectedSessionId(null);
          }}
        />

        {selectedSession && selectedUser ? (
          <ChatWindow
            user={selectedUser}
            messages={messages}
            isLoading={isMessagesFetching}
            onCloseSession={() => setSelectedSessionId(null)}
          />
        ) : (
          <ChatSessionList
            selectedSession={selectedSessionId}
            onSelectSession={setSelectedSessionId}
            sessions={sessions}
            isLoading={isSessionsLoading}
            onRefresh={refetchSessions}
          />
        )}
      </div>
    </div>
  );
}
