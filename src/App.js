
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import ChatGame from "./pages/Game";
import LoadingScreen from "./pages/Loading";
import OptionActivity from "./pages/Activities/Options";
import CompleteSentenceActivity from "./pages/Activities/CompleteSentence";
import Prerequisite from "./pages/Prerequisite";
import Challenge from "./pages/Challenge";

function Home() {
  const navigate = useNavigate();

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
        onClick={() => {
          const datosUsuario = {
            usuarioId: 1,
          };
          localStorage.setItem("datosUsuario", JSON.stringify(datosUsuario));
          navigate("/loading");
        }}
        sx={{ borderRadius: "20px", textTransform: "none" }}
      >
        Ir al Juego
      </Button>
    </Box>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/loading" element={<LoadingScreen />} />
        <Route path="/juego/:etapaId" element={<ChatGame />} />
        <Route path="/juego/:etapaId/actividad/seleccion/:actividadId" element={<OptionActivity />} />
        <Route path="/juego/:etapaId/actividad/completar_frase/:actividadId" element={<CompleteSentenceActivity />} />
        <Route path="/juego/requisito" element={<Prerequisite />} />
        <Route path="/juego/desafio" element={<Challenge />} />
      </Routes>
    </Router>
  );
}


export default App;