"use client";

import { useState, useEffect } from "react";
import { gradeAPI } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface RankingData {
  ranking: number;
  student_code: string;
  student_name: string;
  gpa: number;
  classification: string;
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingData[]>([]);
  const [loading, setLoading] = useState(false);
  const [classId, setClassId] = useState(1);

  useEffect(() => {
    fetchRanking();
  }, [classId]);

  const fetchRanking = async () => {
    setLoading(true);
    try {
      const response = await gradeAPI.getRanking(classId);
      setRanking(response.data.data);
    } catch (error) {
      console.error("Lỗi khi lấy xếp hạng:", error);
    }
    setLoading(false);
  };

  const classifications = ranking.reduce((acc, student) => {
    const existing = acc.find((c) => c.name === student.classification);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: student.classification, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const COLORS = {
    "Xuất sắc": "#10b981",
    "Giỏi": "#3b82f6",
    "Khá": "#f59e0b",
    "Trung bình": "#ef4444",
    "Yếu": "#6b7280",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Xếp Hạng & GPA</h1>

      {/* Class Selector */}
      <div className="bg-white p-4 rounded-lg shadow">
        <label className="font-semibold text-gray-700">Chọn Lớp: </label>
        <select
          value={classId}
          onChange={(e) => setClassId(Number(e.target.value))}
          className="ml-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={1}>Lớp 10A1</option>
          <option value={2}>Lớp 10A2</option>
          <option value={3}>Lớp 10B1</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Phân Bố Xếp Loại</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={classifications}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {classifications.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || "#808080"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold">GPA Trung Bình</h3>
            <p className="text-3xl font-bold mt-2">
              {(ranking.reduce((sum, s) => sum + s.gpa, 0) / ranking.length || 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold">Số Học Sinh</h3>
            <p className="text-3xl font-bold mt-2">{ranking.length}</p>
          </div>
        </div>
      </div>

      {/* Ranking Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left font-bold text-gray-700">Xếp Hạng</th>
              <th className="px-6 py-3 text-left font-bold text-gray-700">Mã HS</th>
              <th className="px-6 py-3 text-left font-bold text-gray-700">Tên Học Sinh</th>
              <th className="px-6 py-3 text-left font-bold text-gray-700">GPA</th>
              <th className="px-6 py-3 text-left font-bold text-gray-700">Xếp Loại</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((student) => (
              <tr key={student.student_code} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3 font-bold text-lg text-blue-600">#{student.ranking}</td>
                <td className="px-6 py-3 text-gray-700">{student.student_code}</td>
                <td className="px-6 py-3 font-semibold text-gray-900">{student.student_name}</td>
                <td className="px-6 py-3 font-bold text-gray-800">{student.gpa.toFixed(2)}</td>
                <td className="px-6 py-3">
                  <span className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${
                    student.classification === "Xuất sắc" ? "bg-green-500" :
                    student.classification === "Giỏi" ? "bg-blue-500" :
                    student.classification === "Khá" ? "bg-yellow-500" :
                    student.classification === "Trung bình" ? "bg-orange-500" :
                    "bg-red-500"
                  }`}>
                    {student.classification}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
