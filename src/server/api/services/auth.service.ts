import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
  User
} from 'firebase/auth';
import { auth, db } from '../../db';

import { Auth } from 'firebase/auth';
import { UserRepository } from '../repositories/user.repository';

interface IAuthService {
  signup(email: string, password: string, name: string): Promise<UserCredential>;
  login(email: string, password: string): Promise<UserCredential>;
  logout(): Promise<void>;
}

class AuthService implements IAuthService {
  private static instance: AuthService;

  private constructor(
    private auth: Auth,
    private userRepository: UserRepository
  ) { }

  public static initialize(auth: Auth, userRepository: UserRepository): void {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService(auth, userRepository);
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
    await this.createUserDocument(userCredential.user, email, name);
    return userCredential;
  }

  public async login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  public async logout(): Promise<void> {
    return signOut(this.auth);
  }

  private async createUserDocument(user: User, email: string, name: string): Promise<void> {
    await this.userRepository.create({
      uid: user.uid,
      email: email,
      displayName: name,
      photoURL: user.photoURL
    });
  }
}

// Initialize service
const userRepository = new UserRepository(db);
AuthService.initialize(auth, userRepository);
export const authService = AuthService.getInstance();
