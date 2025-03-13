import React from "react";

const Flipcard = ({ image, brand, description, Yearlevel }) => {
  return (
    <div className="flip-card">
      <div className="flip-card-inner">
        <div className="flip-card-front">
          <img src={image} alt={brand} />
        </div>
        <div className="flip-card-back">
          <h3>{brand}</h3>
          <p>{description}</p>
          <p className="yearlevel">Year Level: {Yearlevel}</p>
        </div>
      </div>
    </div>
  );
};

export default Flipcard;
