import React, { useState } from "react";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";

const Sidebar = ({ isOpen, onClose, isMinimized, onToggleMinimize, menuItems, email, role }) => {
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative h-screen bg-white border-r border-slate-200 text-slate-900 shadow-sm transform transition-all duration-300 ease-in-out z-30 flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          } md:translate-x-0 ${isMinimized ? "w-[72px] md:w-[72px]" : "w-64 md:w-64"
          } relative overflow-visible`}
      >
        <div className={`${isMinimized ? "p-2" : "p-4"} flex flex-col h-full overflow-hidden`}>
          {/* Logo */}
          <div className="mb-6 flex items-center justify-center">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-100">
              <img src="/KG-logo.png" alt="KG" className="h-6 w-6 brightness-0 invert" />
            </div>
            {!isMinimized && (
              <div className="ml-3">
                <span className="text-slate-900 font-bold text-lg tracking-tight leading-none block">KareerGrowth</span>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <nav className="space-y-1 flex-1 overflow-y-auto">
            {menuItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (item.submenu) {
                      toggleExpand(item.id);
                    } else if (item.onClick) {
                      item.onClick();
                    }
                  }}
                  className={`w-full flex items-center ${isMinimized ? "justify-center" : "justify-between"
                    } px-4 py-3 rounded-lg group transition-all text-slate-600 hover:bg-slate-50 hover:text-blue-600`}
                  title={isMinimized ? item.label : ""}
                >
                  <span className={`flex items-center ${isMinimized ? "gap-0" : "gap-3"}`}>
                    <item.icon
                      size={20}
                      className="flex-shrink-0 group-hover:text-blue-600 transition-colors"
                    />
                    {!isMinimized && (
                      <span className="font-medium text-sm">{item.label}</span>
                    )}
                  </span>
                  {!isMinimized && item.submenu && (
                    <span>
                      {expandedItems[item.id] ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </span>
                  )}
                </button>

                {/* Submenu - Only show when not minimized */}
                {!isMinimized && item.submenu && expandedItems[item.id] && (
                  <div className="pl-4 space-y-1 mt-1 border-l-2 border-slate-100 ml-4">
                    {item.submenu.map((subitem) => (
                      <button
                        key={subitem.id}
                        onClick={() => subitem.onClick && subitem.onClick()}
                        className="w-full text-left px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-500 hover:text-blue-600 text-xs font-medium"
                      >
                        {subitem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Collapse Button */}
        <button
          onClick={onToggleMinimize}
          className="hidden md:flex items-center justify-center absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-md text-slate-400 hover:text-blue-600 transition-all z-[9999]"
          title={isMinimized ? "Expand" : "Collapse"}
        >
          {isMinimized ? (
            <ChevronRight size={14} />
          ) : (
            <ChevronLeft size={14} />
          )}
        </button>
      </aside>
    </>
  );
};

export default Sidebar;

