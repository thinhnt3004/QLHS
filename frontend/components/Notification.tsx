"use client";

import { useEffect, useState } from "react";

export function useNotification() {
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error" | "info", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  return { notification, showNotification };
}

interface NotificationProps {
  notification: { type: "success" | "error" | "info"; message: string } | null;
}

export default function Notification({ notification }: NotificationProps) {
  if (!notification) return null;

  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  }[notification.type];

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50`}>
      {notification.message}
    </div>
  );
}
