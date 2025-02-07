import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
  User
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../db';

import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

interface IAuthService {
  signup(email: string, password: string, name: string): Promise<UserCredential>;
  login(email: string, password: string): Promise<UserCredential>;
  logout(): Promise<void>;
}

class AuthService implements IAuthService {
  private static instance: AuthService;

  private constructor(
    private auth: Auth,
    private db: Firestore
  ) { }

  public static initialize(auth: Auth, db: Firestore): void {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService(auth, db);
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      throw new Error('AuthService must be initialized');
    }
    return AuthService.instance;
  }

  public async signup(email: string, password: string, name: string): Promise<UserCredential> {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    await this.createUserDocument(userCredential.user, name);
    return userCredential;
  }

  public async login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  public async logout(): Promise<void> {
    return signOut(this.auth);
  }

  private async createUserDocument(user: User, name: string): Promise<void> {
    await setDoc(doc(this.db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: name,
      photoURL: user.photoURL
    });
  }
}

// Initialize service
AuthService.initialize(auth, db);
export const authService = AuthService.getInstance();
