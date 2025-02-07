import { collection, query, where, getDocs, Firestore } from 'firebase/firestore';
import { db } from '../db';
import { IUser } from '@/interfaces/auth';

export interface ISearchService {
  searchUsers(term: string): Promise<IUser[]>;
}

class SearchService implements ISearchService {
  private static instance: SearchService;

  private constructor(private database: Firestore) { }

  public static initialize(database: Firestore): void {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService(database);
    }
  }

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      throw new Error('SearchService must be initialized');
    }
    return SearchService.instance;
  }

  public async searchUsers(searchTerm: string): Promise<IUser[]> {

    const usersRef = collection(this.database, 'users');

    // Single field search to avoid composite index requirement
    const emailQuery = query(
      usersRef,
      where('email', '>=', searchTerm.toLowerCase()),
      where('email', '<=', searchTerm.toLowerCase() + '\uf8ff')
    );


    const nameQuery = query(
      usersRef,
      where('displayName', '>=', searchTerm),
      where('displayName', '<=', searchTerm + '\uf8ff')
    );

    const [emailSnapshot, nameSnapshot] = await Promise.all([
      getDocs(emailQuery),
      getDocs(nameQuery)
    ]);


    // Combine and deduplicate results
    const results = new Map();

    emailSnapshot.forEach((doc) => {
      results.set(doc.id, { id: doc.id, ...doc.data() });
    });

    nameSnapshot.forEach((doc) => {
      results.set(doc.id, { id: doc.id, ...doc.data() });
    });

    return Array.from(results.values());
  }
}

// Initialize service
SearchService.initialize(db);
export const searchService = SearchService.getInstance();