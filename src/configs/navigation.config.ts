import type { NavSection } from "@/types/navigation";
import { PERMISSIONS } from "@/lib/permissions";

export const NAVIGATION_CONFIG: NavSection[] = [
  {
    title: "MENU",
    items: [
      { id: "dashboard", label: "Dashboard", icon: "dashboard", href: "/dashboard" },
      { id: "leads", label: "Leads", icon: "leads", href: "/leads", permission: PERMISSIONS.lead.read },
      { id: "payments", label: "Payments", icon: "payments", href: "/payments", permission: PERMISSIONS.payment_transaction.read },
      {
        id: "marketing",
        label: "Marketing",
        icon: "campaigns",
        href: "/marketing/campaigns",
        permission: PERMISSIONS.campaign.read,
        subItems: [
          { id: "marketing-campaigns", label: "Campaigns", icon: "campaigns", href: "/marketing/campaigns", permission: PERMISSIONS.campaign.read },
          { id: "marketing-email-list", label: "Email List", icon: "list", href: "/marketing/email-list", permission: PERMISSIONS.mail_management.view_logs },
          { id: "marketing-lead-groups", label: "Lead Groups", icon: "staffs", href: "/marketing/lead-groups", permission: PERMISSIONS.lead_group.read },
          { id: "marketing-queries", label: "Queries", icon: "staffs", href: "/marketing/queries" },
        ]
      },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      { id: "teams", label: "Teams", icon: "staffs", href: "/teams", permission: PERMISSIONS.member.read },
      {
        id: "website-cms",
        label: "Website CMS",
        icon: "website-cms",
        href: "",
        subItems: [
          { id: "cms-hero-section", label: "Hero Section", icon: "hero", href: "/website-cms/hero-section" },
          { id: "cms-testimonials", label: "Testimonials", icon: "testimonials", href: "/website-cms/testimonials", permission: PERMISSIONS.testimonial.read },
          { id: "cms-news-blog", label: "News & Blog", icon: "news", href: "/website-cms/news-blog", permission: PERMISSIONS.news_and_events.read },
          { id: "cms-gallery", label: "Gallery", icon: "gallery", href: "/website-cms/gallery", permission: PERMISSIONS.gallery.read },
          { id: "cms-faq", label: "FAQ", icon: "faq", href: "/website-cms/faq", permission: PERMISSIONS.faq.read },
          { id: "cms-wash-with-purpose", label: "Others FAQ", icon: "faq", href: "/website-cms/wash-with-purpose", permission: PERMISSIONS.section.read },
        ]
      },
      {
        id: "ai-chatbox",
        label: "AI Chatbox",
        icon: "bot",
        href: "",
        subItems: [
          { id: "ai-chatbox-all-chats", label: "All Chats", icon: "bot", href: "/ai-chatbox" },
          { id: "ai-chatbox-knowledge", label: "Knowledge", icon: "website-cms", href: "/ai-chatbox/knowledge" },
          { id: "ai-chatbox-campaigns", label: "Campaigns", icon: "campaigns", href: "/ai-chatbox/campaigns" },
        ]
      },
      { id: "reports", label: "Reports", icon: "reports", href: "/reports" },
      { id: "activity-log", label: "Activity Log", icon: "activity-log", href: "/activity-log", permission: PERMISSIONS.activity_log.read },
      { id: "settings", label: "Settings", icon: "settings", href: "/settings" },
    ],
  },
];