import ItemList from "./ItemList";

const Content = ({
  items,
  handleCheck,
  handleEdit,
  handleDelete,
  newItemAdded,
  setNewItemAdded,
}) => {
  return (
    <>
      <ItemList
        items={items}
        handleCheck={handleCheck}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        newItemAdded={newItemAdded}
        setNewItemAdded={setNewItemAdded}
      />
    </>
  );
};

export default Content;
