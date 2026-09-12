'use client';

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-6 w-full">
            {children}
        </div>
    );
}