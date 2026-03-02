'use client';

import type { User } from '@/lib/model/user';
import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// @todo: Remove if no longer needed!

export const UserProvider = ({
  children,
  initialUser = null,
}: {
  children: ReactNode;
  initialUser?: User | null;
}) => {
  const [user, setUser] = useState<User | null>(initialUser);

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};
