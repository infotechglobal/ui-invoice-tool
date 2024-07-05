import React, { useState } from "react";
import { HashLoader } from "react-spinners";
import loaderStore from "../../../store/loaderStore";

const override = {
  display: "block",
  margin: "auto 6px",
  marginRight: "16px",  
  borderColor: "green",
  padding:"3px"
};

function Loader() {
  const { isLoading, message } = loaderStore(); // Assuming loaderStore returns loading and message

  const [color, setColor] = useState("black");

  return (
    <div className="sweet-loading flex p-1">
      {isLoading && (
        <>
          <HashLoader
            color={color}
            loading={true}
            cssOverride={override}
            size={20}
            aria-label="Loading Spinner"
            data-testid="loader"
            speedMultiplier={1.5}
          />
          <h3>{message}</h3>
        </>
      )}
    </div>
  );
}

export default Loader;
