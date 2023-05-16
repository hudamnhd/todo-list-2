import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Toast = () => {
  const contextClass = {
    default: "bg-slate-200 text-gray-600 border border-gray-400",
    success: "bg-slate-200 text-black",
    error: "bg-slate-200 text-black",
    warning: "bg-red-600",
    info: "bg-gray-600",
  };

  return (
    <ToastContainer
      toastClassName={({ type }) =>
        contextClass[type || "default"] +
        " relative flex p-1 min-h-10 rounded-md justify-between overflow-hidden cursor-pointer mb-2 mx-4 xs:mx-0"
      }
      bodyClassName={() => "flex text-sm font-medium p-3"}
      position="bottom-right"
      theme="light"
      autoClose={3000}
    />
  );
};

export default Toast;
