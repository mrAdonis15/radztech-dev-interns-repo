import React, { Fragment } from "react";
import { Outlet, Route, Routes } from "react-router";

const renderRoutes = (routes = []) =>
  routes.map((route, idx) => {
    const props = route.elementProps || {};
    const Guard = route.guard || Fragment;
    const Element = route.element || Outlet;
    const routeKey = route.path ?? (route.index ? `index-${idx}` : `route-${idx}`);

    if (route.index) {
      return (
        <Route
          key={routeKey}
          index
          element={
            <Guard>
              <Element {...props} />
            </Guard>
          }
        />
      );
    }

    return "children" in route ? (
      <Route
        path={route.path}
        key={routeKey}
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
        key={routeKey}
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