import { createContext } from "react";
import type { IUser, ILoginCredentials } from "@gsimulados/shared";

export interface AuthContextData {
  signed: boolean;
  user: IUser | null;
  signIn: (data: ILoginCredentials) => Promise<void>;
  signOut: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData
);
