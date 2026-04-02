import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./SideBar";
import Navbar from "./Navbar";
import { useTheme } from "../hooks/useTheme";

function Layout({ children }) {
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
  const location = useLocation();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const onChange = (event) => setIsMobile(event.matches);

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobile) {
      setMobileOpen(false);
    }
  }, [isMobile]);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg-primary)",
      }}
    >
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        isMobile={isMobile}
      />

      {isMobile && mobileOpen && (
        <button aria-label="Close sidebar" className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Navbar
          theme={theme}
          toggleTheme={toggleTheme}
          onToggleSidebar={() => setMobileOpen((prev) => !prev)}
          showMenuButton={isMobile}
        />

        <main
          className="app-main"
          style={{
            flex: 1,
            padding: "24px",
            overflowY: "auto",
            animation: "fadeIn 0.2s ease",
          }}
        >
          {children}
        </main>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default Layout;

