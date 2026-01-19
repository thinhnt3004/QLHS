"use client";

import { useState } from "react";

export default function GradesPage() {
  const [semester, setSemester] = useState(1);
  const [year, setYear] = useState(2024);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Quản Lý Điểm</h1>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Học kỳ:</label>
            <select
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>Học kỳ 1</option>
              <option value={2}>Học kỳ 2</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Năm học:</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={2023}>2023-2024</option>
              <option value={2024}>2024-2025</option>
              <option value={2025}>2025-2026</option>
            </select>
          </div>
        </div>
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold">
          Tìm Kiếm
        </button>
      </div>

      {/* Coming Soon */}
      <div className="bg-gray-100 border-2 border-gray-300 p-12 rounded-lg text-center">
        <p className="text-xl text-gray-600 font-semibold">Tính năng Quản Lý Điểm sẽ được cập nhật sớm</p>
      </div>
    </div>
  );
}
