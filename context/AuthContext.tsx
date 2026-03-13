
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, simpleHash } from './UserContext'; // Import simulated hash util

// Simplified User Interface for Session State
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: User['role'][]) => boolean;
  updateProfile: (data: Partial<User>) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check Session on Mount
  useEffect(() => {
    const session = localStorage.getItem('datvaloir_session');
    if (session) {
      setUser(JSON.parse(session));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      // Simulate Network Delay
      setTimeout(() => {
        const sanitizedEmail = email.toLowerCase().trim();
        
        // --- READ FROM UNIFIED DATABASE ---
        const usersDbStr = localStorage.getItem('datvaloir_users_db');
        const usersDb: UserProfile[] = usersDbStr ? JSON.parse(usersDbStr) : [];
        
        // 1. Find User
        const foundUser = usersDb.find(u => u.email.toLowerCase() === sanitizedEmail);

        if (!foundUser) {
            return reject(new Error("Account not found. Please register."));
        }

        // 2. Verify Password (Hash Comparison)
        const inputHash = simpleHash(password);
        if (foundUser.passwordHash !== inputHash) {
            return reject(new Error("Incorrect password."));
        }

        // 3. Verify Status
        if (foundUser.status === 'INACTIVE') {
            return reject(new Error("Account is locked. Contact support."));
        }

        // 4. Create Session
        const sessionUser: User = {
            id: foundUser.id,
            name: foundUser.name,
            email: foundUser.email,
            role: foundUser.role
        };
        
        setUser(sessionUser);
        localStorage.setItem('datvaloir_session', JSON.stringify(sessionUser));
        resolve(sessionUser);

      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('datvaloir_session');
  };

  const hasRole = (roles: User['role'][]) => {
      return user ? roles.includes(user.role) : false;
  };

  const updateProfile = async (data: Partial<User>): Promise<User> => {
      return new Promise((resolve) => {
          setTimeout(() => {
              if (!user) throw new Error("No user logged in");
              
              const updatedUser = { ...user, ...data };
              setUser(updatedUser);
              localStorage.setItem('datvaloir_session', JSON.stringify(updatedUser));
              
              // Sync with Main DB
              const usersDbStr = localStorage.getItem('datvaloir_users_db');
              if (usersDbStr) {
                  const usersDb = JSON.parse(usersDbStr);
                  const newDb = usersDb.map((u: any) => u.id === user.id ? { ...u, ...data } : u);
                  localStorage.setItem('datvaloir_users_db', JSON.stringify(newDb));
              }

              resolve(updatedUser);
          }, 1000);
      });
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user, hasRole, updateProfile }}>
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
