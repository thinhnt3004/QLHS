"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { FiAlertTriangle, FiDownload } from "react-icons/fi";
import Notification, { useNotification } from "@/components/Notification";

interface FailingStudent {
  student_id: number;
  student_code: string;
  student_name: string;
  class: string;
  total: number;
  failing: number;
  avg: number;
}

export default function ReportsPage() {
  const [failingStudents, setFailingStudents] = useState<FailingStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const { notification, showNotification } = useNotification();

  useEffect(() => {
    fetchFailingStudents();
  }, []);

  const fetchFailingStudents = async () => {
    try {
      const response = await axios.get("http://localhost:8000/statistics/failing-students");
      setFailingStudents(response.data.data);
    } catch (error) {
      showNotification("error", "Lỗi tải dữ liệu");
    }
    setLoading(false);
  };

  const handleSendWarning = async (studentId: number, studentName: string) => {
    try {
      await axios.post(`http://localhost:8000/statistics/send-warning/${studentId}`);
      showNotification("success", `Gửi cảnh báo cho ${studentName} thành công`);
    } catch (error: any) {
      showNotification("error", error.response?.data?.detail || "Lỗi gửi cảnh báo");
    }
  };

  const exportToCSV = () => {
    const headers = ["Mã HS", "Tên HS", "Lớp", "Tổng Môn", "Không Đạt", "Điểm TBC"];
    const rows = failingStudents.map((s) => [
      s.student_code,
      s.student_name,
      s.class,
      s.total,
      s.failing,
      s.avg.toFixed(2),
    ]);

    let csv = headers.join(",") + "\n";
    rows.forEach((row) => {
      csv += row.join(",") + "\n";
    });

    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    link.download = "students-at-risk.csv";
    link.click();

    showNotification("success", "Xuất CSV thành công");
  };

  if (loading)
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">📋 Báo Cáo Học Sinh Yếu</h1>
        <button
          onClick={exportToCSV}
          className="bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
        >
          <FiDownload /> Xuất CSV
        </button>
      </div>

      {failingStudents.length === 0 ? (
        <div className="bg-blue-100 border-l-4 border-blue-600 p-6 rounded">
          <p className="text-blue-900 font-semibold">✅ Tất cả học sinh đều có điểm tốt!</p>
        </div>
      ) : (
        <div className="bg-red-100 border-l-4 border-red-600 p-6 rounded mb-6">
          <div className="flex items-center gap-2 text-red-900">
            <FiAlertTriangle />
            <p className="font-semibold">
              ⚠️ Có {failingStudents.length} học sinh có nguy cơ không đạt
            </p>
          </div>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left font-bold text-gray-700">Mã HS</th>
              <th className="px-6 py-3 text-left font-bold text-gray-700">Tên HS</th>
              <th className="px-6 py-3 text-left font-bold text-gray-700">Lớp</th>
              <th className="px-6 py-3 text-center font-bold text-gray-700">Tổng Môn</th>
              <th className="px-6 py-3 text-center font-bold text-gray-700">Không Đạt</th>
              <th className="px-6 py-3 text-center font-bold text-gray-700">Điểm TBC</th>
              <th className="px-6 py-3 text-center font-bold text-gray-700">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {failingStudents.map((student) => (
              <tr key={student.student_id} className="border-b hover:bg-red-50">
                <td className="px-6 py-3 text-gray-700">{student.student_code}</td>
                <td className="px-6 py-3 font-semibold text-gray-900">
                  <a href={`/students/${student.student_id}`} className="text-blue-600 hover:underline">
                    {student.student_name}
                  </a>
                </td>
                <td className="px-6 py-3 text-gray-700">{student.class}</td>
                <td className="px-6 py-3 text-center">{student.total}</td>
                <td className="px-6 py-3 text-center">
                  <span className="bg-red-100 text-red-900 px-3 py-1 rounded-full font-bold">
                    {student.failing}
                  </span>
                </td>
                <td className="px-6 py-3 text-center font-bold text-red-600">{student.avg.toFixed(2)}</td>
                <td className="px-6 py-3 text-center">
                  <button
                    onClick={() => handleSendWarning(student.student_id, student.student_name)}
                    className="bg-yellow-600 text-white px-4 py-1 rounded hover:bg-yellow-700 text-sm"
                  >
                    Gửi Cảnh Báo
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Notification notification={notification} />
    </div>
  );
}
