"use client";

import { useState } from "react";
import Modal from "./Modal";
import { gradeAPI } from "@/lib/api";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";

interface GradeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  studentId: number;
  gradeId?: number;
}

export default function GradeForm({ isOpen, onClose, onSuccess, studentId, gradeId }: GradeFormProps) {
  const [formData, setFormData] = useState({
    student_id: studentId,
    subject_id: 1,
    semester: 1,
    year: 2024,
    continuous_grade: 0,
    midterm_grade: 0,
    final_grade: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      if (gradeId) {
        await gradeAPI.update(gradeId, formData);
      } else {
        await gradeAPI.create(formData);
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
      title={gradeId ? "Sửa Điểm" : "Thêm Điểm"}
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
        <select
          name="subject_id"
          value={formData.subject_id}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={1}>Toán</option>
          <option value={2}>Văn</option>
          <option value={3}>Tiếng Anh</option>
          <option value={4}>Lý</option>
          <option value={5}>Hóa</option>
          <option value={6}>Sinh</option>
        </select>

        <select
          name="semester"
          value={formData.semester}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={1}>Học kỳ 1</option>
          <option value={2}>Học kỳ 2</option>
        </select>

        <input
          type="number"
          name="year"
          placeholder="Năm học"
          value={formData.year}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div>
          <label className="block text-sm font-semibold mb-1">Điểm Quá trình (0-10)</label>
          <input
            type="number"
            name="continuous_grade"
            min="0"
            max="10"
            step="0.5"
            value={formData.continuous_grade}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Điểm Giữa kỳ (0-10)</label>
          <input
            type="number"
            name="midterm_grade"
            min="0"
            max="10"
            step="0.5"
            value={formData.midterm_grade}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Điểm Cuối kỳ (0-10)</label>
          <input
            type="number"
            name="final_grade"
            min="0"
            max="10"
            step="0.5"
            value={formData.final_grade}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="bg-blue-50 p-3 rounded text-sm text-blue-700">
          <strong>Điểm bộ môn:</strong> ({formData.continuous_grade} × 0.2) + ({formData.midterm_grade} × 0.3) + ({formData.final_grade} × 0.5) = <strong>{(formData.continuous_grade * 0.2 + formData.midterm_grade * 0.3 + formData.final_grade * 0.5).toFixed(2)}</strong>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Đang xử lý..." : gradeId ? "Cập nhật" : "Thêm"}
        </button>
      </form>
    </Modal>
  );
}
