const Footer = ({ items, filterType }) => {
  const today = new Date();
  const totalItems = items.length;
  const isAllChecked = items.filter((item) => item.checked === true).length;
  const isAllUnchecked = items.filter((item) => item.checked === false).length;

  return (
    <div className="text-center">
      <p className="text-xl font-semibold">
        {filterType === null
          ? totalItems
          : filterType === "completed"
          ? isAllChecked
          : isAllUnchecked}{" "}
        List {totalItems > 1 ? "Items" : "Item"}
      </p>
      <p>Copyright &copy; {today.getFullYear()}</p>
    </div>
  );
};

export default Footer;
