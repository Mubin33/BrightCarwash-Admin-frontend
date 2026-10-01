"use client";

import { useSyncExternalStore } from "react";
import DOMPurify from "dompurify";

type Props = {
  sender: "bot" | "user";
  text: string;
  time?: string;
};

const ALLOWED_TAGS = [
  "a",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "p",
  "ul",
  "ol",
  "li",
];

const ALLOWED_ATTR = ["href", "target", "rel", "title"];

// Setup link security hook in browser
if (typeof window !== "undefined" && typeof DOMPurify?.addHook === "function") {
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A") {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
  });
}

const emptySubscribe = () => () => {};

const hasHtml = (text: string) => /<\/?[a-z][\s\S]*>/i.test(text);

const stripHtml = (text: string) => text.replace(/<[^>]*>/g, "");

function sanitizeChatHtml(dirty: string): string {
  if (typeof window === "undefined" || typeof DOMPurify?.sanitize !== "function") {
    return stripHtml(dirty);
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}

export default function ChatBubble({ sender, text, time }: Props) {
  const isUser = sender === "user";
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const isRichText = hasHtml(text);
  const safeHtml = isMounted && isRichText ? sanitizeChatHtml(text) : "";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div>
        {time ? (
          <div
            className={`mt-2 text-xs text-slate-400 mb-1 ${isUser ? "text-right" : "text-left"}`}
          >
            {time}
          </div>
        ) : null}
        <div
          className={`max-w-md px-3 py-2.5 text-sm leading-[160%] my-3
        ${isUser ? "bg-[#0f2746] text-white rounded-l-2xl rounded-tr-2xl" : "bg-white text-slate-900 border border-slate-200 rounded-r-2xl rounded-tl-2xl"}`}
        >
          {isRichText ? (
            safeHtml ? (
              <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
            ) : (
              <div>{stripHtml(text)}</div>
            )
          ) : (
            <div>{text}</div>
          )}
        </div>
      </div>
    </div>
  );
}
