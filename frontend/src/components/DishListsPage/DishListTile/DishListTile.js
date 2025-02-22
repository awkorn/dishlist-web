import React from "react";
import "./DishListTile.css";
import pinIcon from "../../../assets/icons/pin-drawing.png";

const DishListTile = ({ dishLists }) => {
  if (!dishLists || dishLists.length === 0)
    return (
      <div className="no-dishlists-container">
        <p className="no-dishlists-message">No DishLists found.</p>
      </div>
    );

  return (
    <div className="dish-tiles">
      {dishLists.map((dishlist) => (
        <div key={dishlist.id} className="dish-tile">
          <h3 className="list-title">{dishlist.title}</h3>
          {dishlist.isPinned && <img src={pinIcon} alt="pin" className="pin" />}
        </div>
      ))}
    </div>
  );
};

export default DishListTile;
