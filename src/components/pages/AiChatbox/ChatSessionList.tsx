import { ArrowLeft, RefreshCw } from "lucide-react";
import { ChatSession } from "@/types/aiChatbox";

type Props = {
  selectedSession: string | null;
  onSelectSession: (sessionId: string) => void;
  sessions: ChatSession[];
  isLoading: boolean;
  onRefresh: () => void;
  onBack?: () => void;
};

const statusColors: Record<string, string> = {
  Normal: "border border-[#DFE1E7] text-[#006F1F]",
  "Need Inquiry": "border border-[#DFE1E7] text-[#FFAF00]",
  Urgent: "border border-[#DFE1E7] text-[#FF4000]",
};

export default function ChatSessionList({
  selectedSession,
  onSelectSession,
  sessions,
  isLoading,
  onRefresh,
  onBack,
}: Props) {
  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-[#DFE1E7] bg-[#F8FAFB]">
      <div className="flex items-center justify-between border-b border-[#DFE1E7] p-4.5 bg-white">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to users"
              className="rounded-full bg-gray-100 p-1.5 transition hover:bg-gray-200"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <h3 className="font-medium">Chat Sessions</h3>
        </div>
        <button type="button" onClick={onRefresh} aria-label="Refresh sessions" className="cursor-pointer p-1.5 rounded-md border border-[#DFE1E7] bg-[#F8FAFB]">
          <RefreshCw size={16} className="text-gray-500" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#F8FAFB] p-3">
        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">Loading sessions...</div>
        ) : sessions.length ? (
          sessions.map((session: ChatSession) => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`w-full rounded-2xl border px-4 py-4 text-left transition bg-white 
              ${
                selectedSession === session.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium text-slate-900">{session.date}</div>
                <span
                  className={`rounded px-2 py-1 text-xs font-semibold ${statusColors[session.label]}`}
                >
                  {session.label}
                </span>
              </div>

              {/* <p className="mt-2 text-sm text-slate-600">{session.preview}</p> */}
            </button>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
            No sessions available for this user.
          </div>
        )}
      </div>
    </div>
  );
}
