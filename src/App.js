import React from "react";
import { ThemeProvider, useTheme } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import defaultTheme from "./theme";
import createRouter from "./helpers/createRouter";
import routes from "./routes";
import { AuthProvider } from "./contexts/AuthContext";

const router = createRouter(routes);

function AppRoot({ children }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
        minHeight: "100vh",
      }}
    >
      {children}
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={defaultTheme}>
        <AppRoot>{router}</AppRoot>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
