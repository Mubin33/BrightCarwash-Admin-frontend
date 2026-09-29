"use client";

import { NAVIGATION_CONFIG } from "@/configs/navigation.config";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import { useAppSelector } from "@/lib/store";
import { ArrowLeft, LayoutDashboard, Lock, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// Explicit route-to-permission mapping with regex pattern matching
const ROUTE_PERMISSIONS: { pattern: RegExp; permission: string | string[] }[] =
  [
    // Dashboard & Subroutes
    {
      pattern: /^\/dashboard(\/.*)?$/,
      permission: [PERMISSIONS.dashboard.view, "dashboard:*"],
    },

    // Reports & Subroutes
    {
      pattern: /^\/reports(\/.*)?$/,
      permission: [
        PERMISSIONS.report.stage,
        PERMISSIONS.report.campaign,
        PERMISSIONS.report.member,
        "report:*",
      ],
    },

    // Leads & Subroutes
    { pattern: /^\/leads(\/.*)?$/, permission: PERMISSIONS.lead.read },

    // Payments & Subroutes
    {
      pattern: /^\/payments(\/.*)?$/,
      permission: PERMISSIONS.payment_transaction.read,
    },

    // Teams & Subroutes
    {
      pattern: /^\/teams(\/.*)?$/,
      permission: [PERMISSIONS.member.read, PERMISSIONS.role.read],
    },

    // Campaigns & Subroutes (both /campaigns and /marketing/campaigns)
    { pattern: /^\/campaigns(\/.*)?$/, permission: PERMISSIONS.campaign.read },
    {
      pattern: /^\/marketing\/campaigns(\/.*)?$/,
      permission: PERMISSIONS.campaign.read,
    },

    // Email Logs
    {
      pattern: /^\/marketing\/email-list(\/.*)?$/,
      permission: PERMISSIONS.mail_management.view_logs,
    },

    // Lead Groups
    {
      pattern: /^\/marketing\/lead-groups(\/.*)?$/,
      permission: PERMISSIONS.lead_group.read,
    },

    // Activity Log
    {
      pattern: /^\/activity-log(\/.*)?$/,
      permission: PERMISSIONS.activity_log.read,
    },

    // Website CMS Subroutes with specific permissions
    {
      pattern: /^\/website-cms\/testimonials(\/.*)?$/,
      permission: PERMISSIONS.testimonial.read,
    },
    {
      pattern: /^\/website-cms\/news-blog(\/.*)?$/,
      permission: PERMISSIONS.news_and_events.read,
    },
    {
      pattern: /^\/website-cms\/gallery(\/.*)?$/,
      permission: PERMISSIONS.gallery.read,
    },
    {
      pattern: /^\/website-cms\/faq(\/.*)?$/,
      permission: PERMISSIONS.faq.read,
    },
    {
      pattern: /^\/website-cms\/wash-with-purpose(\/.*)?$/,
      permission: PERMISSIONS.section.read,
    },
    {
      pattern: /^\/website-cms\/business-hours(\/.*)?$/,
      permission: PERMISSIONS.section.read,
    },
  ];

function getRequiredPermission(pathname: string): string | string[] | null {
  // 1. Check direct pattern map
  for (const route of ROUTE_PERMISSIONS) {
    if (route.pattern.test(pathname)) {
      return route.permission;
    }
  }

  // 2. Check NAVIGATION_CONFIG dynamically for any route not explicitly listed above
  for (const section of NAVIGATION_CONFIG) {
    for (const item of section.items) {
      if (
        item.href &&
        item.href !== "" &&
        (pathname === item.href || pathname.startsWith(item.href + "/"))
      ) {
        if (item.permission) return item.permission;
      }
      if (item.subItems) {
        for (const sub of item.subItems) {
          if (
            sub.href &&
            sub.href !== "" &&
            (pathname === sub.href || pathname.startsWith(sub.href + "/"))
          ) {
            if (sub.permission) return sub.permission;
          }
        }
      }
    }
  }

  return null;
}

interface AccessDeniedProps {
  requiredPermission: string | string[];
}

function AccessDeniedView({ requiredPermission }: AccessDeniedProps) {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const canAccessDashboard = hasPermission(user, [
    PERMISSIONS.dashboard.view,
    "dashboard:*",
  ]);
  const displayPermission = Array.isArray(requiredPermission)
    ? requiredPermission.filter((p) => !p.endsWith(":*")).join(" or ")
    : requiredPermission;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8 text-center animate-fade-in">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-[#FFE6E6] flex items-center justify-center text-[#B23730] shadow-sm ring-8 ring-[#FFE6E6]/50">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#B23730] text-white flex items-center justify-center shadow-md">
          <Lock className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="max-w-md space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-xs font-semibold text-[#B23730] uppercase tracking-wider">
          403 Forbidden
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold font-inter text-[#0B1220] tracking-tight">
          Access Restricted
        </h2>

        <p className="text-sm sm:text-base text-[#777980] font-inter leading-relaxed">
          You don&apos;t have the required permission to access this page. If
          you believe this is an error, please contact your workspace
          administrator.
        </p>

        <div className="pt-1 pb-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 text-xs font-mono text-gray-600 border border-gray-200">
            Required:{" "}
            <span className="font-semibold text-gray-800">
              {displayPermission}
            </span>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          {canAccessDashboard && (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#B23730] text-white text-sm font-medium hover:bg-[#962e28] transition-colors shadow-sm cursor-pointer no-underline"
            >
              <LayoutDashboard className="w-4 h-4" />
              Back to Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function PermissionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  // If still loading or user profile hasn't loaded yet, let parent skeleton handle it
  if (isLoading || !user) {
    return null;
  }

  const requiredPermission = getRequiredPermission(pathname);

  // If no specific permission is required for this route, allow access
  if (!requiredPermission) {
    return <>{children}</>;
  }

  // Check if user has the required permission
  const allowed = hasPermission(user, requiredPermission);

  if (!allowed) {
    return <AccessDeniedView requiredPermission={requiredPermission} />;
  }

  return <>{children}</>;
}
