import React from "react";
import { ThemeProvider } from "@material-ui/core";
import defaultTheme from "./theme";
import createRouter from "./helpers/createRouter";
import routes from "./routes";

const router = createRouter(routes);

function App() {
  return <ThemeProvider theme={defaultTheme}>{router}</ThemeProvider>;
}

export default App;
