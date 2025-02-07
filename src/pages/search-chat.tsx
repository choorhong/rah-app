import { useState } from "react";
import { Command, CommandDialog, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { IUser } from "@/interfaces/auth.interface";
import { searchService } from "@/server/api/services/search.service";

const debounce = <T extends (...args: any[]) => void>(cb: T, wait: number = 500): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => cb(...args), wait);
  };
};

const SearchChatPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<IUser[]>([]);

  const searchUsers = async (searchTerm: string) => {
    if (!searchTerm) return [];
    const results = await searchService.searchUsers(searchTerm);
    return results ?? [];
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
          <CommandInput placeholder="Search by name or email (CASE SENSITIVE)" onValueChange={handleValueChange} />
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
