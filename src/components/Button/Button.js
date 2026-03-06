import React, { useState, useEffect } from "react";
import { Button, Typography } from "@material-ui/core";
import { useNavigate } from "react-router-dom";

const ButtonComponent = () => {
  const [bizData, setBizData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedBiz = localStorage.getItem("selectedBiz");

    console.log("LocalStorage:", storedBiz);

    if (storedBiz) {
      const parsed = JSON.parse(storedBiz);
      setBizData(parsed);
    }
  }, []);

  const handleClick = () => {
    console.log("Button clicked");
    console.log(bizData);

    navigate("/Home");
  };

  const biz = bizData?.biz || bizData;

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      {biz && (
        <div style={{ marginTop: "20px" }}>
          <Typography variant="h5">{biz.name}</Typography>
        </div>
      )}
      <Button variant="contained" color="primary" onClick={handleClick}>
        Click me
      </Button>
    </div>
  );
};

export default ButtonComponent;
