import { ItemTodo } from "../type";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import { toast } from "react-toastify";
import { updateChecked, deleteItem } from "../utils/configApi";
import { useGlobalState } from "../context/context";

interface PropsType {
  index: number;
  item: ItemTodo;
}

const LineItem = (props: PropsType) => {
  const { index, item } = props;
  const { items, setItems, edit, setEdit, setActivity, inputFocus } =
    useGlobalState();
  const handleCheck = async (id: number): Promise<void> => {
    // Checkbox button
    const updatedItems = items.map((item: ItemTodo) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setItems(updatedItems);

    const selectedItem = items.find((item: ItemTodo) => item.id === id);
    console.log(selectedItem);
    if (!selectedItem!.checked) {
      toast.success(`${selectedItem!.item} is checked`);
    } else {
      toast(`${selectedItem!.item} is unchecked`);
    }
    await updateChecked(id, selectedItem!.checked); //req API
  };

  const handleDelete = async (id: number): Promise<void> => {
    // Delete button
    if (edit.id) {
      toast.error("Please save first");
      return;
    }
    const selectedItem = items.find((item: ItemTodo) => item.id === id);
    toast.success(`${selectedItem!.item} successfully removed`);

    const updatedItems = items.filter((item: ItemTodo) => item.id !== id);
    setItems(updatedItems);

    await deleteItem(id); //req API
  };

  const handleEdit = async (todo: ItemTodo) => {
    // Edit mode button
    if (edit.id) {
      toast.error("Please save first");
      return;
    }
    setEdit(todo);
    setActivity(todo.item);
    inputFocus.current!.focus();
  };

  return (
    <div
      key={item.id}
      className={`${index !== items.length - 1 && "mb-1"} items-box ${
        item.checked === true
          ? "bg-slate-200 border-green-600"
          : "bg-slate-100 border-gray-400"
      }`}
    >
      <div className="flex flex-1 items-center cursor-pointer">
        <p className="text-md w-7 font-medium text-center">{index + 1})</p>

        <input
          className="accent-green-600 scale-[175%] m-2 cursor-pointer"
          type="checkbox"
          checked={item.checked}
          onChange={() => handleCheck(item.id)}
        />
        <p
          className={`${
            item.checked === true && "line-through"
          } text-xl ml-1  decoration-4 font-semibold`}
        >
          {item.item}
        </p>
      </div>
      <div className="flex space-x-2">
        <button onClick={() => handleEdit(item)}>
          <FaEdit className="text-blue-600 hover:text-blue-500" size="20px" />
        </button>

        <button onClick={() => handleDelete(item.id)}>
          <FaTrashAlt className="text-red-600 hover:text-red-500" size="20px" />
        </button>
      </div>
    </div>
  );
};

export default LineItem;
