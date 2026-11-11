import React, { useState } from "react";
import api from "../services/api";
import type { IUser, ILoginCredentials } from "@gsimulados/shared";
import { AuthContext } from "./AuthContextDefinition";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<IUser | null>(() => {
    const storagedUser = localStorage.getItem("@gSimulados:user");
    const storagedToken = localStorage.getItem("@gSimulados:token");

    if (storagedToken && storagedUser) {
      api.defaults.headers.common["Authorization"] = `Bearer ${storagedToken}`;
      return JSON.parse(storagedUser);
    }
    return null;
  });

  const [loading] = useState(false);

  async function signIn(data: ILoginCredentials) {
    const response = await api.post("/auth/login", data);
    const { token, refreshToken, user } = response.data;

    localStorage.setItem("@gSimulados:token", token);
    localStorage.setItem("@gSimulados:user", JSON.stringify(user));
    if (refreshToken) {
      localStorage.setItem("@gSimulados:refreshToken", refreshToken);
    }

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(user);
  }

  function signOut() {
    const refreshToken = localStorage.getItem("@gSimulados:refreshToken");
    if (refreshToken) {
      // revoga no servidor sem prender a saída do usuário
      api.post("/auth/logout", { refreshToken }).catch(() => undefined);
    }
    localStorage.removeItem("@gSimulados:token");
    localStorage.removeItem("@gSimulados:refreshToken");
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
