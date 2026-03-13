
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// --- SECURITY UTILS (Simulation) ---
export const simpleHash = (str: string) => {
    return btoa(str + "_salt_datvaloir").split('').reverse().join('');
};

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  status: 'ACTIVE' | 'INACTIVE';
  joinedAt: string;
  passwordHash: string; 
  spent?: number; 
}

interface UserContextType {
  users: UserProfile[];
  addUser: (user: Omit<UserProfile, 'id' | 'joinedAt' | 'status' | 'passwordHash'> & { password?: string }) => void;
  updateUser: (id: string, data: Partial<UserProfile>) => void;
  deleteUser: (id: string) => void;
  seedDatabase: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // --- 1. INITIALIZATION & SEEDING ---
  useEffect(() => {
    const storedUsers = localStorage.getItem('datvaloir_users_db');
    if (storedUsers) {
      try {
          const parsed = JSON.parse(storedUsers);
          // FIX: Check if it IS an array, regardless of length. 
          // An empty array [] is a valid state (means all users deleted).
          if (Array.isArray(parsed)) {
             setUsers(parsed);
          } else {
             seedDatabase(); 
          }
      } catch (e) {
          console.error("User DB corrupted, reseeding...");
          seedDatabase(); 
      }
    } else {
      seedDatabase();
    }
    setIsInitialized(true); 
  }, []);

  // --- 2. PERSISTENCE (ROBUST SYNC) ---
  useEffect(() => {
    // Only save to storage IF we have finished initializing. 
    if (isInitialized) {
      localStorage.setItem('datvaloir_users_db', JSON.stringify(users));
    }
  }, [users, isInitialized]);

  const seedDatabase = () => {
      const initialUsers: UserProfile[] = [
        { 
            id: 'u-admin', 
            name: 'Director Valoir', 
            email: 'admin@gmail.com', 
            phone: '+84 900 000 001', 
            role: 'ADMIN', 
            status: 'ACTIVE', 
            joinedAt: '2020-01-01',
            passwordHash: simpleHash('12345') 
        },
        { 
            id: 'u-staff', 
            name: 'Sarah Concierge', 
            email: 'staff@gmail.com', 
            phone: '+84 900 000 002', 
            role: 'STAFF', 
            status: 'ACTIVE', 
            joinedAt: '2023-05-15',
            passwordHash: simpleHash('12345')
        },
        { 
            id: 'u-cust1', 
            name: 'Mr. John Doe', 
            email: 'customer@gmail.com', 
            phone: '+1 555 0199', 
            role: 'CUSTOMER', 
            status: 'ACTIVE', 
            joinedAt: '2023-10-10', 
            spent: 5200,
            passwordHash: simpleHash('12345')
        }
      ];
      setUsers(initialUsers);
  };

  // --- 3. CRUD OPERATIONS ---

  const addUser = useCallback((userData: Omit<UserProfile, 'id' | 'joinedAt' | 'status' | 'passwordHash'> & { password?: string }) => {
    setUsers(prev => {
        if (prev.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
             // Just console warn, don't throw to break UI flow unexpectedly
             console.warn("Email already registered");
             return prev; 
        }
        const newUser: UserProfile = {
          id: 'u-' + Math.random().toString(36).substr(2, 9),
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          role: userData.role,
          status: 'ACTIVE',
          joinedAt: new Date().toISOString().split('T')[0],
          passwordHash: simpleHash(userData.password || '12345'),
          spent: 0
        };
        return [newUser, ...prev];
    });
  }, []);

  const updateUser = useCallback((id: string, data: Partial<UserProfile>) => {
    setUsers(prev => prev.map(user => user.id === id ? { ...user, ...data } : user));
  }, []);

  const deleteUser = useCallback((id: string) => {
    console.log("Attempting to delete user:", id); // Debug log
    if (id === 'u-admin') {
        console.warn("System Protection: Cannot delete the root Admin.");
        return; 
    }
    setUsers(prev => {
        const newUsers = prev.filter(user => user.id !== id);
        console.log("Users after delete:", newUsers); // Debug log
        return newUsers;
    });
  }, []);

  return (
    <UserContext.Provider value={{ users, addUser, updateUser, deleteUser, seedDatabase }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserDatabase = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserDatabase must be used within a UserProvider');
  }
  return context;
};
