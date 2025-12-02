import React, { useState, useEffect, useRef } from "react";
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
  MapPin,
  Wrench,
  Bell,
  Settings,
  ChevronDown,
  UserCircle2,
  Mail,
  Circle,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  UserCheck,
  AlarmClock,
  BellPlus,
} from "lucide-react";

const RailTooltip: React.FC<{ label: string }> = ({ label }) => (
  <div
    className="
      absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50
      whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white shadow-xl
      opacity-0 pointer-events-none group-hover:opacity-100
      transition-all duration-200 ease-out
      before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2
      before:border-4 before:border-transparent before:border-r-gray-900
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
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoutConfirm = () => {
    logout();
    navigate("/login");
  };

  const navigation = [
   { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["owner", "admin"], color: "blue" },
    { name: "Lorries", href: "/lorries", icon: Truck, roles: ["owner", "admin"], color: "green" },
    { name: "Customers", href: "/customers", icon: Building2, roles: ["owner", "admin"], color: "purple" },
    { name: "Drivers", href: "/drivers", icon: UserCircle2, roles: ["owner", "admin"], color: "orange" },
    { name: "Collab", href: "/settlement", icon: UserCheck, roles: ["owner"], color: "teal" },
    { name: "Crushers", href: "/crushers", icon: Package, roles: ["owner", "admin"], color: "red" },
    // { name: "Trips", href: "/trips", icon: MapPin, roles: ["owner", "admin"], color: "indigo" },
    // { name: "Maintenance", href: "/maintenance", icon: Wrench, roles: ["owner", "admin"], color: "yellow" },
    // { name: "Reports", href: "/reports", icon: TrendingUp, roles: ["owner", "admin"], color: "pink" },
    { name: "Settings", href: "/settings", icon: Settings, roles: ["owner", "admin"], color: "gray" },
      { name: "Reminder", href: "/reminders", icon: BellPlus, roles: ["owner"] },
    { name: "Owners", href: "/owners", icon: Users, roles: ["admin"], color: "cyan" },
    

  ];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role || "admin")
  );

  const mockNotifications = [
    {
      id: 1,
      icon: Wrench,
      color: "red",
      title: "Maintenance Alert",
      description: "KA01AB1234 requires routine service",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 2,
      icon: Building2,
      color: "blue",
      title: "New Customer Added",
      description: "ABC Constructions registered",
      time: "5 hours ago",
      unread: true,
    },
    {
      id: 3,
      icon: CheckCircle2,
      color: "green",
      title: "Trip Completed",
      description: "Trip #TRP001 completed successfully",
      time: "1 day ago",
      unread: false,
    },
  ];

  const unreadCount = mockNotifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-gradient-to-b from-blue-600 to-blue-700 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-blue-500/50 bg-blue-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">FLEET360</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-white text-blue-700 shadow-lg scale-[1.02]"
                      : "text-white hover:bg-white/10 hover:translate-x-1"
                  }`}
              >
                <div className={`${isActive ? 'bg-blue-100' : 'bg-white/10'} p-2 rounded-lg`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile User Section */}
        <div className="p-4 border-t border-blue-500/50 bg-blue-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center border-2 border-white shadow-lg">
              <UserCircle2 className="h-6 w-6 text-white" />
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

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:z-40">
        <div className="flex h-full w-20 flex-col items-center bg-gradient-to-b from-blue-600 to-blue-700 shadow-2xl">
          {/* Logo */}
          <div className="flex h-16 w-16 items-center justify-center mt-4 mb-6">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200">
              <Truck className="h-7 w-7 text-blue-600" />
            </div>
          </div>

          {/* Desktop Navigation Icons */}
          <nav className="flex-1 py-2 flex flex-col items-center gap-2 w-full px-3">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  aria-label={item.name}
                  className={`group relative flex h-12 w-12 items-center justify-center rounded-xl
                    transition-all duration-200 hover:scale-110
                    ${
                      isActive
                        ? "bg-white text-blue-700 shadow-xl scale-110"
                        : "text-white hover:bg-white/10"
                    }`}
                >
                  <Icon className="h-5 w-5 relative z-10" />
                  <RailTooltip label={item.name} />
                  {isActive && (
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop User Avatar */}
          <div className="mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center border-2 border-white cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg">
              <UserCircle2 className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-20">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            {/* Left Section */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </button>

              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md lg:hidden">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                    FLEET360
                  </h1>
                </div>
              </div>
            </div>

            {/* Right Section - Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowUserMenu(false);
                  }}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[10px] font-bold items-center justify-center">
                        {unreadCount}
                      </span>
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-14 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl animate-fade-in overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 text-base">Notifications</h3>
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-medium">
                          {unreadCount} New
                        </span>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {mockNotifications.map((notification) => {
                        const NotifIcon = notification.icon;
                        return (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                              notification.unread ? 'bg-blue-50/30' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 bg-${notification.color}-100 rounded-xl flex items-center justify-center flex-shrink-0`}>
                                <NotifIcon className={`h-5 w-5 text-${notification.color}-600`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-semibold text-gray-900">
                                    {notification.title}
                                  </p>
                                  {notification.unread && (
                                    <Circle className="h-2 w-2 text-blue-600 fill-blue-600 flex-shrink-0 mt-1" />
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 mt-1">{notification.description}</p>
                                <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="p-3 border-t border-gray-200 bg-gray-50">
                      <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-semibold py-2 hover:bg-blue-50 rounded-lg transition-colors">
                        View All Notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-all duration-200 min-w-0"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center border-2 border-blue-200 shadow-md flex-shrink-0">
                    <UserCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="hidden md:block text-left min-w-0 max-w-32">
                    <p className="text-sm font-bold text-gray-900 capitalize truncate">
                      {user?.name || "Admin User"}
                    </p>
                    <p className="text-xs text-gray-500 capitalize truncate">
                      {user?.role || "admin"}
                    </p>
                  </div>
                  <ChevronDown className={`hidden md:block h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 top-14 w-64 bg-white border border-gray-200 rounded-2xl shadow-2xl animate-fade-in overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                          <UserCircle2 className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate capitalize">
                            {user?.name || "Admin User"}
                          </p>
                          <p className="text-xs text-gray-600 truncate">{user?.email || "admin@fleet360.com"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <button className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <UserCircle2 className="h-5 w-5 text-gray-500" />
                        <span className="font-medium">My Profile</span>
                      </button>
                      <button className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Settings className="h-5 w-5 text-gray-500" />
                        <span className="font-medium">Settings</span>
                      </button>
                      <button className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Mail className="h-5 w-5 text-gray-500" />
                        <span className="font-medium">Messages</span>
                      </button>
                    </div>
                    <div className="border-t border-gray-200 py-2">
                      <button
                        onClick={() => {
                          setShowLogoutModal(true);
                          setShowUserMenu(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Page Content */}
        <main className="p-3 sm:p-4 lg:p-6 xl:p-8">
          <div className="bg-white rounded-2xl border border-gray-200 min-h-[calc(100vh-120px)] shadow-lg">
            {children}
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md transform animate-scale-in">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertCircle className="h-7 w-7 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Confirm Logout</h3>
                <p className="text-sm text-gray-500 mt-0.5">End your session</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to log out? You'll need to sign in again to access your account.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 px-4 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all font-medium"
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