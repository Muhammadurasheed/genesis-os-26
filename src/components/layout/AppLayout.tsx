import React from 'react';
import { SidebarProvider, SidebarTrigger } from '../ui/sidebar';
import { AppSidebar } from './AppSidebar';

type AppPage = 'dashboard' | 'guilds' | 'agents' | 'marketplace' | 'wizard' | 'analytics';

interface AppLayoutProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  isGuest?: boolean;
  children: React.ReactNode;
}

export function AppLayout({ currentPage, onNavigate, isGuest = false, children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar 
          currentPage={currentPage} 
          onNavigate={onNavigate} 
          isGuest={isGuest} 
        />
        
        <main className="flex-1 flex flex-col">
          {/* Top header with sidebar trigger for all screen sizes */}
          <header className="h-12 flex items-center border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger className="ml-2" />
          </header>
          
          {/* Main content */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}