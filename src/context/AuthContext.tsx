import { createContext, useContext, useState } from 'react';

import { AuthContextType, IUser } from '@/interfaces/auth';

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);

  const handleSetUser = (user: IUser) => {
    setUser(user);
  }


  return (
    <AuthContext.Provider value={{ user, handleSetUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);