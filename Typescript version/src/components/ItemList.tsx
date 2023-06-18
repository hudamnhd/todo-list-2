import { Dispatch, SetStateAction } from "react";
import LineItem from "./LineItem";
import { useRef, useEffect } from "react";
import { ItemTodo } from "../type";

interface PropsType {
  items: ItemTodo[];
  newItemAdded: boolean;
  setNewItemAdded: Dispatch<SetStateAction<boolean>>;
}

const ItemList = (props: PropsType) => {
  const { items, newItemAdded, setNewItemAdded } = props;
  const itemsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ambil elemen item terakhir yang baru ditambahkan
    const newItem = itemsContainerRef.current!.lastElementChild;
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
          <LineItem key={item.id} item={item} index={index} />
        ))
      ) : (
        <h1 className="text-xl text-center font-semibold ">Todolist empty</h1>
      )}
    </div>
  );
};

export default ItemList;
