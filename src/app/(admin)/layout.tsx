import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: 'Bright Car Wash Admin',
  description: 'Premium Car Wash Administration Dashboard',
  icons: {
    icon: '/images/logo.png',
  },
  openGraph: {
    title: 'Bright Car Wash Admin',
    description: 'Premium Car Wash Administration Dashboard',
    images: [
      {
        url: '/images/logo.png',
        width: 512,
        height: 512,
        alt: 'Bright Car Wash',
      },
    ],
  },
};
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}