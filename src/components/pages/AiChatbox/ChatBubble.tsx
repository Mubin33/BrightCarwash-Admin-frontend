"use client";

type Props = {
  sender: "bot" | "user";
  text: string;
  time?: string;
};

const allowedTags = new Set([
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
]);

const hasHtml = (text: string) => /<\/?[a-z][\s\S]*>/i.test(text);

const stripHtml = (text: string) => text.replace(/<[^>]*>/g, "");

const sanitizeHtml = (text: string) =>
  text.replace(/<!--[\s\S]*?-->|<[^>]*>/g, (tag) => {
    const match = tag.match(/^<\s*(\/?)\s*([a-z0-9]+)([^>]*)>$/i);
    if (!match) return "";

    const [, closingTag, tagName, attributes] = match;
    const normalizedTag = tagName.toLowerCase();
    if (!allowedTags.has(normalizedTag)) return "";
    if (closingTag) return `</${normalizedTag}>`;
    if (normalizedTag !== "a") return `<${normalizedTag}>`;

    const href = attributes.match(
      /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i,
    );
    const url = href?.[1] || href?.[2] || href?.[3] || "";

    return /^(https?:|mailto:)/i.test(url)
      ? `<a href="${url.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}" target="_blank" rel="noreferrer noopener">`
      : "<a>";
  });

export default function ChatBubble({ sender, text, time }: Props) {
  const isUser = sender === "user";
  const isRichText = hasHtml(text);
  const safeHtml = isRichText ? sanitizeHtml(text) : "";

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
          className={`max-w-md  px-3 py-2.5 text-sm leading-[160%] my-3
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
