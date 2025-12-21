import React from "react";
import { useTheme } from "../context/ThemeContext";
import { Logo } from "../components/assets/Logo";

const DashboardPage = () => {
  const { theme } = useTheme();

  return <div className={`dashboard-page ${theme}`}><Logo /></div>;
};

export default DashboardPage;
