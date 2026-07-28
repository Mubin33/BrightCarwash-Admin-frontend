import ChatBubble from "./ChatBubble";
import { ChatMessage, ChatUser } from "@/types/aiChatbox";
import ArrowLeftIcon from "../../../../public/icons/custom/ArrowLeftIcon";
import MailIcon from "../../../../public/icons/custom/MailIcon";
import { CopyIcon } from "lucide-react";
import { toast } from "react-toastify";

type Props = {
  user: ChatUser;
  messages: ChatMessage[];
  isLoading: boolean;
  onCloseSession: () => void;
};

export default function ChatWindow({
  user,
  messages,
  isLoading,
  onCloseSession,
}: Props) {
  const copyEmail = () => {
    navigator.clipboard.writeText(user?.email || "");
    toast.success("Email copied to clipboard");
  };
  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-[#DFE1E7] bg-white">
      <div className="flex items-center justify-between border-b border-[#DFE1E7] p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onCloseSession}
            className="rounded-full bg-gray-100 p-1.5 transition hover:bg-gray-200"
          >
            <ArrowLeftIcon />
          </button>

          <div>
            <h3 className="font-medium text-slate-900">{user?.name}</h3>
            <div className="flex  gap-2 items-center">
              <p className="text-xs">{user?.email}</p>
              <button onClick={copyEmail} className="text-xs ">
                <CopyIcon size={12} className="hover:text-blue" />
              </button>
            </div>
          </div>
        </div>

        <button className="rounded-md bg-sky-500 p-1.5 text-white shadow-sm transition hover:bg-sky-600">
          <MailIcon />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto custom-scroll bg-gray-50 p-5">
        <div>
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading conversation...</p>
          ) : (
            messages?.map((message, index) => (
              <ChatBubble
                key={index}
                sender={message.sender}
                text={message.text}
                time={message.time}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
