"use client";

import { useState, useEffect } from "react";
import { studentAPI } from "@/lib/api";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";

interface Student {
  student_id: number;
  student_code: string;
  student_name: string;
  email: string;
  phone: string;
  class_name: string;
  status: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await studentAPI.getAll();
      setStudents(response.data.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách học sinh:", error);
    }
    setLoading(false);
  };

  const filteredStudents = students.filter((student) =>
    student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_code.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Quản Lý Học Sinh</h1>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <FiPlus /> Thêm Học Sinh
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc mã học sinh..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left font-bold text-gray-700">Mã HS</th>
                <th className="px-6 py-3 text-left font-bold text-gray-700">Tên Học Sinh</th>
                <th className="px-6 py-3 text-left font-bold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left font-bold text-gray-700">Lớp</th>
                <th className="px-6 py-3 text-left font-bold text-gray-700">Trạng Thái</th>
                <th className="px-6 py-3 text-center font-bold text-gray-700">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.student_id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-700">{student.student_code}</td>
                  <td className="px-6 py-3 font-semibold text-gray-900">{student.student_name}</td>
                  <td className="px-6 py-3 text-gray-600">{student.email || "-"}</td>
                  <td className="px-6 py-3 text-gray-700">{student.class_name}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 rounded-full text-white text-sm ${
                      student.status === "Đang học" ? "bg-green-500" : "bg-red-500"
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <FiEdit2 />
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
