"use client";
import { useEffect, useState } from "react";
import { Pagination } from "@/components/ui/Pagination";
import { formatNotificationTime } from "@/lib/formatNotificationTime";
import {
  GetNotificationParams,
  useGetNotificationQuery,
} from "@/services/notification.api";
import { useRouter } from "next/navigation";
import { useParams } from "@/hooks/useParams";

const ITEMS_PER_PAGE = 10;

export default function NotificationsPage() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const router = useRouter();
   const [queryState, setQueryState] = useParams({
        page: "1",
        limit: ITEMS_PER_PAGE.toString(),
      });
  
  const { data, isLoading, error } = useGetNotificationQuery({
    page: Number(queryState.page || 1),
    limit: Number(queryState.limit || ITEMS_PER_PAGE.toString()),
  } as GetNotificationParams);

  const notifications = data?.data?.items || [];
  const totalItems = data?.data?.meta?.total || 0;
  const totalPages =
    data?.data?.meta?.total_pages ||
    Math.max(1, Math.ceil(totalItems / Number(queryState.limit || ITEMS_PER_PAGE.toString())));
  useEffect(() => {
    router.push(`/notifications?page=${queryState.page}`, {
      scroll: false,
    });
  }, [queryState, router]);

  return (
    <div className="space-y-2">
      {notifications?.map((notification) => (
        <div
          key={notification?.id}
          className="rounded-2xl border border-[#DFE1E7] bg-[#F8FAFB] p-5 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-base xl:text-lg text-[#1D1F2C] font-semibold">
                {notification?.title}
              </p>
              <p className="text-xs xl:text-sm text-[#4A4C56]">
                {notification?.body}
              </p>
            </div>
            <span className="text-sm xl:text-base text-[#1B1B1B]">
              {formatNotificationTime(notification?.created_at)}
            </span>
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <Pagination
          currentPage={Number(queryState.page || 1)}
          totalPages={totalPages}
          onPageChange={(page) => setQueryState({ page: page.toString() })}
          totalItems={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
