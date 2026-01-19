"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.push("/auth/login");
      return;
    }

    const userData = JSON.parse(user);
    console.log("User role:", userData.role);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-700">
            Xin chào, <strong>{user.full_name}</strong> ({user.role})
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Đăng Xuất
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <h2 className="text-3xl font-bold text-gray-800">Xin chào {user.full_name}! 👋</h2>

        {/* Role-based content */}
        {user.role === "Admin" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-100 p-6 rounded-lg border-l-4 border-blue-600">
              <h3 className="text-lg font-bold text-blue-900">👥 Quản lý User</h3>
              <p className="text-blue-700 mt-2">Quản lý tài khoản và phân quyền</p>
            </div>
            <div className="bg-green-100 p-6 rounded-lg border-l-4 border-green-600">
              <h3 className="text-lg font-bold text-green-900">📊 Thống kê Toàn Trường</h3>
              <p className="text-green-700 mt-2">Xem báo cáo tổng quát</p>
            </div>
            <div className="bg-purple-100 p-6 rounded-lg border-l-4 border-purple-600">
              <h3 className="text-lg font-bold text-purple-900">⚙️ Cài đặt Hệ thống</h3>
              <p className="text-purple-700 mt-2">Quản lý cấu hình hệ thống</p>
            </div>
          </div>
        )}

        {user.role === "Teacher" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-100 p-6 rounded-lg border-l-4 border-blue-600">
              <h3 className="text-lg font-bold text-blue-900">👨‍🎓 Danh sách Học sinh</h3>
              <p className="text-blue-700 mt-2">Xem danh sách học sinh của lớp</p>
            </div>
            <div className="bg-green-100 p-6 rounded-lg border-l-4 border-green-600">
              <h3 className="text-lg font-bold text-green-900">📝 Nhập Điểm</h3>
              <p className="text-green-700 mt-2">Nhập/cập nhật điểm học sinh</p>
            </div>
          </div>
        )}

        {user.role === "Student" && (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-blue-100 p-6 rounded-lg border-l-4 border-blue-600">
              <h3 className="text-lg font-bold text-blue-900">📈 Xem Điểm & GPA</h3>
              <p className="text-blue-700 mt-2">Xem điểm các môn học và xếp loại của bạn</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
