"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/lib/store";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { NAVIGATION_CONFIG } from "@/configs/navigation.config";
import type { NavbarProps } from "@/types/navigation";
import Notification from "./Notification";
import Image from "next/image";

const staticPageTitles: Record<string, string> = {
	"/dashboard": "Dashboard",
	"/leads": "Lead Insights",
	"/leads/groups": "Lead Groups",
	"/payments": "All Transactions",
	"/campaigns": "Email Campaigns",
	"/campaigns/create": "Create Campaign",
	"/campaigns/create/editor": "Campaign Editor",
	"/campaigns/create/simple-editor": "Simple Editor",
	"/marketing/campaigns": "Email Campaigns",
	"/marketing/email-list": "Email Logs",
	"/marketing/email-list/create": "Create Email Log",
	"/marketing/lead-groups": "Lead Groups",
	"/marketing/queries": "Queries",
	"/teams": "Team Management",
	"/templates": "Email Templates",
	"/templates/select": "Select Template",
	"/website-cms": "Website CMS",
	"/website-cms/hero-section": "Hero Section",
	"/website-cms/testimonials": "Testimonials",
	"/website-cms/news-blog": "News & Blog",
	"/website-cms/news-blog/create": "Create News & Blog",
	"/website-cms/gallery": "Gallery",
	"/website-cms/faq": "FAQ",
	"/website-cms/wash-with-purpose": "Others FAQ",
	"/website-cms/business-hours": "Timing",
	"/ai-chatbox": "AI Chatbot Insights",
	"/ai-chatbox/knowledge": "Knowledge Base",
	"/ai-chatbox/campaigns": "AI Campaigns",
	"/reports": "Reports",
	"/notifications": "Notifications",
	"/activity-log": "Activity Log",
	"/settings": "Settings",
	"/settings/change-password": "Change Password",
	"/settings/business": "Business Settings",
	"/settings/security": "Security Settings",
};

function formatSlug(slug: string): string {
	return slug
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

function resolvePageTitle(pathname: string): string {
	if (!pathname || pathname === "/") return "Welcome back";

	// 1. Direct match in staticPageTitles
	if (staticPageTitles[pathname]) {
		return staticPageTitles[pathname];
	}

	// 2. Pattern matching for dynamic / nested routes
	if (/^\/leads\/[^\/]+$/.test(pathname)) {
		return "Lead Details";
	}
	if (/^\/campaigns\/[^\/]+$/.test(pathname)) {
		return "Campaign Details";
	}

	// 3. Match from NAVIGATION_CONFIG
	for (const section of NAVIGATION_CONFIG) {
		for (const item of section.items) {
			if (item.href && item.href === pathname) {
				return item.label;
			}
			if (item.subItems) {
				for (const sub of item.subItems) {
					if (sub.href && sub.href === pathname) {
						return sub.label;
					}
				}
			}
		}
	}

	// 4. Prefix match for nested subroutes
	for (const [route, title] of Object.entries(staticPageTitles)) {
		if (route !== "/dashboard" && route !== "/" && pathname.startsWith(route + "/")) {
			const remaining = pathname.slice(route.length + 1).split("/")[0];
			return `${title} - ${formatSlug(remaining)}`;
		}
	}

	// 5. Fallback from last path segment
	const segments = pathname.split("/").filter(Boolean);
	if (segments.length > 0) {
		const last = segments[segments.length - 1];
		return formatSlug(last);
	}

	return "Welcome back";
}

export function Navbar({ onMenuClick }: NavbarProps) {
	const pathname = usePathname();
	const user = useAppSelector((state) => state.auth.user);
	const [avatarError, setAvatarError] = useState(false);

	const title = resolvePageTitle(pathname);

	useEffect(() => {
		if (typeof document !== "undefined") {
			document.title = `${title} | Bright Car Wash Admin`;
		}
	}, [title]);

	const fullName = user?.firstName && user?.lastName
		? `${user.firstName} ${user.lastName}`
		: user?.firstName || 'User';
	const initials = user?.firstName?.charAt(0) || 'U';

	const avatarUrl = user?.avatar_url || user?.avatar;

	return (
		<header className="flex w-full h-18 px-3 sm:px-4 lg:px-6 py-5 justify-between items-center border-b border-[#DFE1E7] bg-white sticky top-0 z-30">
			<div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
				<Button
					variant="icon"
					onClick={onMenuClick}
					className="flex p-2 items-center rounded-lg border border-[#E8E8E9] bg-white cursor-pointer lg:hidden shrink-0"
					aria-label="Toggle sidebar"
				>
					<Icon name="menu" width={24} height={24} />
				</Button>
				<h1 className="text-[#1B1B1B] font-inter text-base sm:text-lg lg:text-2xl font-medium leading-[150%] tracking-[-0.36px] m-0 truncate">
					{title}
				</h1>
			</div>

			<div className="flex items-center gap-1 sm:gap-2 shrink-0">
				<Notification />
				<div className="flex p-1.5 items-center gap-2 lg:gap-4 rounded-lg border border-[#E8E8E9] bg-white">
					<div className="flex items-center gap-2">
						<div className="rounded-full overflow-hidden w-7 h-7 shrink-0">
							{avatarUrl ? (
								!avatarError ? (
									<Image
										src={avatarUrl}
										alt={fullName}
										width={28}
										height={28}
										className="w-full h-full object-cover"
										onError={() => setAvatarError(true)}
									/>
								) : (
									<div className="w-7 h-7 rounded-full bg-[#B23730] text-white flex items-center justify-center font-inter text-xs font-medium">
										{initials}
									</div>
								)
							) : (
								<div className="w-7 h-7 rounded-full bg-[#B23730] text-white flex items-center justify-center font-inter text-xs font-medium">
									{initials}
								</div>
							)}
						</div>
						<span className="hidden lg:block text-[#1F274B] font-inter text-xs font-normal leading-[100%] truncate lg:min-w-0 sm:min-w-25">
							{fullName}
						</span>
					</div>
				</div>
			</div>
		</header>
	);
}
