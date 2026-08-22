export const getFullImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || '';
    const publicBaseUrl = baseUrl.replace(/\/api\/?$/, '');

    return `${publicBaseUrl}${url}`;
};