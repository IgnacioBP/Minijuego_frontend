
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ChatGame from "./pages/Game";
import { Box, Button, Typography } from "@mui/material";

function Home() {
  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{ backgroundColor: "#e0f7fa" }}
    >
      <Typography variant="h4" gutterBottom>
        Bienvenido al juego de Fake News
      </Typography>
      <Button
        variant="contained"
        color="primary"
        component={Link}
        to="/juego"
        sx={{ borderRadius: "20px", textTransform: "none" }}
      >
        Empezar con Aquiles Burlo
      </Button>
    </Box>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/juego" element={<ChatGame />} />
      </Routes>
    </Router>
  );
}

export default App;