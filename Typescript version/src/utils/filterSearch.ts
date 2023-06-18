import { ItemTodo } from "../type";

export const filterItems = (
  items: ItemTodo[],
  filterType: string | null,
  search: string
): ItemTodo[] => {
  if (!items) {
    return [];
  }

  const filteredItems = items.filter((item) => {
    const isIncludedInSearch = item.item
      .toLowerCase()
      .includes(search.toLowerCase());
    if (filterType === "completed") {
      return item.checked && isIncludedInSearch;
    } else if (filterType === "incomplete") {
      return !item.checked && isIncludedInSearch;
    } else {
      return isIncludedInSearch;
    }
  });

  return filteredItems;
};
