import { ChatUser } from "@/types/aiChatbox";
import { CircleAlert } from "lucide-react";

type Props = {
  selectedUser: string;
  onSelectUser: (userId: string) => void;
  users: ChatUser[];
};

export default function UserList({ selectedUser, onSelectUser, users }: Props) {
  return (
    <div className="space-y-2">
      {users?.map((user) => (
        <button
          key={user.id}
          onClick={() => onSelectUser(user.id)}
          className={`w-full rounded-2xl border p-3.5 text-left transition 
            ${
              selectedUser === user?.id
                ? "border-2 border-blue-500"
                : "border-gray-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
        >
          <div className="flex justify-between gap-2">
            <div className="w-full">
              <div className="flex gap-2 items-center justify-between">
                <h3 className="font-medium text-slate-900 capitalize truncate">
                  {user?.name}
                </h3>
                <div className="relative inline-flex items-center group">
                  {user?.human_escalation_required === false && (
                    <>
                      <CircleAlert
                        size={16}
                        className="text-red-500 cursor-pointer"
                      />

                      {/* Tooltip */}
                      <div className="pointer-events-none absolute bottom-full  mb-3  -top-2 right-6 opacity-0 scale-95 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 z-50">
                        <div className="relative whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-xl">
                          Need Inquiry
                          {/* Arrow */}
                          <div className="absolute -right-2 top-1/2 -translate-y-1/2 border-4 border-transparent border-t-gray-900 -rotate-90" />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
