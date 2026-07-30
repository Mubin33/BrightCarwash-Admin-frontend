import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    const path = params.path.join('/');
    const s3Url = `https://s3.us-east-1.amazonaws.com/bright-side-car-wash/stage/${path}`;
    console.log(s3Url)
    try {
        const response = await fetch(s3Url);
        const blob = await response.blob();

        return new NextResponse(blob, {
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'image/svg+xml',
                'Cache-Control': 'public, max-age=86400',
            },
        });
    } catch (error) {
        return new NextResponse('Not found', { status: 404 });
    }
}