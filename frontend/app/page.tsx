"use client";

import Link from "next/link";
import { FiUsers, FiBook, FiTrendingUp, FiHome } from "react-icons/fi";

export default function Home() {
  const menuItems = [
    { icon: FiHome, label: "Trang chủ", href: "#", color: "bg-blue-500" },
    { icon: FiUsers, label: "Quản lý Học sinh", href: "/students", color: "bg-green-500" },
    { icon: FiBook, label: "Quản lý Điểm", href: "/grades", color: "bg-purple-500" },
    { icon: FiTrendingUp, label: "Xếp hạng & GPA", href: "/ranking", color: "bg-orange-500" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {menuItems.map((item, index) => (
        <Link href={item.href} key={index}>
          <div className={`${item.color} text-white p-8 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer`}>
            <item.icon className="text-4xl mb-4" />
            <h3 className="text-xl font-bold">{item.label}</h3>
          </div>
        </Link>
      ))}
    </div>
  );
}
