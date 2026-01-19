"use client";

import { useRef } from "react";
import { FiUpload } from "react-icons/fi";
import * as XLSX from "xlsx";

interface ExcelImportProps {
  onImport: (data: any[]) => void;
  accept?: string;
}

export default function ExcelImport({ onImport, accept = ".xlsx,.xls" }: ExcelImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        onImport(jsonData);
        
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        console.error("Error reading Excel file:", error);
        alert("Lỗi đọc file Excel");
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
      >
        <FiUpload /> Import Excel
      </button>
    </div>
  );
}
