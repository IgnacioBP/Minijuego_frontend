import {useEffect, useState} from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
} from "@mui/material";
import {useParams, useNavigate} from "react-router-dom";
import "../styles/Prerequisite.css";


export default function Prerequisite(){
  const navigate = useNavigate();

  const progreso = JSON.parse(localStorage.getItem("progresoUsuario")) || {};
  const nivelesHabilitados = JSON.parse(localStorage.getItem("nivelesHabilitados"))

  const etapa1Completada = progreso[`etapa_${nivelesHabilitados[0]}`]?.final_alcanzado === true;
  const etapa2Completada = progreso[`etapa_${nivelesHabilitados[1]}`]?.final_alcanzado === true;

  const desafioDesbloqueado = etapa1Completada && etapa2Completada;

  const levelLabels = {
    1:"Aquiles Burlo (Parodia)",
    2:"Clara Clickbait (Conexión falsa)",
    3:"Verónica Sesgada (Contenido engañoso)",
    4:"Pancho Descontexto (Contexto falso)",
    5:"Simón Suplente (Contenido impostor)",
    6:"Camila Montaje (Contenido Manipulado)",
    7:"Fabricio Invento (Contenido fabricado)"
  }


  return (
    <Box className="buttons-container">
      {/* SECCION DE TITULO O TEXOT DE INSTRUCCION */}
      <Typography variant="h4">Elige que hacer</Typography>
      
      {/* SECCION DE BOTONES DE CHATS */}
      <Grid container columns={10} spacing={4} sx={{width:"100%"}}>
        {[0, 1].map((i) => (
          <Grid item size={5} >
            <Button
              fullWidth
              variant="contained"
              color="primary"
              className= {`chat-button ${progreso[`etapa_${nivelesHabilitados[i]}`]?.final_alcanzado ? "complete" : "incomplete"}`}
              onClick={() => navigate(`/juego/${nivelesHabilitados[i]}`)}
            >
              <Typography>
                Ir a chat con: {levelLabels[nivelesHabilitados[i]]}
              </Typography>
            </Button>
          </Grid>
        ))}
      </Grid>

      {/* SECCION DE BOTON DE DESAFIO */}

        <Button
          variant="outlined"
          color="secondary"
          className="challenge-button"
          onClick={() => navigate("/juego/desafio")}
          disabled={!desafioDesbloqueado}
        >
          {desafioDesbloqueado ? "Iniciar Modo Desafío" : "Modo Desafío Bloqueado 🔒"}
        </Button>



    </Box>
  );
}