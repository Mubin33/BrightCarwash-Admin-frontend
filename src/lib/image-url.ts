export const getFullImageUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;

  const publicBaseUrl = process.env.NEXT_PUBLIC_STORAGE_URL?.trim() || "";
  //   const publicBaseUrl = baseUrl.replace(/\/api\/?$/, "");

  return `${publicBaseUrl}${url}`;
};
