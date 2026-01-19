"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiLogOut, FiBarChart3, FiAlertTriangle, FiUsers } from "react-icons/fi";
import axios from "axios";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [gpaData, setGpaData] = useState<any[]>([]);
  const [gradeData, setGradeData] = useState<any[]>([]);
  const [classStats, setClassStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !userData) {
      router.push("/auth/login");
      return;
    }

    setUser(JSON.parse(userData));
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, gpaRes, gradeRes, classRes] = await Promise.all([
        axios.get("http://localhost:8000/statistics/dashboard"),
        axios.get("http://localhost:8000/statistics/gpa-distribution"),
        axios.get("http://localhost:8000/statistics/average-grade"),
        axios.get("http://localhost:8000/statistics/class-stats"),
      ]);

      setStats(statsRes.data.data);
      setGpaData(gpaRes.data.data);
      setGradeData(gradeRes.data.data);
      setClassStats(classRes.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-lg p-6 flex justify-between items-center sticky top-0 z-40">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">📊 Dashboard</h1>
          <p className="text-gray-600">Xin chào, {user.full_name}</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition"
        >
          <FiLogOut /> Đăng Xuất
        </button>
      </nav>

      {loading ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-600">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm">Tổng Học Sinh</p>
                  <p className="text-4xl font-bold text-blue-600">{stats?.total_students || 0}</p>
                </div>
                <FiUsers className="text-4xl text-blue-200" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-600">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm">Giáo Viên</p>
                  <p className="text-4xl font-bold text-green-600">{stats?.total_teachers || 0}</p>
                </div>
                <FiBarChart3 className="text-4xl text-green-200" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-600">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm">Lớp Học</p>
                  <p className="text-4xl font-bold text-purple-600">{stats?.total_classes || 0}</p>
                </div>
                <FiBarChart3 className="text-4xl text-purple-200" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-yellow-600">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm">Xuất Sắc</p>
                  <p className="text-4xl font-bold text-yellow-600">{stats?.excellent_students || 0}</p>
                </div>
                <FiBarChart3 className="text-4xl text-yellow-200" />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GPA Distribution */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Phân Bố Xếp Loại</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gpaData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {gpaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Average Grade by Subject */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Điểm Trung Bình Môn</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={gradeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" angle={-45} textAnchor="end" height={80} />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Bar dataKey="average" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Class Statistics */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Thống Kê Theo Lớp</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={classStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="class" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="students" stroke="#3b82f6" name="Số HS" />
                <Line yAxisId="right" type="monotone" dataKey="avg_gpa" stroke="#10b981" name="GPA TBC" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/students" className="bg-blue-100 p-6 rounded-lg border-l-4 border-blue-600 hover:shadow-lg transition">
              <h3 className="text-lg font-bold text-blue-900">👥 Quản lý Học sinh</h3>
              <p className="text-blue-700 mt-2">Xem, thêm, sửa thông tin học sinh</p>
            </a>
            <a href="/ranking" className="bg-green-100 p-6 rounded-lg border-l-4 border-green-600 hover:shadow-lg transition">
              <h3 className="text-lg font-bold text-green-900">🏆 Xếp Hạng & GPA</h3>
              <p className="text-green-700 mt-2">Xem xếp hạng và GPA học sinh</p>
            </a>
            <a href="/grades" className="bg-purple-100 p-6 rounded-lg border-l-4 border-purple-600 hover:shadow-lg transition">
              <h3 className="text-lg font-bold text-purple-900">📊 Quản lý Điểm</h3>
              <p className="text-purple-700 mt-2">Nhập và cập nhật điểm học sinh</p>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
