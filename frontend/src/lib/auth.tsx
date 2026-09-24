"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { fetchApi } from "./api";

interface User {
  id: string;
  email: string;
  full_name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = async (token: string) => {
    try {
      const userData = await fetchApi<User>("/auth/me");
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user", error);
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        await fetchUser(token);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (!isLoading && !user && pathname.startsWith("/dashboard")) {
      router.push("/login");
    } else if (!isLoading && user && pathname === "/login") {
      router.push("/dashboard");
    }
  }, [user, isLoading, pathname, router]);

  const login = async (token: string) => {
    localStorage.setItem("token", token);
    await fetchUser(token);
    router.push("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
