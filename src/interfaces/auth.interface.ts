export interface IUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
}

export interface AuthContextType {
  user: IUser | null;
  handleSetUser: (user: IUser) => void;
}