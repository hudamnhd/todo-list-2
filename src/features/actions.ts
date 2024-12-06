// actions.ts

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export interface AddTodoAction {
  type: "ADD_TODO";
  payload: string;
}

export interface ToggleTodoAction {
  type: "TOGGLE_TODO";
  payload: number;
}

export interface DeleteTodoAction {
  type: "DELETE_TODO";
  payload: number;
}

export type TodoActionTypes =
  | AddTodoAction
  | ToggleTodoAction
  | DeleteTodoAction;

export const addTodo = (text: string): AddTodoAction => {
  return {
    type: "ADD_TODO",
    payload: text,
  };
};

export const toggleTodo = (id: number): ToggleTodoAction => {
  return {
    type: "TOGGLE_TODO",
    payload: id,
  };
};

export const deleteTodo = (id: number): DeleteTodoAction => {
  return {
    type: "DELETE_TODO",
    payload: id,
  };
};

export const setTodos = (todos: Todo[]) => ({
  type: "SET_TODOS",
  payload: todos,
});
