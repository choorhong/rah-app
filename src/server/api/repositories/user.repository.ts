import { IUser } from "@/interfaces/auth.interface";
import { FirebaseRepository } from "./firebase.repository";
import { Firestore, doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

export class UserRepository extends FirebaseRepository<IUser> {
  constructor(db: Firestore) {
    super(db, 'users');
  }

  async create(user: IUser): Promise<void> {
    await setDoc(doc(this.db, this.collectionName, user.uid), user);
  }

  async findByEmailOrName(searchTerm: string): Promise<IUser[] | null> {
    const usersRef = collection(this.db, this.collectionName);

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

    return [...emailSnapshot.docs, ...nameSnapshot.docs].map(doc => doc.data() as IUser);
  }
}