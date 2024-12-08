import { configureStore, Middleware } from "@reduxjs/toolkit";
import { get_cache, set_cache } from "@/lib/cache-client";

// Load initial todos from localforage
export const initial_daily_tasks = async () => {
  return await get_cache("daily-tasks");
};

// This middleware will save the state to localforage whenever the state changes.
const daily_tasks_middleware: Middleware =
  (store) => (next) => async (action) => {
    const result = next(action);
    const state = store.getState();

    await set_cache("daily-tasks", state.tasks.tasks);

    const activity_log = {
      timestamp: new Date().toISOString(),
      action: action.type,
      payload: action.payload,
    };

    const cache_log = await get_cache("log-daily-tasks");

    if (action.type !== "SET_TASKS" || action.type !== "UPDATE_COLUMN_TASK") {
      const ttl = 24 * 60 * 60 * 1000; // Satu hari dalam milidetik
      if (cache_log) {
        await set_cache("log-daily-tasks", [...cache_log, activity_log], ttl);
      } else {
        await set_cache("log-daily-tasks", [activity_log], ttl);
      }
    }

    return result;
  };

// Custom store initializer function that loads todos from localforage
import { rootReducer } from "./reducers";

export const store = configureStore({
  reducer: rootReducer,

  // middleware: (getDefaultMiddleware) =>
  //   getDefaultMiddleware().concat(daily_tasks_middleware), // Add our middleware here
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
