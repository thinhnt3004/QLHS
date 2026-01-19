"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FiUser, FiLock } from "react-icons/fi";

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:8000/auth/login", credentials);
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Lỗi đăng nhập");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Quản Lý Trường Học</h1>
        <p className="text-center text-gray-500 mb-8">Đăng nhập để tiếp tục</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Tên đăng nhập</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-500">
              <FiUser className="text-gray-400 mr-2" />
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                placeholder="username"
                className="w-full py-2 outline-none"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Mật khẩu</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-500">
              <FiLock className="text-gray-400 mr-2" />
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full py-2 outline-none"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Chưa có tài khoản?{" "}
          <a href="/auth/register" className="text-blue-600 font-bold hover:underline">
            Đăng ký
          </a>
        </p>

        {/* Demo Accounts */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm font-bold text-gray-700 mb-2">Tài khoản demo:</p>
          <div className="text-xs text-gray-600 space-y-1">
            <p>👨‍💼 Admin: admin / 123456</p>
            <p>👨‍🏫 Teacher: teacher / 123456</p>
            <p>👨‍🎓 Student: student / 123456</p>
          </div>
        </div>
      </div>
    </div>
  );
}
