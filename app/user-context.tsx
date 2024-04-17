"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { redirect } from "next/navigation";
import { User } from "@/app/lib/definition";

// 定义Context中的值的类型
interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

// 创建Context
const UserContext = createContext<UserContextType | undefined>(undefined);

// 定义Provider的Props类型
interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// 创建一个自定义Hook
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserRedirect: React.FC<UserProviderProps> = ({ children }) => {
  const { user } = useUser();
  useEffect(() => {
    if (!user || !user.name) {
      redirect("/login");
    }
  }, [user]);
  return <div>{children}</div>;
};
