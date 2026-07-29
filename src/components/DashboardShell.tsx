"use client";

import { DashboardNavbar } from "@/components/DashboardNavbar";
import { Sidebar } from "@/components/Sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <DashboardNavbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main
          className={`flex-1 overflow-y-auto p-4 transition-all duration-300 lg:p-8 ${
            open ? "lg:ml-64" : ""
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <DashboardContent>{children}</DashboardContent>
      </SidebarProvider>
    </AuthProvider>
  );
}
