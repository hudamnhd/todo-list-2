import {
  FaSistrix,
  FaCheckCircle,
  FaTimesCircle,
  FaListAlt,
} from "react-icons/fa";

const SearchItem = ({
  items,
  search,
  setSearch,
  filterType,
  handleFilterChange,
}) => {
  const totalItems = items.length;
  const isAllChecked = items.filter((item) => item.checked === true).length;
  const isAllUnchecked = items.filter((item) => item.checked === false).length;
  const isHidden = isAllChecked === totalItems || isAllUnchecked === totalItems;
  const styleButton =
    "py-1 px-2 rounded-lg flex items-center space-x-2 border border-gray-400 font-semibold";
  const styleInputBox =
    "bg-slate-50 w-full py-1 px-2 pl-9 border border-gray-400 rounded-lg focus:outline-none focus:ring focus:border-white ring-blue-600 shadow-md";

  const getButtonClass = (buttonType) => {
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
          className={styleInputBox}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <FaSistrix className="absolute left-2 text-gray-400" size="20px" />
      </div>
      {/* Button show completed todo */}
      <button
        onClick={() => handleFilterChange("completed")}
        className={`${getButtonClass(
          "completed"
        )} ${styleButton} group hover:bg-green-600 hover:text-white`}
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
        className={`${getButtonClass(
          "incomplete"
        )} ${styleButton} group hover:bg-red-600 hover:text-white`}
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
      <button
        onClick={() => handleFilterChange(null)}
        className={`${isHidden && "hidden"} 
${styleButton} ${getButtonClass(
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
    </form>
  );
};

export default SearchItem;
