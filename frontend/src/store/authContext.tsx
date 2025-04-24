import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  id: string;
  username: string;
  email: string;
  unreadNotifications: number;
  rooms?: string[];
  defaultRoom?: string;
  profileImage?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUserData: (currentToken?: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
  userLoaded: boolean;
  updateProfile: (form: { username: string; email: string; profileImage: string; password?: string; currentPassword?: string }) => Promise<void>;
  updateDefaultRoom: (roomId: string) => Promise<void>;
  defaultRoom: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'http://localhost:5001/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [defaultRoom, setDefaultRoom] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Load token from storage
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          await fetchUserData(storedToken);
        }
      } catch (err) {
        console.error('Failed to load auth token:', err);
      } finally {
        setIsLoading(false);
        setUserLoaded(true); // whether it worked or not
      }
    };

    loadToken();
  }, []);
  
  useEffect(() => {
    if (user) {
      setDefaultRoom(user.defaultRoom || ''); 
    }
  }, [user]);


  const fetchUserData = async (currentToken = token) => {
    if (!currentToken) {
      setUserLoaded(true);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      const data = await response.json();
      console.log('Fetch user data response:', data);

      if (data.success) {
        setUser(data.data);
      } else {
        await AsyncStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setError(data.error || 'Session expired. Please login again.');
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      await AsyncStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setUserLoaded(true);
    }
  };


  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Logging in with:', { username, password });

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (data.success) {
        await AsyncStorage.setItem('token', data.token);
        setToken(data.token);

        // ✅ immediately fetch full user data
        await fetchUserData(data.token);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
      setUserLoaded(true);
    }
  };


  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      console.log('Register response:', data);

      if (data.success) {
        await AsyncStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
      setUserLoaded(true);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUserLoaded(true);
    }
  };

  const clearError = () => {
    setError(null);
  };
  const updateDefaultRoom = async (roomID: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/default-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roomID }),
      });

      const data = await response.json();
      console.log('Register response:', data);

      if (data.success) {
        console.log('upated');
        setDefaultRoom(roomID);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (form: { username: string; email: string; profileImage: string; password?: string; currentPassword?: string }) => {
    setIsLoading(true);
    setError(null);
    setUserLoaded(false);
    try {
      if (!token) throw new Error('No token');
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.data);
      } else {
        setError(data.error || 'Update failed');
      }
      // 최신 정보 반영
      await fetchUserData(token);
    } catch (err: any) {
      setError(err.message || 'Update failed');
    } finally {
      setIsLoading(false);
      setUserLoaded(true);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        fetchUserData,
        error,
        clearError,
        userLoaded,
        updateProfile,
        updateDefaultRoom,
        defaultRoom
      }}
    >
      {children}
    </AuthContext.Provider>
  );



};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
