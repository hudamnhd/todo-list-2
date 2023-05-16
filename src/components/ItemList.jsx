import LineItem from "./LineItem";
import { useRef, useEffect } from "react";

const ItemList = ({
  items,
  handleCheck,
  handleEdit,
  handleDelete,
  newItemAdded,
  setNewItemAdded,
}) => {
  const itemsContainerRef = useRef(null);

  useEffect(() => {
    // Ambil elemen item terakhir yang baru ditambahkan
    const newItem = itemsContainerRef.current.lastElementChild;
    // Scroll ke posisi item baru jika ada dan isNewItemAdded bernilai true
    if (newItemAdded && newItem) {
      newItem.scrollIntoView({ behavior: "smooth" });
      setNewItemAdded(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, newItemAdded]);

  return (
    <div
      className={`h-[432px] overflow-y-auto px-2 scroll-smooth mb-1 ${
        items.length === 0 && "flex justify-center items-center"
      }`}
      ref={itemsContainerRef}
    >
      {items.length > 0 ? (
        items.map((item, index) => (
          <LineItem
            key={item.id}
            item={item}
            items={items}
            index={index}
            handleCheck={handleCheck}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
          />
        ))
      ) : (
        <h1 className="text-xl text-center font-semibold ">Todolist empty</h1>
      )}
    </div>
  );
};

export default ItemList;
