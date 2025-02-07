import { useState } from "react";
import { Command, CommandDialog, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { type IUser, useAuth } from "@/context/AuthContext";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const SearchChatPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<IUser[]>([]);

  const debounce = <T extends (...args: any[]) => void>(cb: T, wait: number = 500): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout>;

    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => cb(...args), wait);
    };
  };

  const searchUsers = async (searchTerm: string) => {
    if (!searchTerm) {
      return [];
    };

    const usersRef = collection(db, 'users');

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
  };

  const handleValueChange = debounce(async (value: string) => {
    const results = await searchUsers(value);
    setResults(results);

  });

  return (
    <div className="h-[30vh] justify-items-center content-center">
      <h2 className="text-2xl font-semibold text-center mb-4">
        Welcome {user?.displayName || user?.email}
      </h2>
      {/* Search input field */}
      <Input
        className="w-[320px]"
        placeholder="Search..."
        onFocus={() => setOpen(true)} // Open the command box when clicked
        readOnly // Prevents typing in the input itself
      />

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Type a command or search..." onValueChange={handleValueChange} />
          <CommandList className="scrollbar-none">
            <CommandEmpty>No results found.</CommandEmpty>
            {
              results.map((item, index) => {
                return (
                  <CommandItem key={index} className="cursor-pointer"
                    onSelect={() => {
                      navigate(`/chat/${item.uid}`);
                    }}>
                    {item.email}
                  </CommandItem>
                )
              }
              )
            }
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
};

export default SearchChatPage;
