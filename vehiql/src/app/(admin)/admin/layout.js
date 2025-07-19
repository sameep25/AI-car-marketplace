import { getAdmin } from "@/actions/admin";
import Header from "@/components/Header";
import { notFound } from "next/navigation";
import React from "react";
import Sidebar from "./_components/Sidebar";

const AdminLayout = async ({ children }) => {
  const admin = await getAdmin();
  if (!admin.authorized) {
    return notFound(); //not found page
  }

  return (
    <div className="h-full">
      {/* Overlapping header page here to avoid making it a client component */}
      <Header isAdminPage={true} />

      <div className="flex h-full w-56 flex-col top-20 fixed inset-y-0 z-50">
        <Sidebar />
      </div>
      <main className="md:pl-56 pt-[80px] h-full"> {children} </main>
    </div>
  );
};

export default AdminLayout;
