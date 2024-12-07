// reducers.ts
import { TaskActionTypes, Task, SubTask } from "./actions";

export interface TodoState {
  tasks: {
    [key: string]: Task[];
  };
}

const initialState: TodoState = {
  tasks: {},
};

import { format, isToday } from "date-fns";
function get_formatted_date(timestamp: number | undefined) {
  const currentDate = timestamp ? new Date(timestamp) : new Date();
  currentDate.setHours(0, 1, 0, 0);

  return {
    key: format(currentDate, "yyyy-MM-dd"),
    q: format(currentDate, "EEEE, dd MMM yyyy"),
    timestamp: currentDate.getTime(),
    is_today: isToday(currentDate),
  };
}
const todoReducer = (
  state = initialState,
  action: TaskActionTypes,
): TodoState => {
  switch (action.type) {
    case "ADD_TASK": {
      const payload: Task = {
        id: Date.now(),
        status: "draft",
        title: "",
        category: { label: "General", color: "#9ca3af" },
        start_at: null,
        total_time: 0,
        target_sessions: 0,
        completed_sessions: 0,
        end_at: null,
        sessions: [],
        sub_tasks: [],
        created_at: new Date().toISOString(),
        updated_at: null,
      };

      const date_key = get_formatted_date(action.payload?.key);
      const formatted_date = date_key.key;

      // Create a new array by spreading the existing data and adding the new task
      const existing_data = state.tasks[formatted_date] || [];
      const updated_data = [...existing_data, payload];

      return {
        tasks: {
          ...state.tasks,
          [formatted_date]: updated_data, // Storing the new array for the formatted date
        },
      };
    }
    case "ADD_SUB_TASK": {
      const payload: SubTask = {
        id: Date.now(),
        checked: false,
        title: "",
        category: { label: "", color: "gray" },
      };

      const date_key = get_formatted_date(action.payload?.key);
      const formatted_date = date_key.key;

      // Cek apakah ada task untuk tanggal ini
      if (state.tasks[formatted_date]) {
        // Temukan index task berdasarkan ID yang ada
        const indexData = state.tasks[formatted_date].findIndex(
          (d) => d.id === action.payload.id,
        );

        if (indexData !== -1) {
          const original_data = state.tasks[formatted_date][indexData];
          const oldSubTasks = original_data?.sub_tasks || [];

          // Membuat update pada sub_tasks dan updatedAt tanpa merubah state lama
          const updatedTask = {
            ...original_data,
            sub_tasks: [...oldSubTasks, payload],
            updated_at: new Date().toISOString(),
          };

          // Update tasks dengan data baru
          return {
            ...state,
            tasks: {
              ...state.tasks,
              [formatted_date]: [
                ...state.tasks[formatted_date].slice(0, indexData), // Task sebelum yang diubah
                updatedTask, // Task yang sudah diupdate
                ...state.tasks[formatted_date].slice(indexData + 1), // Task setelah yang diubah
              ],
            },
          };
        }
      }

      // Jika tidak ada task yang ditemukan pada formatted_date atau indexData tidak ditemukan
      return state;
    }
    case "DELETE_SUB_TASK": {
      const { sub_task_id, id } = action.payload;
      const date_key = get_formatted_date(action.payload?.key);
      const formatted_date = date_key.key;

      if (state.tasks[formatted_date]) {
        const taskIndex = state.tasks[formatted_date].findIndex(
          (task) => task.id === id,
        );

        if (taskIndex !== -1) {
          const task = state.tasks[formatted_date][taskIndex];
          const filteredSubTasks = task.sub_tasks.filter(
            (subTask) => subTask.id !== sub_task_id,
          );

          const updatedTask = {
            ...task,
            sub_tasks: filteredSubTasks,
            updated_at: new Date().toISOString(),
          };

          return {
            ...state,
            tasks: {
              ...state.tasks,
              [formatted_date]: [
                ...state.tasks[formatted_date].slice(0, taskIndex),
                updatedTask,
                ...state.tasks[formatted_date].slice(taskIndex + 1),
              ],
            },
          };
        }
      }

      return state;
    }
    case "UPDATE_SUB_TASK": {
      const { sub_task_id, id, updated_sub_task } = action.payload;
      const date_key = get_formatted_date(action.payload?.key);
      const formatted_date = date_key.key;

      if (state.tasks[formatted_date]) {
        const taskIndex = state.tasks[formatted_date].findIndex(
          (task) => task.id === id,
        );

        if (taskIndex !== -1) {
          const task = state.tasks[formatted_date][taskIndex];

          // Update the specific sub-task by matching the sub-task id
          const updatedSubTasks = task.sub_tasks.map((subTask) =>
            subTask.id === sub_task_id
              ? { ...subTask, ...updated_sub_task } // Update sub-task data
              : subTask,
          );

          const updatedTask = {
            ...task,
            sub_tasks: updatedSubTasks,
            updated_at: new Date().toISOString(),
          };

          return {
            ...state,
            tasks: {
              ...state.tasks,
              [formatted_date]: [
                ...state.tasks[formatted_date].slice(0, taskIndex),
                updatedTask,
                ...state.tasks[formatted_date].slice(taskIndex + 1),
              ],
            },
          };
        }
      }

      return state;
    }
    case "UPDATE_SESSON_TASK": {
      const { id, updated_session_task } = action.payload;
      const date_key = get_formatted_date(action.payload?.key);
      const formatted_date = date_key.key;

      if (state.tasks[formatted_date]) {
        const taskIndex = state.tasks[formatted_date].findIndex(
          (task) => task.id === id,
        );

        if (taskIndex !== -1) {
          const task = state.tasks[formatted_date][taskIndex];

          const updatedSubTasks = [
            ...task.sessions, // Spread the old sessions to create a new array
            ...updated_session_task.filter(
              (newSession) =>
                !task.sessions.some(
                  (existingSession) =>
                    existingSession.date === newSession.date &&
                    existingSession.time === newSession.time,
                ),
            ), // Only add new sessions that are not already in the task.sessions
          ];

          const updatedTask = {
            ...task, // Spread the task object to create a new object
            sessions: updatedSubTasks, // Set the new sessions array
            status: "draft" as "draft",
            total_time: 0,
            start_at: null,
            updated_at: new Date().toISOString(),
          };

          // Ensure we create a new tasks array, modifying only the task that was updated
          return {
            ...state,
            tasks: {
              ...state.tasks,
              [formatted_date]: [
                ...state.tasks[formatted_date].slice(0, taskIndex), // Keep the tasks before the updated task
                updatedTask, // Place the updated task at the correct index
                ...state.tasks[formatted_date].slice(taskIndex + 1), // Keep the tasks after the updated task
              ],
            },
          };
        }
      }

      return state;
    }
    case "UPDATE_TASK": {
      const date_key = get_formatted_date(action.payload?.key);
      const formatted_date = date_key.key;

      // Ambil data task yang sudah ada untuk tanggal yang ditentukan
      const existing_data = state.tasks[formatted_date] || [];

      // Temukan index task yang ingin diupdate
      const taskIndex = existing_data.findIndex(
        (item) => item.id === action.payload.id,
      );

      // Jika task ditemukan
      if (taskIndex !== -1) {
        // Ambil task yang asli
        const taskToUpdate = existing_data[taskIndex];

        const new_session = action.payload.updated_task?.sessions || [];
        // Gabungkan data baru dengan task yang lama, pastikan tidak mengubah data yang tidak ada di payload
        const updatedTask = {
          ...taskToUpdate,
          ...action.payload.updated_task, // Data yang ingin diupdate dari payload
          sessions: [...taskToUpdate.sessions, ...new_session],
          updated_at: new Date().toISOString(),
        };

        // Buat array baru dengan task yang sudah diperbarui
        const updatedData = [
          ...existing_data.slice(0, taskIndex), // Task sebelum yang diubah
          updatedTask, // Task yang sudah diupdate
          ...existing_data.slice(taskIndex + 1), // Task setelah yang diubah
        ];

        return {
          tasks: {
            ...state.tasks,
            [formatted_date]: updatedData, // Simpan array task yang sudah diperbarui
          },
        };
      } else {
        // Jika task tidak ditemukan, kembalikan state lama tanpa perubahan
        return state;
      }
    }
    case "UPDATE_COLUMN_TASK": {
      const date_key = get_formatted_date(action.payload?.key);
      const formatted_date = date_key.key;
      const updated_task = action.payload.updated_task || [];

      return {
        tasks: {
          ...state.tasks,
          [formatted_date]: updated_task,
        },
      };
    }
    case "DELETE_TASK": {
      const date_key = get_formatted_date(action.payload?.key);
      const formatted_date = date_key.key;

      // Create a new array by spreading the existing data and adding the new task
      const existing_data = state.tasks[formatted_date] || [];

      const filteredData = existing_data.filter(
        (item) => item.id !== action.payload.id,
      );

      const updated_data = [...filteredData];

      return {
        tasks: {
          ...state.tasks,
          [formatted_date]: updated_data, // Storing the new array for the formatted date
        },
      };
    }
    case "SET_TASKS":
      return {
        tasks: action.payload,
      };
    default:
      return state;
  }
};

export default todoReducer;
