import React, { Fragment } from "react";
import { Outlet, Route, Routes } from "react-router";

const renderRoutes = (routes = []) =>
  routes.map((route) => {
    const props = route.elementProps || {};

    const Guard = route.guard || Fragment;
    const Element = route.element || Outlet;

    return "children" in route ? (
      <Route
        path={route.path}
        key={route.path}
        element={
          <Guard>
            <Element {...props} />
          </Guard>
        }
      >
        {renderRoutes(route.children)}
      </Route>
    ) : (
      <Route
        path={route.path}
        key={route.path}
        element={
          <Guard>
            <Element {...props} />
          </Guard>
        }
      />
    );
  });

const createRouter = (routes = []) => <Routes>{renderRoutes(routes)}</Routes>;

export default createRouter;
