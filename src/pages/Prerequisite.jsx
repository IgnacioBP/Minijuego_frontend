import {useEffect, useState} from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
} from "@mui/material";
import {useParams, useNavigate} from "react-router-dom";
import "../styles/Prerequisite.css";

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from "@mui/icons-material/LockOpen";

export default function Prerequisite(){
  const navigate = useNavigate();

  const progreso = JSON.parse(localStorage.getItem("progresoUsuario")) || {};
  const nivelesHabilitados = JSON.parse(localStorage.getItem("nivelesHabilitados"))

  const etapa1Completada = progreso[`etapa_${nivelesHabilitados[0]}`]?.final_alcanzado === true;
  const etapa2Completada = progreso[`etapa_${nivelesHabilitados[1]}`]?.final_alcanzado === true;

  const desafioDesbloqueado = etapa1Completada && etapa2Completada;
  console.log(desafioDesbloqueado)

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
      {/* SECCION DE TITULO O Texto DE INSTRUCCION */}
      <Typography variant="h4">
        Elige que por cual chat iniciar
      </Typography>

      {/* Texto explicativo */}
      <Typography variant="h6" width="90%" textAlign="center" sx={{ mb: 2 }}>
        ¡Tu entrenamiento comienza aquí! Habla con estos expertos de la desinformación. <br />
        Cuando termines ambos chats, desbloquearás el <strong>Modo Desafío</strong> para demostrar tus habilidades.
        <br />
        Si quieres repasar el contenido del chat, solo selecionalo de nuevo aunque este en verde. 
      </Typography>


      
      {/* SECCION DE BOTONES DE CHATS */}
      <Grid container columns={10} spacing={4} sx={{width:"100%"}}>
        {[0, 1].map((i) => (
          <Grid item size={5} >
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={
                progreso[`etapa_${nivelesHabilitados[i]}`]?.final_alcanzado 
                  ? <CheckCircleIcon /> 
                  : <LockIcon />
              }
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

      {/* Texto explicativo */}
      {!desafioDesbloqueado ? (
        <Typography variant="h6" width="80%" textAlign="center" >
          Aún no has desbloqueado el <strong>Modo Desafío</strong>. Completa ambos chats para activarlo.
        </Typography>
      ) : (
        <Typography variant="h6" width="80%" textAlign="center" >
          ¡Modo Desafío desbloqueado! Responde las preguntas en el menor tiempo posible y demuestra que tú eres el maestro de la desinformación.
        </Typography>
      )}

      <Typography variant="subtitle">
        Progreso: {Number(etapa1Completada) + Number(etapa2Completada)} / 2 chats completados
      </Typography>

      {/* SECCION DE BOTON DE DESAFIO */}

      <Button
        variant="contained"
        className="challenge-button"
        onClick={() => navigate("/juego/desafio")}
        disabled={!desafioDesbloqueado}
        startIcon={desafioDesbloqueado ? <LockOpenIcon /> : <LockIcon />}
      >
        {desafioDesbloqueado
          ? "Iniciar Modo Desafío"
          : "Modo Desafío Bloqueado"}
      </Button>



    </Box>
  );
}