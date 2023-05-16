import { toast } from "react-toastify";
import { useState, useEffect, useRef } from "react";
import {
  Footer,
  Header,
  Content,
  AddItem,
  SearchItem,
  Toast,
} from "./components";

import {
  updateChecked,
  deleteItem,
  createItem,
  updateItem,
  fetchData,
} from "./Api";

const App = () => {
  const [newItemAdded, setNewItemAdded] = useState(false);
  const [filterType, setFilterType] = useState(null);
  const [activity, setActivity] = useState("");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [edit, setEdit] = useState({});
  const inputFocus = useRef(null);

  useEffect(() => {
    fetchData()
      .then((data) => setItems(data))
      .catch((error) => console.log(error.message));
  }, []);

  const handleSubmit = async (e) => {
    // Save and Add button
    e.preventDefault();
    if (activity.length < 4) {
      inputFocus.current.focus();
      return toast.warning("minimum 4 letter");
    }
    if (edit.id) {
      const updatedData = {
        ...edit,
        item: activity,
      };
      const updatedAllData = [...items];
      const findIndex = updatedAllData.findIndex((item) => item.id === edit.id);
      updatedAllData[findIndex] = updatedData;
      toast.success(`${activity} is updated`);
      setItems(updatedAllData);
      setEdit({});
      setActivity("");
      return await updateItem(edit.id, updatedData); // req API
    }

    const id = items.length > 0 ? items[items.length - 1].id + 1 : 1;
    const listItem = {
      id,
      checked: false,
      item: activity,
    };
    toast.success(`${activity} is added`);
    setItems([...items, listItem]);
    setNewItemAdded(true);
    setActivity("");
    await createItem(listItem); // req API
  };

  const handleCheck = async (id) => {
    // Checkbox button
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setItems(updatedItems);

    const selectedItem = items.find((item) => item.id === id);
    console.log(selectedItem)
    if (!selectedItem.checked) {
      toast.success(`${selectedItem.item} is checked`);
    } else {
      toast(`${selectedItem.item} is unchecked`);
    }
    await updateChecked(id, selectedItem.checked); //req API
  };

  const handleDelete = async (id) => {
    // Delete button
    if (edit.id) {
      return toast.error("Please save first");
    }
    const selectedItem = items.find((item) => item.id === id);
    toast.success(`${selectedItem.item} successfully removed`);

    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);

    await deleteItem(id); //req API
  };

  const handleEdit = async (todo) => {
    // Edit mode button
    if (edit.id) {
      return toast.error("Please save first");
    }
    setEdit(todo);
    setActivity(todo.item);
    inputFocus.current.focus();
  };

  const cancelEdit = () => {
    // Cancel edit button
    setActivity("");
    setEdit({});
  };

  const handleFilterChange = (type) => {
    // filter button type
    setFilterType(type);
    const toastMsg = type || "all";
    toast(`Show ${toastMsg} todo`);
  };

  const filteredItems = items.filter((item) => {
    // search and filter todo list function
    if (items) {
      const isIncludedInSearch = item.item
        .toLowerCase()
        .includes(search.toLowerCase());

      if (filterType === "completed") {
        return item.checked && isIncludedInSearch;
      } else if (filterType === "incomplete") {
        return !item.checked && isIncludedInSearch;
      } else {
        return isIncludedInSearch;
      }
    }
  });

  return (
    <div className="mx-2 xs:mx-auto max-w-md px-4 py-2 my-4 rounded-md border-2 bg-slate-200 border-gray-500">
      <Toast />
      <Header />
      <AddItem
        activity={activity}
        setActivity={setActivity}
        edit={edit}
        cancelEdit={cancelEdit}
        handleSubmit={handleSubmit}
        inputFocus={inputFocus}
      />
      <SearchItem
        items={items}
        search={search}
        setSearch={setSearch}
        filterType={filterType}
        handleFilterChange={handleFilterChange}
      />
      <Content
        items={filteredItems}
        handleCheck={handleCheck}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        newItemAdded={newItemAdded}
        setNewItemAdded={setNewItemAdded}
      />
      <Footer items={items} filterType={filterType} />
    </div>
  );
};

export default App;
