
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 
              className="text-xl font-bold cursor-pointer"
              onClick={() => navigate(user?.role === 'admin' ? '/admin/dashboard' : '/dashboard')}
            >
              Attendance Tracker
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="text-sm text-gray-600 hidden md:block">
                  {user.firstName} {user.lastName}
                  {user.role === 'admin' && (
                    <span className="ml-2 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                      Admin
                    </span>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Attendance Tracker. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
