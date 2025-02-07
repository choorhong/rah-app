import { Firestore } from 'firebase/firestore';

export class FirebaseRepository {
  constructor(
    protected db: Firestore,
    protected collectionName: string
  ) { }

}