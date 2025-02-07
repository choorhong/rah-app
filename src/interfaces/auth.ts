import { type UserCredential } from 'firebase/auth';

export interface IUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

export interface AuthContextType {
  user: IUser | null;
  signUp: (email: string, password: string, name: string) => Promise<UserCredential>;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
}