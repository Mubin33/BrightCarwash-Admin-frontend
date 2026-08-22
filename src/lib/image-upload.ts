export async function uploadImagesInHtml(
    html: string,
    uploadImage: (file: File) => Promise<{ url: string }>
): Promise<string> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const images = doc.querySelectorAll('img');
    const uploads: Promise<void>[] = [];

    images.forEach((img) => {
        const src = img.getAttribute('src');
        if (src && (src.startsWith('blob:') || src.startsWith('data:'))) {
            const promise = (async () => {
                const blob = await fetch(src).then((r) => r.blob());
                const file = new File([blob], `image-${Date.now()}.${blob.type.split('/')[1] || 'png'}`, {
                    type: blob.type,
                });
                const { url } = await uploadImage(file);
                img.setAttribute('src', url);
            })();
            uploads.push(promise);
        }
    });

    await Promise.all(uploads);
    return doc.body.innerHTML;
}