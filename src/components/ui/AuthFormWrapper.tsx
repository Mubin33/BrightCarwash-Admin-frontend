import { ReactNode } from "react";

interface AuthFormWrapperProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthFormWrapper({ title, subtitle, children, footer }: AuthFormWrapperProps) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-sm">
        <h1 className="text-2xl font-semibold text-center mb-2">{title}</h1>
        {subtitle && <p className="text-center text-gray-500 mb-6">{subtitle}</p>}
        {!subtitle && <div className="mb-6" />}
        {children}
        {footer && (
          <p className="text-center text-sm text-gray-500 mt-4">{footer}</p>
        )}
      </div>
    </main>
  );
}