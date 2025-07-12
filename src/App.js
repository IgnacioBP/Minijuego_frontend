
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import ChatGame from "./pages/Game";
import LoadingScreen from "./pages/Loading";
import Prerequisite from "./pages/Prerequisite";
import Challenge from "./pages/Challenge";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ReturnLoading from "./pages/StartReturnLoading";

import Start from "./pages/Start";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/loading" element={<LoadingScreen />} />
        <Route path="/juego/:etapaId" element={<ChatGame />} />
        <Route path="/juego/requisito" element={<Prerequisite />} />
        <Route path="/juego/desafio" element={<Challenge />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/return" element={<ReturnLoading />} />
      </Routes>
    </Router>
  );
}


export default App;