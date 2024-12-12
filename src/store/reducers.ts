import { combineReducers } from "redux";
import todoReducer from "@/features/daily-tasks/slice";
import todoBoardReducer from "@/features/daily-tasks-board/slice";

export const rootReducer = combineReducers({
  tasks: todoReducer,
  board: todoBoardReducer,
});
