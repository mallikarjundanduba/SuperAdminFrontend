import React, { useState, useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { Home, Users, UserPlus, GraduationCap, Briefcase, Settings, CreditCard, FileText } from "lucide-react";
import Layout from "./Layout";

const Dashboard = ({ adminInfo, onLogout }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    {
      icon: Home,
      label: "Dashboard",
      id: "dashboard",
    },
    {
      icon: Users,
      label: "Admins",
      id: "admins",
    },
    {
      icon: UserPlus,
      label: "Candidates",
      id: "candidates",
    },
    {
      icon: GraduationCap,
      label: "Colleges",
      id: "colleges",
    },
    {
      icon: Briefcase,
      label: "Jobs",
      id: "jobs",
    },
    {
      icon: CreditCard,
      label: "Credits",
      id: "credits", // Will need CreditsPage
    },
    {
      icon: FileText,
      label: "Payments",
      id: "payments", // Will need ManualPaymentsPage
    },
    {
      icon: Settings,
      label: "Settings",
      id: "settings",
    },
  ];

  return (
    <Layout
      email={adminInfo?.email}
      role={adminInfo?.role}
      onLogout={onLogout}
      menuItems={menuItems}
    >
      <Outlet context={{ adminInfo }} />
    </Layout>
  );
};

export default Dashboard;

