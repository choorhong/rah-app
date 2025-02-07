import { Firestore } from 'firebase/firestore';

export class FirebaseRepository<T> {
  constructor(
    protected db: Firestore,
    protected collectionName: string
  ) { }

}