interface ItemTodo {
  id: number;
  checked: boolean;
  item: string;
}

interface UpdateData {
  data?: Partial<ItemTodo>;
  url: string;
  method: string;
}
const API_URL: string = "http://localhost:8080/items";

const fetchData = async () => {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    return data;
  } catch (err) {
    if (err instanceof Error) {
      // ✅ TypeScript knows err is Error
      console.log(err.message);
    } else {
      console.log("Unexpected error", err);
    }
  }
};

const updateData = async ({ data, url, method }: UpdateData) => {
  console.log(data, url, method);
  try {
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    await fetch(url, options);
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
    } else {
      console.log("Unexpected error", err);
    }
  }
};

const createItem = async (data: ItemTodo) => {
  const url = `${API_URL}`;
  await updateData({ data, url, method: "POST" });
};

const updateItem = async (id: number, data: Partial<ItemTodo>) => {
  const url = `${API_URL}/${id}`;
  await updateData({ data, url, method: "PUT" });
};

const updateChecked = async (id: number, checked: boolean) => {
  const url = `${API_URL}/${id}`;
  await updateData({
    data: { checked },
    url,
    method: "PATCH",
  });
};

const deleteItem = async (id: number) => {
  const url = `${API_URL}/${id}`;
  await updateData({
    url,
    method: "DELETE",
  });
};

export { updateChecked, deleteItem, createItem, updateItem, fetchData };
