import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import type { IUser, ILoginCredentials } from "@gsimulados/shared";

interface AuthContextData {
  signed: boolean;
  user: IUser | null;
  signIn: (data: ILoginCredentials) => Promise<void>;
  signOut: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storagedUser = localStorage.getItem("@gSimulados:user");
    const storagedToken = localStorage.getItem("@gSimulados:token");

    if (storagedToken && storagedUser) {
      api.defaults.headers.common["Authorization"] = `Bearer ${storagedToken}`;
      setUser(JSON.parse(storagedUser));
    }
    setLoading(false);
  }, []);

  async function signIn(data: ILoginCredentials) {
    const response = await api.post("/auth/login", data);
    const { token, user } = response.data;

    localStorage.setItem("@gSimulados:token", token);
    localStorage.setItem("@gSimulados:user", JSON.stringify(user));

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(user);
  }

  function signOut() {
    localStorage.removeItem("@gSimulados:token");
    localStorage.removeItem("@gSimulados:user");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ signed: !!user, user, signIn, signOut, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
