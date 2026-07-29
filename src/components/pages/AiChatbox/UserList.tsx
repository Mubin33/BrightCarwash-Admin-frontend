import { ChatUser } from "@/types/aiChatbox";
import { CircleAlert } from "lucide-react";

type Props = {
  selectedUser: string;
  onSelectUser: (userId: string) => void;
  users: ChatUser[];
};

export default function UserList({ selectedUser, onSelectUser, users }: Props) {
  console.log("++++++++++++>>>>", users);
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
                <span className="text-xs text-gray-400">
                  {user?.human_escalation_required === false ? (
                    <p title="Need Inquiry" id="tooltip" className="text-red-500">
                      <CircleAlert />
                    </p>
                  ) : (
                    ""
                  )}
                </span>
              </div>
              <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
