import { useEffect } from "react";
import { useGlobalState } from "./context/context";
import { filterItems } from "./utils/filterSearch";
import {
  Toast,
  Header,
  AddItem,
  SearchItem,
  ItemList,
  Footer,
} from "./components";
import { fetchData } from "./utils/configApi";

const App = () => {
  const {
    newItemAdded,
    setNewItemAdded,
    filterType,
    setFilterType,
    search,
    setSearch,
    items,
    setItems,
  } = useGlobalState();

  useEffect(() => {
    fetchData()
      .then((data) => setItems(data))
      .catch((error) => console.log(error.message));
  }, []);

  const filteredItems = filterItems(items, filterType, search);

  return (
    <div className="main-container">
      <Toast />
      <Header />
      <AddItem />
      <SearchItem
        items={items}
        search={search}
        setSearch={setSearch}
        filterType={filterType}
        setFilterType={setFilterType}
      />
      <ItemList
        items={filteredItems}
        newItemAdded={newItemAdded}
        setNewItemAdded={setNewItemAdded}
      />
      <Footer items={items} filterType={filterType} />
    </div>
  );
};

export default App;
