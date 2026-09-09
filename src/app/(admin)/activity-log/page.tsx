import { ActivityLogContent } from '@/components/pages/activity-log';

export const revalidate = 60;

export default function ActivityLogPage() {
  return <ActivityLogContent />;
}