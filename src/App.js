import React from "react";
import { ThemeProvider } from "@material-ui/core";
import defaultTheme from "./theme";
import createRouter from "./helpers/createRouter";
import routes from "./routes";
import { AuthProvider } from "./contexts/AuthContext";

const router = createRouter(routes);

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={defaultTheme}>{router}</ThemeProvider>
    </AuthProvider>
  );
}

export default App;
