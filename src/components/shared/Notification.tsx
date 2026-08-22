"use client";

import React, { useEffect, useRef, useState } from "react";
import BellIcon from "../../../public/icons/custom/BellIcon";
import GoArrowRight from "../../../public/icons/custom/GoArrowRight";
import Link from "next/link";
import {
  GetNotificationParams,
  useGetNotificationQuery,
  useReadAllNotificationMutation,
  useGetNotificationMetricsQuery,
} from "@/services/notification.api";
import { formatNotificationTime } from "@/lib/formatNotificationTime";
import { useNotificationSocket } from "@/context/SocketContext";

export default function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { socket } = useNotificationSocket();
  const { data: metricsData } = useGetNotificationMetricsQuery();
  const initialCount = metricsData?.data?.unread || 0;
  const [count, setCount] = useState(initialCount);


  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_in_app_notification', (data) => {
      setCount((prev: number) => prev + 1);
    });
    return () => {
      socket.off('new_in_app_notification');
    };
  }, [socket]);

  const { data, isLoading, error } = useGetNotificationQuery({
    page: 1,
    limit: 5,
  } as GetNotificationParams);
  const notifications = data?.data?.items || [];

  const [readAll] = useReadAllNotificationMutation();
  const handleReadAll = async () => {
    await readAll();
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => {
          setIsOpen((prev) => !prev);
          handleReadAll();
          setCount(0);
        }}
        className="cursor-pointer rounded-lg border border-[#DFE1E7] p-2 duration-300 hover:bg-gray-50"
      >
        {count > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[#B23730] text-white text-xs font-bold flex items-center justify-center">
            {count}
          </span>
        )}
        <BellIcon />

      </button>

      <div
        className={`absolute right-0 mt-2 sm:w-72 lg:w-96 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0px_0px_3px_rgba(0,0,0,0.12)] transition-all duration-200 ease-out ${isOpen
            ? "visible translate-y-0 scale-100 opacity-100"
            : "invisible -translate-y-2 scale-95 opacity-0"
          }`}
      >
        <div>
          {notifications?.length > 0 ? (
            <div>
              {notifications?.map((notification) => (
                <div
                  key={notification?.id}
                  className="flex items-center justify-between text-sm border-b border-[#E5E7EB] py-3"
                >
                  <div className="space-y-2">
                    <p className="text-sm lg:text-base font-semibold text-[#1D1F2C]">
                      {notification?.title}
                    </p>
                    <p className="text-[#777980] text-xs lg:text-sm line-clamp-1">
                      {notification?.body}
                    </p>
                  </div>
                  <span className="text-xs text-[#4B5563] text-nowrap">
                    {formatNotificationTime(notification?.created_at)}
                  </span>
                </div>
              ))}
              <Link
                href="/notifications"
                className="text-[#B23730] hover:text-[#B23730]/80 duration-300 text-sm font-semibold flex justify-center items-center gap-1 w-full cursor-pointer mt-4 "
              >
                <button onClick={() => {
                  setIsOpen(false);
                  setCount(0);
                }} className="w-full flex justify-center items-center gap-1 cursor-pointer">
                  View all <GoArrowRight />
                </button>
              </Link>
            </div>
          ) : (
            <p className="text-center flex items-center justify-center text-[#777980] text-xs lg:text-sm h-44">
              No notifications
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
