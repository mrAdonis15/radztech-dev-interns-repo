import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import "./Layout.css";

const PRODUCT_FINDER_BASE = "/ProductFinder";

const ProductFinderLayout = () => (
  <>
    <Navbar basePath={PRODUCT_FINDER_BASE} />
    <main className="product-finder-main" aria-label="Main content">
      <Outlet />
    </main>
  </>
);

export default ProductFinderLayout;
