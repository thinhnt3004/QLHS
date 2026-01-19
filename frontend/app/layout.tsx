import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hệ thống Quản lý Trường Học",
  description: "Quản lý học sinh, điểm số và GPA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-gray-50">
        <nav className="bg-blue-600 text-white p-4 shadow">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold">📚 Quản Lý Trường Học</h1>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
