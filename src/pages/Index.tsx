
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white py-4 shadow-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
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
            <h1 className="text-xl font-bold">Attendance Tracker</h1>
          </div>
          
          <div className="flex space-x-4">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button onClick={() => navigate('/register')}>
              Register
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
              Efficient Attendance Management
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Track employee attendance, manage time-off requests, and generate attendance reports with ease.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Attendance Tracking</h3>
              <p className="text-slate-600">
                Capture real-time attendance with geolocation tracking and enforce check-in time policies.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Absence Management</h3>
              <p className="text-slate-600">
                Submit and track absence requests with reasons, ensuring transparency and accountability.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Comprehensive Reports</h3>
              <p className="text-slate-600">
                Generate detailed attendance reports with filtering options for data-driven decision making.
              </p>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => navigate('/register')}
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </main>
      
      <footer className="bg-white py-6 border-t border-slate-200">
        <div className="container mx-auto px-4 text-center text-slate-600">
          <p>&copy; {new Date().getFullYear()} Attendance Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
