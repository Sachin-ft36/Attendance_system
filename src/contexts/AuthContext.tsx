
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LoginCredentials, RegisterData, AuthState } from '@/types/auth';
import { toast } from '@/components/ui/sonner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock authentication functions (to be replaced with actual API calls)
const mockLogin = async (credentials: LoginCredentials): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For demo purposes
  if (credentials.email === 'admin@example.com' && credentials.password === 'password') {
    return {
      id: '1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    };
  } else if (credentials.email === 'employee@example.com' && credentials.password === 'password') {
    return {
      id: '2',
      email: 'employee@example.com',
      firstName: 'Employee',
      lastName: 'User',
      role: 'employee',
      department: 'Engineering',
      position: 'Software Developer',
    };
  }
  
  throw new Error('Invalid credentials');
};

const mockRegister = async (data: RegisterData): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real app, this would make an API call to register the user
  return {
    id: '3',
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    role: 'employee',
    department: data.department,
    position: data.position,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setState({
            user: JSON.parse(storedUser),
            isLoading: false,
            error: null,
          });
        } else {
          setState({ user: null, isLoading: false, error: null });
        }
      } catch (error) {
        setState({ user: null, isLoading: false, error: 'Session expired' });
        localStorage.removeItem('user');
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setState({ ...state, isLoading: true, error: null });
    try {
      const user = await mockLogin(credentials);
      localStorage.setItem('user', JSON.stringify(user));
      setState({ user, isLoading: false, error: null });
      toast.success('Login successful');
      
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setState({ ...state, isLoading: false, error: 'Invalid credentials' });
      toast.error('Login failed: Invalid credentials');
    }
  };

  const register = async (data: RegisterData) => {
    setState({ ...state, isLoading: true, error: null });
    try {
      const user = await mockRegister(data);
      localStorage.setItem('user', JSON.stringify(user));
      setState({ user, isLoading: false, error: null });
      toast.success('Registration successful');
      navigate('/dashboard');
    } catch (error) {
      setState({ ...state, isLoading: false, error: 'Registration failed' });
      toast.error('Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setState({ user: null, isLoading: false, error: null });
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    isAuthenticated: !!state.user,
    isAdmin: state.user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
