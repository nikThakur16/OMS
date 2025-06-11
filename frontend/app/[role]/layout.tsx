// app/admin/layout.tsx (or wherever your layout lives)
import type { Metadata } from "next";
import Navbar from "@/components/layouts/Navbar";
import Sidenav from "@/components/layouts/Sidebar";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin Dashboard",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-6  bg-[#D3E7F0] px-6 py-10">

      {/* Sidebar */}
      <Sidenav />

      {/* Main area */}
      <div className="flex px-2 flex-col flex-1 ">
        {/* Top navbar */}
        <Navbar />

        {/* Main content scroll area */}
        <main className="flex-1 max-h-[85vh] overflow-auto p-4 scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  );
}
