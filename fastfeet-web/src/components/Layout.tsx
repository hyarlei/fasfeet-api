import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Package,
  Users,
  Truck,
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

interface MenuItem {
  icon: typeof Package;
  label: string;
  path: string;
  emoji: string;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const allMenuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', emoji: '📊' },
    { icon: Package, label: 'Encomendas', path: '/orders', emoji: '📦' },
    { icon: Users, label: 'Destinatários', path: '/recipients', emoji: '👥' },
    { icon: Truck, label: 'Entregadores', path: '/deliverymen', emoji: '🚚' },
  ];

  const deliverymanMenuItems: MenuItem[] = [
    { icon: Package, label: 'Minhas Entregas', path: '/my-orders', emoji: '📦' },
  ];

  const menuItems = user?.role === 'ADMIN' ? allMenuItems : deliverymanMenuItems;

  function handleLogout() {
    signOut();
    navigate('/');
  }

  function isActivePath(path: string) {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside
        className={`${isSidebarOpen ? 'w-64' : 'w-20'
          } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col fixed h-screen z-20`}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Truck className="text-purple-600" size={24} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">FastFeet</h1>
                <p className="text-xs text-gray-500">Dashboard</p>
              </div>
            </div>
          ) : (
            <div className="bg-purple-100 p-2 rounded-lg mx-auto">
              <Truck className="text-purple-600" size={24} />
            </div>
          )}
        </div>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:bg-gray-50 transition-colors"
        >
          {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                    ? 'bg-purple-50 text-purple-600 font-semibold shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                {isSidebarOpen && (
                  <span className="text-sm">{item.label}</span>
                )}
                {isSidebarOpen && (
                  <span className="ml-auto">{item.emoji}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          {isSidebarOpen ? (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-purple-100 p-2 rounded-full">
                  <User size={16} className="text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {user?.name || 'Administrador'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.role === 'ADMIN' ? 'Administrador' : 'Entregador'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-3 p-2 bg-gray-50 rounded-lg flex justify-center">
              <div className="bg-purple-100 p-2 rounded-full">
                <User size={16} className="text-purple-600" />
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors ${!isSidebarOpen && 'justify-center'
              }`}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {isSidebarOpen && <span className="text-sm font-medium">Sair</span>}
          </button>
        </div>
      </aside>

      <main
        className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'
          }`}
      >
        {children}
      </main>
    </div>
  );
}
