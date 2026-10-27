"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { Sidebar } from "@/components/shared/Sidebar";
import { PermissionGuard } from "@/components/shared/PermissionGuard";
import { useAppSelector } from "@/lib/store";

function DashboardContentSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading dashboard content">
      {/* Top Header Placeholder */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="h-8 w-44 bg-gray-200 rounded-md" />
        <div className="h-10 w-28 bg-gray-200 rounded-md" />
      </div>

      {/* Metric Cards Placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-100 border border-gray-200/80 rounded-xl p-4 flex flex-col justify-between">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-7 w-20 bg-gray-300 rounded" />
          </div>
        ))}
      </div>

      {/* Main Content / Table Area Placeholder */}
      <div className="min-h-[400px] bg-gray-50 border border-gray-200/80 rounded-xl p-6 space-y-4">
        <div className="h-6 w-36 bg-gray-200 rounded" />
        <div className="space-y-3 pt-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200/60 rounded-md w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);
  const router = useRouter();

  // Redirect to login if user is definitely unauthenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-[250px]">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-3 sm:p-4 lg:p-6 bg-white">
          {isLoading || !isAuthenticated || !user ? (
            <DashboardContentSkeleton />
          ) : (
            <PermissionGuard>
              {children}
            </PermissionGuard>
          )}
        </main>
      </div>
    </div>
  );
}
