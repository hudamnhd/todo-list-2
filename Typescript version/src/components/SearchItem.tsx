import { ItemTodo } from "../type";
import { Dispatch, SetStateAction } from "react";
import {
  FaSistrix,
  FaCheckCircle,
  FaTimesCircle,
  FaListAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";

interface PropsType {
  items: ItemTodo[];
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  filterType: string | null;
  setFilterType: Dispatch<SetStateAction<string | null>>;
}

const SearchItem = (props: PropsType) => {
  const { items, search, setSearch, filterType, setFilterType } = props;
  const totalItems = items.length;
  const isAllChecked = items.filter((item) => item.checked === true).length;
  const isAllUnchecked = items.filter((item) => item.checked === false).length;
  const isHidden = isAllChecked === totalItems || isAllUnchecked === totalItems;

  const handleFilterChange = (type: string | null): void => {
    // filter button type
    setFilterType(type);
    const toastMsg = type || "all";
    toast(`Show ${toastMsg} todo`);
  };

  const getButtonClass = (buttonType: string | null): string => {
    return filterType === "completed" && buttonType === "completed"
      ? "bg-green-600 text-white"
      : filterType === "incomplete" && buttonType === "incomplete"
      ? "bg-red-600 text-white"
      : filterType === null && buttonType === null
      ? "bg-blue-600 text-white"
      : "bg-slate-50";
  };

  return (
    <form className="mb-4 flex space-x-2" onSubmit={(e) => e.preventDefault()}>
      <div className="relative flex items-center">
        <input
          type="text"
          placeholder="Search item"
          className="input-search-todo"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <FaSistrix className="absolute left-2 text-gray-400" size="20px" />
      </div>
      {/* Button show completed todo */}
      <button
        onClick={() => handleFilterChange("completed")}
        className={`${getButtonClass("completed")} 
          button-search-todo group hover:bg-green-600 hover:text-white`}
      >
        <FaCheckCircle
          className={`${
            filterType === "completed" ? "text-white" : "text-green-600"
          } group-hover:text-white`}
          size="20px"
        />
        <p className="">{isAllChecked}</p>
      </button>
      {/* Button show incomplete todos */}
      <button
        onClick={() => handleFilterChange("incomplete")}
        className={`${getButtonClass("incomplete")} button-search-todo
         group hover:bg-red-600 hover:text-white`}
      >
        <FaTimesCircle
          className={`${
            filterType === "incomplete" ? "text-white" : "text-red-600"
          } group-hover:text-white`}
          size="20px"
        />
        <p className="">{isAllUnchecked}</p>
      </button>
      {/* Button show all todo */}
      {!isHidden && (
        <button
          onClick={() => handleFilterChange(null)}
          className={`button-search-todo ${getButtonClass(
            null
          )} group hover:bg-blue-600 hover:text-white `}
        >
          <FaListAlt
            className={`${
              filterType === null ? "text-white" : "text-blue-600"
            } group-hover:text-white`}
            size="20px"
          />
          <p>{totalItems}</p>
        </button>
      )}
    </form>
  );
};

export default SearchItem;
