import React, { useState, useRef, useEffect } from "react";
import { LogOut, Bell, Menu, X, ChevronDown, User, Users, Shield } from "lucide-react";

const Topbar = ({ email, role, onMenuClick, onLogout, isMobile, menuItems = [], onViewChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const menuRef = useRef(null);
  const profileRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isMenuOpen || isProfileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen, isProfileDropdownOpen]);

  const handleMenuItemClick = (itemId) => {
    console.log("Menu item clicked:", itemId);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <header className="bg-navy-900 shadow-lg border-b-2 border-gold-500/30 sticky top-0 z-40">
        <div className="flex items-center justify-between px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
          {/* Left side - Menu Button (Mobile) */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
            {/* Menu Dropdown Button - Mobile Only */}
            {menuItems.length > 0 && (
              <div className="relative md:hidden" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-1.5 sm:p-2 hover:bg-navy-700 rounded-lg transition-colors flex-shrink-0 flex items-center gap-1"
                  aria-label="Toggle menu"
                  aria-expanded={isMenuOpen}
                >
                  {isMenuOpen ? (
                    <X size={20} className="text-gold-500" />
                  ) : (
                    <Menu size={20} className="text-gold-500" />
                  )}
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-navy-800 border-2 border-gold-500/30 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="py-2">
                      {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleMenuItemClick(item.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-navy-700 hover:text-gold-400 transition-colors border-l-4 border-transparent hover:border-gold-500"
                          >
                            <Icon size={20} className="flex-shrink-0" />
                            <span className="font-medium">{item.label}</span>
                          </button>
                        );
                      })}
                      {/* Divider */}
                      <div className="border-t border-gold-500/20 my-2"></div>
                      {/* Logout in menu for mobile */}
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-red-600/20 hover:text-red-400 transition-colors border-l-4 border-transparent hover:border-red-500"
                      >
                        <LogOut size={20} className="flex-shrink-0" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0">
            {/* Notifications */}
            <button 
              className="p-1.5 sm:p-2 hover:bg-navy-700 rounded-lg transition-colors relative flex-shrink-0"
              aria-label="Notifications"
            >
              <Bell size={18} className="sm:w-5 sm:h-5 text-gold-500" />
              <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gold-500 rounded-full"></span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative pl-2 sm:pl-3 md:pl-4 border-l border-gold-500/30" ref={profileRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
              >
                {/* Avatar */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center text-navy-900 font-bold cursor-pointer hover:shadow-lg transition-shadow border-2 border-gold-400 flex-shrink-0 text-xs sm:text-sm md:text-base">
                  {email?.[0]?.toUpperCase() || "S"}
                </div>
                {/* Dropdown Icon */}
                <ChevronDown 
                  size={16} 
                  className={`text-gold-500 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-navy-800 border-2 border-gold-500/30 rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="py-2">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gold-500/20">
                      <p className="text-sm font-medium text-white truncate">
                        {email}
                      </p>
                      <p className="text-xs text-gold-400 mt-1">{role}</p>
                    </div>
                    {/* Users Option */}
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        if (onViewChange) onViewChange("users");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-navy-700 hover:text-gold-400 transition-colors border-l-4 border-transparent hover:border-gold-500"
                    >
                      <Users size={20} className="flex-shrink-0" />
                      <span className="font-medium">Users</span>
                    </button>
                    {/* Roles Option */}
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        if (onViewChange) onViewChange("roles");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-navy-700 hover:text-gold-400 transition-colors border-l-4 border-transparent hover:border-gold-500"
                    >
                      <Shield size={20} className="flex-shrink-0" />
                      <span className="font-medium">Roles</span>
                    </button>
                    {/* Divider */}
                    <div className="border-t border-gold-500/20 my-2"></div>
                    {/* Logout */}
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-red-600/20 hover:text-red-400 transition-colors border-l-4 border-transparent hover:border-red-500"
                    >
                      <LogOut size={20} className="flex-shrink-0" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Topbar;

