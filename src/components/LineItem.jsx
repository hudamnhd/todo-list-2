import { FaTrashAlt, FaEdit } from "react-icons/fa";

const LineItem = ({
  item,
  index,
  items,
  handleCheck,
  handleEdit,
  handleDelete,
}) => {
  const styleDiv = `flex items-center justify-between border border-b-2 shadow-md rounded-md p-2 hover:bg-slate-400 ${
    item.checked === true
      ? "bg-slate-200 border-green-600"
      : "bg-slate-100 border-gray-400"
  }`;
  return (
    <div
      key={item.id}
      className={`${index !== items.length - 1 && "mb-1"} ${styleDiv}`}
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
        <button type="" onClick={() => handleEdit(item)}>
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
