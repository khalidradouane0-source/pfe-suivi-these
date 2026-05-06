import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import React from "react";

const MainLayout = () => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        
        <Navbar />

        <div className="p-4 pt-16 sm:p-6 sm:pt-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>

      </main>
    </div>
  );
};

export default MainLayout;