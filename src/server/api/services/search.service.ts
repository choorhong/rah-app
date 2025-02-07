import { db } from '../../db';
import { IUser } from '@/interfaces/auth.interface';
import { UserRepository } from '../repositories/user.repository';

export interface ISearchService {
  searchUsers(term: string): Promise<IUser[] | null>;
}

class SearchService implements ISearchService {
  private static instance: SearchService;

  private constructor(private userRepository: UserRepository) { }

  public static initialize(userRepository: UserRepository): void {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService(userRepository);
    }
  }

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      throw new Error('SearchService must be initialized');
    }
    return SearchService.instance;
  }

  public async searchUsers(searchTerm: string): Promise<IUser[] | null> {
    return this.userRepository.findByEmailOrName(searchTerm);
  }
}

// Initialize service
const userRepository = new UserRepository(db);
SearchService.initialize(userRepository);
export const searchService = SearchService.getInstance();