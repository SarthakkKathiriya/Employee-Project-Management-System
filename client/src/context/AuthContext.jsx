import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, {
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
} from '../services/api.js';
import { AuthContext } from './authContext.js';

const saveSession = (token, user) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
};

export function AuthProvider({ children }) {
  const hasStoredToken = Boolean(localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState(() => {
    if (!localStorage.getItem(TOKEN_STORAGE_KEY)) {
      return null;
    }

    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch {
      clearSession();
      return null;
    }
  });
  const [token, setToken] = useState(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY),
  );
  const [loading, setLoading] = useState(hasStoredToken);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!storedToken) {
      return undefined;
    }

    const restoreSession = async () => {
      try {
        const response = await api.get('/auth/me');
        const currentUser = response.data.data.user;

        if (active) {
          setUser(currentUser);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
        }
      } catch (error) {
        if (active && error.response?.status !== 401) {
          toast.error('Could not verify your session. Check your connection.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = response.data.data;

    saveSession(newToken, newUser);
    setToken(newToken);
    setUser(newUser);

    return newUser;
  };

  const register = async (name, email, password) => {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
    });
    const { token: newToken, user: newUser } = response.data.data;

    saveSession(newToken, newUser);
    setToken(newToken);
    setUser(newUser);

    return newUser;
  };

  const logout = () => {
    clearSession();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
