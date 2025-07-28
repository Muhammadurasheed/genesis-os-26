import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Menu, 
  X, 
  Home, 
  Sparkles, 
  Users, 
  Bot, 
  BarChart3, 
  Settings,
  LogOut,
  UserCircle,
  Plus
} from 'lucide-react';
import { Button } from '../ui/button';
import { useAuthStore } from '../../stores/authStore';
import { MagicalBackground } from '../ui/MagicalBackground';

type AppPage = 'dashboard' | 'wizard' | 'guilds' | 'agents' | 'analytics' | 'settings';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  isGuest?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  currentPage, 
  onNavigate, 
  isGuest = false 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuthStore();

  const navigation = [
    { key: 'dashboard', label: 'Dashboard', icon: Home, description: 'Overview & metrics' },
    { key: 'wizard', label: 'Create Digital Worker', icon: Sparkles, description: '8-step setup process' },
    { key: 'guilds', label: 'Business Guilds', icon: Users, description: 'Team collaboration' },
    { key: 'agents', label: 'AI Agents', icon: Bot, description: 'Manage workers' },
    { key: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Performance insights' },
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : -320,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed inset-y-0 left-0 z-40 w-80 bg-black/20 backdrop-blur-xl border-r border-white/10 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">GenesisOS</h1>
                <p className="text-white/60 text-sm">Digital Workforce Platform</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <UserCircle className="w-8 h-8 text-white/70" />
              <div>
                <p className="text-white font-medium">
                  {isGuest ? 'Guest User' : user?.name || 'User'}
                </p>
                <p className="text-white/60 text-sm">
                  {isGuest ? 'Guest Mode' : user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.key;
                
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      onNavigate(item.key as AppPage);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs opacity-75">{item.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Quick Action */}
          <div className="p-6 border-t border-white/10">
            <Button
              onClick={() => {
                onNavigate('wizard');
                setSidebarOpen(false);
              }}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Digital Worker
            </Button>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                <Settings className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={isGuest ? () => window.location.reload() : signOut}
                className="text-white/70 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={`lg:ml-80 min-h-screen transition-all duration-300 ${sidebarOpen ? 'ml-0' : ''}`}>
        <MagicalBackground variant="quantum" intensity="subtle">
          <div className="min-h-screen">
            {children}
          </div>
        </MagicalBackground>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        />
      )}
    </div>
  );
};