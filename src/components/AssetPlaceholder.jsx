const AssetPlaceholder = ({ name, description, className = "" }) => {
  return (
    <div className={`overflow-hidden rounded-xl ${className}`}>
      <img
        src={`/assets/${name}`}
        alt={description}
        className="h-full min-h-42.5 w-full object-cover"
      />
    </div>
  );
};

export default AssetPlaceholder;