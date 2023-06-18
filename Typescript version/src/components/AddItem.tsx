import { useEffect } from "react";
import { ItemTodo } from "../type";
import { FaPlus, FaSave } from "react-icons/fa";
import { toast } from "react-toastify";
import { useGlobalState } from "../context/context";
import { createItem, updateItem } from "../utils/configApi";

const AddItem = () => {
  const {
    setNewItemAdded,
    activity,
    setActivity,
    items,
    setItems,
    edit,
    setEdit,
    inputFocus,
  } = useGlobalState();

  useEffect(() => {
    document.title = "Todolist";
    inputFocus.current!.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (
    e: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    // Save and Add button
    e.preventDefault();
    if (activity.length < 4) {
      inputFocus.current!.focus();
      toast.warning("minimum 4 letter");
      return;
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
      setEdit({} as ItemTodo);
      setActivity("");
      await updateItem(edit.id, updatedData); // req API
      return;
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

  const cancelEdit = () => {
    // Cancel edit button
    setActivity("");
    setEdit({} as ItemTodo);
  };

  return (
    <form className="flex my-2 space-x-2">
      <input
        className="input-add-todo"
        type="text"
        maxLength={20}
        value={activity}
        onChange={(e) => setActivity(e.target.value)}
        placeholder="Input text here"
        ref={inputFocus}
      />

      <div className="flex space-x-1">
        <button
          className={`${
            !activity && "opacity-50 cursor-not-allowed"
          } button-input-todo group hover:bg-blue-600`}
          onClick={handleSubmit}
          disabled={!activity}
        >
          {edit.id ? (
            <FaSave
              className="text-blue-600 group-hover:text-white"
              size="20px"
            />
          ) : (
            <FaPlus
              className="text-blue-600 group-hover:text-white"
              size="20px"
            />
          )}
        </button>
        {edit.id && (
          <button
            className="button-input-todo group hover:bg-red-600"
            onClick={cancelEdit}
          >
            <FaPlus
              className="rotate-45 text-red-600 group-hover:text-white"
              size="20px"
            />
          </button>
        )}
      </div>
    </form>
  );
};

export default AddItem;
