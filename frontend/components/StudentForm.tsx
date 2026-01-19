"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import { studentAPI } from "@/lib/api";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";

interface StudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  studentId?: number;
}

export default function StudentForm({ isOpen, onClose, onSuccess, studentId }: StudentFormProps) {
  const [formData, setFormData] = useState({
    student_code: "",
    student_name: "",
    date_of_birth: "",
    email: "",
    phone: "",
    address: "",
    class_id: 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (studentId) {
      // Load student data for edit
      const loadStudent = async () => {
        try {
          const response = await studentAPI.getById(studentId);
          const student = response.data.data;
          setFormData({
            student_code: student.student_code,
            student_name: student.student_name,
            date_of_birth: student.date_of_birth || "",
            email: student.email || "",
            phone: student.phone || "",
            address: student.address || "",
            class_id: 1,
          });
        } catch (err) {
          console.error("Error loading student:", err);
        }
      };
      loadStudent();
    }
  }, [studentId]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      if (studentId) {
        await studentAPI.update(studentId, formData);
      } else {
        await studentAPI.create(formData);
      }
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Lỗi xử lý");
    }
    setLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={studentId ? "Sửa Học Sinh" : "Thêm Học Sinh"}
    >
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 flex items-center gap-2">
          <FiAlertCircle /> {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded mb-4 flex items-center gap-2">
          <FiCheckCircle /> Thành công!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="student_code"
          placeholder="Mã học sinh"
          value={formData.student_code}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={!!studentId}
        />

        <input
          type="text"
          name="student_name"
          placeholder="Tên học sinh"
          value={formData.student_name}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <input
          type="date"
          name="date_of_birth"
          value={formData.date_of_birth}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          name="phone"
          placeholder="Số điện thoại"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          name="address"
          placeholder="Địa chỉ"
          value={formData.address}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          name="class_id"
          value={formData.class_id}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={1}>Lớp 10A1</option>
          <option value={2}>Lớp 10A2</option>
          <option value={3}>Lớp 10B1</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Đang xử lý..." : studentId ? "Cập nhật" : "Thêm"}
        </button>
      </form>
    </Modal>
  );
}
