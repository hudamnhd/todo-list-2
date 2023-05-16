const API_URL = "http://localhost:8080/items";

const fetchData = async () => {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("Terjadi Kesalahan: " + error.message);
  }
};

const updateData = async ({ id, data, url, method }) => {
  try {
    await fetch(url, {
      method: method,
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

const createItem = async (data) => {
  const url = `${API_URL}`;
  await updateData({ data, url, method: "POST" });
};

const updateItem = async (id, data) => {
  const url = `${API_URL}/${id}`;
  await updateData({ id, data, url, method: "PUT" });
};

const updateChecked = async (id, data) => {
  const url = `${API_URL}/${id}`;
  await updateData({ id, data: { checked: data }, url, method: "PATCH" });
};

const deleteItem = async (id, data) => {
  const url = `${API_URL}/${id}`;
  await updateData({ id, url, method: "DELETE" });
};

export { updateChecked, deleteItem, createItem, updateItem, fetchData };
