import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard,
  Truck,
  Users,
  Building2,
  Package,
  BarChart3,
  LogOut,
  Menu,
  X,
  ClipboardList,
  MapPin,
  Wrench,
  Bell,
  Settings,
  ChevronDown,
} from "lucide-react";
import { IoPersonSharp } from "react-icons/io5";

const RailTooltip: React.FC<{ label: string }> = ({ label }) => (
  <div
    className="
      absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50
      whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg
      opacity-0 pointer-events-none group-hover:opacity-100
      transition-opacity duration-150
    "
    role="tooltip"
  >
    {label}
  </div>
);

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogoutConfirm = () => {
    logout();
    navigate("/login");
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["owner", "admin"] },
    { name: "Lorries", href: "/lorries", icon: Truck, roles: ["owner", "admin"] },
    { name: "Customers", href: "/customers", icon: Users, roles: ["owner", "admin"] },
    { name: "Drivers", href: "/drivers", icon: Users, roles: ["owner", "admin"] },
    { name: "Collab", href: "/settlement", icon: Users, roles: ["owner"] },
    { name: "Crushers", href: "/crushers", icon: Package, roles: ["owner", "admin"] },
    { name: "Trips", href: "/trips", icon: MapPin, roles: ["owner", "admin"] },
    { name: "Maintenance", href: "/maintenance", icon: Wrench, roles: ["owner", "admin"] },
    { name: "Reports", href: "/reports", icon: BarChart3, roles: ["owner", "admin"] },
    { name: "Settings", href: "/settings", icon: Settings, roles: ["owner", "admin"] },
    { name: "Owners", href: "/owners", icon: Users, roles: ["admin"] },

  ];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role || "admin")
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div
          className="fixed inset-0 bg-gray-900/50"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-blue-700 shadow-2xl text-white">
          <div className="flex h-16 items-center justify-between px-4 border-b border-blue-500">
            <div className="flex items-center space-x-2">
              <Truck className="h-8 w-8 text-white" />
              <span className="text-xl font-bold">FLEET360</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition
                    ${
                      isActive
                        ? "bg-white text-blue-700 shadow-md"
                        : "hover:bg-blue-600"
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          {/* User info in mobile sidebar */}
          <div className="p-4 border-t border-blue-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
                <IoPersonSharp className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate capitalize">
                  {user?.name || "Admin User"}
                </p>
                <p className="text-xs text-blue-200 truncate capitalize">
                  {user?.role || "admin"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:z-40">
        <div className="flex h-full w-16 flex-col items-center bg-blue-700 text-white shadow-xl">
          {/* Logo */}
          <div className="flex h-10 w-10 items-center justify-center mt-3 mb-3 rounded-lg bg-blue-600 shadow-md">
            <Truck className="h-6 w-6 text-white" />
          </div>
          
          {/* Nav icons */}
          <nav className="flex-1 py-2 flex flex-col items-center gap-1 w-full">
            {filteredNavigation.map((item, idx) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <React.Fragment key={item.name}>
                  <Link
                    to={item.href}
                    aria-label={item.name}
                    className={`group relative flex h-10 w-10 mx-auto items-center justify-center rounded-lg
                      transition-all duration-200 hover:bg-blue-600 hover:scale-105
                      ${isActive ? "bg-white text-blue-700 shadow-md scale-105" : ""}`}
                  >
                    <Icon
                      className={`h-5 w-5 transition-colors duration-200 relative z-10
                        ${isActive ? "text-blue-700" : "text-white group-hover:text-gray-100"}`}
                    />
                    <RailTooltip label={item.name}/>
                  </Link>
                  {idx < filteredNavigation.length - 1 && (
                    <div className="h-px w-6 bg-white/20 mx-auto" />
                  )}
                </React.Fragment>
              );
            })}
          </nav>

          {/* User avatar in desktop sidebar */}
          <div className="mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white cursor-pointer hover:bg-blue-500 transition-colors">
              <IoPersonSharp className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-16">
        {/* Top bar - Improved Responsive Design */}
        <div className="sticky top-0 z-30 bg-white border-b-4 border-blue-700 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            {/* Left: Menu + Branding */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-2 min-w-0">
                <Truck className="h-6 w-6 text-blue-700 flex-shrink-0" />
                <span className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  FLEET360
                </span>
                <span className="hidden xs:inline-flex text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full capitalize flex-shrink-0">
                  {user?.role || "admin"}
                </span>
              </div>
            </div>

            {/* Right: Actions - Responsive Stack */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
              {/* Notifications - Icon only on mobile */}
              <div className="relative">
                <button
                  className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setShowNotifications((prev) => !prev)}
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fade-in">
                    <div className="p-4 border-b border-gray-200">
                      <p className="font-semibold text-gray-800">Notifications</p>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Truck className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">Lorry Maintenance Due</p>
                            <p className="text-xs text-gray-500 mt-1 truncate">KA01AB1234 requires routine service</p>
                            <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Package className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">New Customer Added</p>
                            <p className="text-xs text-gray-500 mt-1 truncate">ABC Constructions registered</p>
                            <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-4 w-4 text-yellow-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">Trip Completed</p>
                            <p className="text-xs text-gray-500 mt-1 truncate">Trip #TRP001 has been completed</p>
                            <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border-t border-gray-200">
                      <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                        View All Notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile - Compact on mobile */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-0"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-200 flex-shrink-0">
                    <IoPersonSharp className="h-4 w-4 text-blue-700" />
                  </div>
                  <div className="hidden sm:block text-left min-w-0 max-w-32">
                    <p className="text-sm font-bold text-gray-900 capitalize truncate">
                      {user?.name || "Admin User"}
                    </p>
                    <p className="text-xs text-gray-500 capitalize truncate">
                      {user?.role || "admin"}
                    </p>
                  </div>
                  <ChevronDown className="hidden sm:block h-4 w-4 text-gray-400 flex-shrink-0" />
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 top-12 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fade-in">
                    <div className="p-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Settings className="h-4 w-4" />
                        Settings
                      </button>
                      <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <IoPersonSharp className="h-4 w-4" />
                        Profile
                      </button>
                    </div>
                    <div className="border-t border-gray-200 pt-1">
                      <button
                        onClick={() => setShowLogoutModal(true)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Logout - Icon only on mobile */}
              <button
                onClick={() => setShowLogoutModal(true)}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors sm:hidden"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-2 sm:p-4 lg:p-6">
          <div className="bg-white rounded-xl border border-gray-200 min-h-[calc(100vh-80px)] shadow-sm">
            {children}
          </div>
        </main>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Confirm Logout</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to log out of your Fleet Management account?
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;