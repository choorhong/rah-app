import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

class FirebaseService {
  private static instance: FirebaseService;
  private app: FirebaseApp;
  private auth: Auth;
  private firestore: Firestore;

  private constructor() {
    const config: FirebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

    if (!config.apiKey) {
      throw new Error('Firebase configuration is missing');
    }

    this.app = initializeApp(config);
    this.auth = getAuth(this.app);
    this.firestore = getFirestore(this.app);
  }

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  public getAuth(): Auth {
    return this.auth;
  }

  public getDb(): Firestore {
    return this.firestore;
  }

  public getApp(): FirebaseApp {
    return this.app;
  }
}

export const firebase = FirebaseService.getInstance();
export const auth = firebase.getAuth();
export const db = firebase.getDb();