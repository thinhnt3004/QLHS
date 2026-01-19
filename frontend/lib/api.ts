import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Students API
export const studentAPI = {
  getAll: () => apiClient.get("/students/"),
  getById: (id: number) => apiClient.get(`/students/${id}`),
  getByClass: (classId: number) => apiClient.get(`/students/class/${classId}`),
  create: (data: any) => apiClient.post("/students/", data),
  update: (id: number, data: any) => apiClient.put(`/students/${id}`, data),
  delete: (id: number) => apiClient.delete(`/students/${id}`),
};

// Grades API
export const gradeAPI = {
  getByStudent: (studentId: number, semester?: number, year?: number) =>
    apiClient.get(`/grades/student/${studentId}`, { params: { semester, year } }),
  getClassGrades: (classId: number, subjectId: number, semester: number, year: number) =>
    apiClient.get(`/grades/class/${classId}/subject/${subjectId}`, { params: { semester, year } }),
  create: (data: any) => apiClient.post("/grades/", data),
  update: (id: number, data: any) => apiClient.put(`/grades/${id}`, data),
  getRanking: (classId: number) => apiClient.get(`/grades/ranking/class/${classId}`),
};
