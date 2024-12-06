import { combineReducers } from "redux";
import todoReducer from "@/features/daily-tasks/slice";

export const rootReducer = combineReducers({
  tasks: todoReducer,
});
