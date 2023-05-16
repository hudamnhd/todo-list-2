import { FaPlus, FaSave } from "react-icons/fa";
import { useEffect } from "react";

const styleInputBox =
  "bg-slate-50 w-full py-1 px-2  border border-gray-400 rounded-lg focus:outline-none focus:ring focus:border-white ring-blue-600 shadow-md";
const styleButton =
  "group bg-slate-50 rounded-lg border border-gray-400 p-1 px-2";

const AddItem = ({
  handleSubmit,
  activity,
  setActivity,
  edit,
  cancelEdit,
  inputFocus,
}) => {
  useEffect(() => {
    document.title = "Todolist";
    inputFocus.current.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form className="flex my-2 space-x-2">
      <input
        className={styleInputBox}
        type="text"
        maxLength="20"
        value={activity}
        onChange={(e) => setActivity(e.target.value)}
        placeholder="Input text here"
        ref={inputFocus}
      />

      <div className="flex space-x-1">
        <button
          className={`${
            !activity && "opacity-50 cursor-not-allowed"
          } ${styleButton} hover:bg-blue-600`}
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
            className={`${styleButton} hover:bg-red-600`}
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
