import { ItemTodo } from "../type";
import React, {
  createContext,
  useState,
  useRef,
  useContext,
  Dispatch,
  SetStateAction,
} from "react";

interface TypeContext {
  newItemAdded: boolean;
  setNewItemAdded: Dispatch<SetStateAction<boolean>>;
  filterType: string | null;
  setFilterType: Dispatch<SetStateAction<string | null>>;
  activity: string;
  setActivity: Dispatch<SetStateAction<string>>;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  items: ItemTodo[];
  setItems: Dispatch<SetStateAction<ItemTodo[]>>;
  edit: ItemTodo;
  setEdit: Dispatch<SetStateAction<ItemTodo>>;
  inputFocus: React.RefObject<HTMLInputElement>;
}

const AppContext = createContext<TypeContext | undefined>(undefined);

const GlobalStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [newItemAdded, setNewItemAdded] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [activity, setActivity] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [items, setItems] = useState<ItemTodo[]>([]);
  const [edit, setEdit] = useState<ItemTodo>({} as ItemTodo);
  const inputFocus = useRef<HTMLInputElement>(null);

  return (
    <AppContext.Provider
      value={{
        newItemAdded,
        setNewItemAdded,
        filterType,
        setFilterType,
        activity,
        setActivity,
        search,
        setSearch,
        items,
        setItems,
        edit,
        setEdit,
        inputFocus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

const useGlobalState = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useGlobalState must be used within a AppContext");
  }
  return context;
};

export { GlobalStateProvider, useGlobalState };
