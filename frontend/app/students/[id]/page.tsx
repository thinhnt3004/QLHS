"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { FiArrowLeft, FiMail, FiPhone, FiBook } from "react-icons/fi";
import Notification, { useNotification } from "@/components/Notification";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id;
  
  const [student, setStudent] = useState<any>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { notification, showNotification } = useNotification();

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      const [studentRes, gradesRes, reportRes] = await Promise.all([
        axios.get(`http://localhost:8000/students/${studentId}`),
        axios.get(`http://localhost:8000/grades/student/${studentId}`),
        axios.get(`http://localhost:8000/statistics/student-report/${studentId}`),
      ]);

      setStudent({
        ...studentRes.data.data,
        report: reportRes.data.data,
      });
      setGrades(gradesRes.data.data);
      setLoading(false);
    } catch (error) {
      showNotification("error", "Lỗi tải dữ liệu");
      setLoading(false);
    }
  };

  const handleSendWarning = async () => {
    try {
      await axios.post(`http://localhost:8000/statistics/send-warning/${studentId}`);
      showNotification("success", "Gửi cảnh báo thành công");
    } catch (error: any) {
      showNotification("error", error.response?.data?.detail || "Lỗi gửi cảnh báo");
    }
  };

  const gradesBySubject = grades.reduce((acc: any[], grade: any) => {
    const existing = acc.find((g) => g.subject_name === grade.subject_name);
    if (existing) {
      existing.grades.push(grade.final_point);
    } else {
      acc.push({
        subject_name: grade.subject_name,
        grades: [grade.final_point],
        avg: grade.final_point,
      });
    }
    return acc;
  }, []);

  if (loading)
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg p-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 transition"
        >
          <FiArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Chi Tiết Học Sinh</h1>
      </nav>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Student Info Card */}
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">{student?.student_name}</h2>
              <div className="space-y-3 text-gray-600">
                <p>
                  <strong>Mã HS:</strong> {student?.student_code}
                </p>
                <p>
                  <strong>Lớp:</strong> {student?.class_name}
                </p>
                <p>
                  <strong>Ngày sinh:</strong> {student?.date_of_birth || "-"}
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <FiMail /> <a href={`mailto:${student?.email}`}>{student?.email || "-"}</a>
                </div>
                <div className="flex items-center gap-2">
                  <FiPhone /> <span>{student?.phone || "-"}</span>
                </div>
              </div>
            </div>

            {/* GPA Card */}
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                <p className="text-sm opacity-80">GPA</p>
                <p className="text-4xl font-bold">{student?.report?.gpa?.toFixed(2)}</p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
                <p className="text-sm opacity-80">Xếp Loại</p>
                <p className="text-2xl font-bold">{student?.report?.classification}</p>
              </div>
              {student?.report?.avg < 5 && (
                <button
                  onClick={handleSendWarning}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition"
                >
                  ⚠️ Gửi Cảnh Báo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-gray-600">Tổng Môn Học</p>
            <p className="text-3xl font-bold text-blue-600">{student?.report?.total_subjects}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-gray-600">Đạt</p>
            <p className="text-3xl font-bold text-green-600">{student?.report?.passed}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-gray-600">Không Đạt</p>
            <p className="text-3xl font-bold text-red-600">{student?.report?.failed}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-gray-600">Tỷ Lệ Đạt</p>
            <p className="text-3xl font-bold text-purple-600">
              {student?.report?.total_subjects > 0
                ? ((student?.report?.passed / student?.report?.total_subjects) * 100).toFixed(0)
                : 0}
              %
            </p>
          </div>
        </div>

        {/* Grades Table */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Bảng Điểm</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-bold">Môn Học</th>
                  <th className="px-4 py-2 text-center font-bold">Quá Trình</th>
                  <th className="px-4 py-2 text-center font-bold">Giữa Kỳ</th>
                  <th className="px-4 py-2 text-center font-bold">Cuối Kỳ</th>
                  <th className="px-4 py-2 text-center font-bold">Bộ Môn</th>
                  <th className="px-4 py-2 text-center font-bold">Kết Quả</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((grade, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{grade.subject_name}</td>
                    <td className="px-4 py-3 text-center">{grade.continuous_grade?.toFixed(1)}</td>
                    <td className="px-4 py-3 text-center">{grade.midterm_grade?.toFixed(1)}</td>
                    <td className="px-4 py-3 text-center">{grade.final_grade?.toFixed(1)}</td>
                    <td className="px-4 py-3 text-center font-bold">{grade.final_point?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-white text-sm ${
                          grade.status === "Đạt" ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {grade.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Biểu Đồ Điểm Theo Môn</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gradesBySubject}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject_name" angle={-45} textAnchor="end" height={100} />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Bar dataKey="avg" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Notification notification={notification} />
    </div>
  );
}
