import { Search } from "lucide-react";
import UserList from "./UserList";
import { ChatUser } from "@/types/aiChatbox";

type Props = {
  selectedUser: string;
  onSelectUser: (userId: string) => void;
  users: ChatUser[];
  isLoading: boolean;
  isLoadingMore: boolean;
  search: string;
  hasMore: boolean;
  onSearchChange: (search: string) => void;
  onLoadMore: () => void;
};

export default function Sidebar({
  selectedUser,
  onSelectUser,
  users,
  isLoading,
  isLoadingMore,
  search,
  hasMore,
  onSearchChange,
  onLoadMore,
}: Props) {
  return (
    <div className="flex min-h-0 flex-col rounded-xl border border-[#DFE1E7] bg-white ">
      <div className="flex min-h-0 flex-1 flex-col p-3">
        <div className="relative mb-2">
          <Search
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            placeholder="Search users..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className=" w-full rounded-2xl bg-[#f8fafb] border border-[#DFE1E7] px-3.75 py-3.5  text-sm outline-none"
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto custom-scroll">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading users...</div>
          ) : users.length ? (
            <UserList selectedUser={selectedUser} onSelectUser={onSelectUser} users={users} />
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">No users available.</div>
          )}
        </div>
        {hasMore && (
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="mt-3 w-full rounded-xl border border-[#DFE1E7] px-3 py-2 text-sm font-medium text-[#246BCE] transition hover:bg-[#F4F8FF] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingMore ? "Loading..." : "Load more"}
          </button>
        )}
      </div>
    </div>
  );
}
