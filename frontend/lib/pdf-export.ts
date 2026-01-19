import jsPDF from "jspdf";
import "jspdf-autotable";

export const generateStudentReport = (students: any[], className: string) => {
  const doc = new jsPDF();
  
  doc.text(`Danh sách học sinh - ${className}`, 14, 10);
  doc.setFontSize(10);

  const tableData = students.map((student) => [
    student.student_code,
    student.student_name,
    student.email || "-",
    student.phone || "-",
    student.status,
  ]);

  (doc as any).autoTable({
    head: [["Mã HS", "Tên HS", "Email", "Điện thoại", "Trạng thái"]],
    body: tableData,
    startY: 20,
  });

  doc.save(`danh-sach-${className}.pdf`);
};

export const generateGradeReport = (grades: any[], studentName: string) => {
  const doc = new jsPDF();

  doc.text(`Bảng điểm - ${studentName}`, 14, 10);
  doc.setFontSize(10);

  const tableData = grades.map((grade) => [
    grade.subject_name,
    grade.continuous_grade?.toFixed(2) || "-",
    grade.midterm_grade?.toFixed(2) || "-",
    grade.final_grade?.toFixed(2) || "-",
    grade.final_point?.toFixed(2) || "-",
    grade.status,
  ]);

  (doc as any).autoTable({
    head: [["Môn học", "QT", "GK", "CK", "Bộ môn", "Kết quả"]],
    body: tableData,
    startY: 20,
  });

  doc.save(`bang-diem-${studentName}.pdf`);
};
