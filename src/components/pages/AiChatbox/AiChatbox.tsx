"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  useLazyGetUsersQuery,
  useGetUserSessionsQuery,
} from "@/services/ai-Chatbox.api";

const USERS_PAGE_SIZE = 20;

const formatDate = (date?: string | null) =>
  date
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }).format(new Date(date))
    : "—";

const formatTime = (date?: string | null) =>
  date
    ? new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(date))
    : "";

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
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [apiUsers, setApiUsers] = useState<ApiUser[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const requestVersion = useRef(0);
  const [getUsers, { isFetching: isUsersFetching, isLoading: isUsersLoading }] =
    useLazyGetUsersQuery();

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      300,
    );
    return () => window.clearTimeout(timeout);
  }, [search]);

  const loadUsers = useCallback(
    async (
      cursor?: string,
      searchTerm = "",
      replace = false,
      version = requestVersion.current,
    ) => {
      try {
        const response = await getUsers({
          cursor,
          pageSize: USERS_PAGE_SIZE,
          search: searchTerm || undefined,
        }).unwrap();
        if (version !== requestVersion.current) return;

        const next = response.meta?.next;
        const nextPageCursor = next
          ? new URL(next).searchParams.get("cursor")
          : null;

        setApiUsers((currentUsers) => {
          if (replace) return response.data;

          const existingIds = new Set(currentUsers.map((user) => user.user_id));
          return [
            ...currentUsers,
            ...response.data.filter((user) => !existingIds.has(user.user_id)),
          ];
        });
        setNextCursor(nextPageCursor);
      } catch {}
    },
    [getUsers],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadUsers(undefined, debouncedSearch, true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [debouncedSearch, loadUsers]);

  const users = useMemo<ChatUser[]>(
    () =>
      apiUsers.map((user) => ({
        id: user.user_id,
        name: user.name || "Unknown user",
        email: user.email || "No email address",
        human_escalation_required: user.human_escalation_required,
        lastActive: formatDate(user.updated_at || user.created_at),
      })),
    [apiUsers],
  );

  const activeUserId = selectedUserId || users[0]?.id || "";

  const {
    data: sessionsResponse,
    isLoading: isSessionsLoading,
    refetch: refetchSessions,
  } = useGetUserSessionsQuery(activeUserId, { skip: !activeUserId });
  const sessions = useMemo<ChatSession[]>(
    () =>
      getList<ApiSession>(sessionsResponse?.data, ["sessions", "results"]).map(
        (session) => ({
          id: session.session_id,
          date: formatDate(session.updated_at || session.created_at),
          label: session.status || "Normal",
          preview:
            session.last_message ||
            session.preview ||
            "No messages in this session.",
        }),
      ),
    [sessionsResponse],
  );

  const { data: messagesResponse, isFetching: isMessagesFetching } =
    useGetSessionChatsQuery(selectedSessionId ?? "", {
      skip: !selectedSessionId,
    });
  const messages = useMemo<ChatMessage[]>(
    () =>
      getList<ApiMessage>(messagesResponse?.data, [
        "chats",
        "messages",
        "conversation",
        "results",
      ]).map((message) => ({
        sender:
          message.role === "user" || message.sender === "user" ? "user" : "bot",
        text: message.content || message.message || message.text || "",
        time: formatTime(message.created_at || message.timestamp),
      })),
    [messagesResponse],
  );

  const selectedUser = useMemo(
    () => users.find((user) => user.id === activeUserId) || users[0],
    [activeUserId, users],
  );

  const selectedSession =
    sessions.find((session) => session.id === selectedSessionId) || null;

  return (
    <div className="h-[80vh]">
      <h2 className="mb-8 text-2xl font-semibold">Overview of AI Chats</h2>

      <div className="grid h-full min-h-0 grid-cols-[400px_1fr] gap-4">
        <Sidebar
          selectedUser={activeUserId}
          users={users}
          isLoading={isUsersLoading}
          isLoadingMore={isUsersFetching && apiUsers.length > 0}
          search={search}
          hasMore={Boolean(nextCursor) && search.trim() === debouncedSearch}
          onSearchChange={(value) => {
            requestVersion.current += 1;
            setSearch(value);
            setSelectedUserId("");
            setSelectedSessionId(null);
          }}
          onLoadMore={() => {
            if (nextCursor && !isUsersFetching) {
              void loadUsers(nextCursor, debouncedSearch, false);
            }
          }}
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
