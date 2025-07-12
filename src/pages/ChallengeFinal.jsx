import {useEffect, useState} from "react";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../styles/ChallengeFinal.css";

import Confetti from "react-confetti";
import { useWindowSize } from 'react-use'

export default function ChallengeFinal({  
  respuestasCorrectas, cantidad_preguntas, puntaje,
  puntajePregunta,  puntajeTiempo, puntajeObtenible,
  horaInicio, horaTermino, dificultadInicial,puntajeAnterior
}) {

  const navigate = useNavigate();
  const { width, height } = useWindowSize();

  useEffect(() => {
    const enviarResultados = async () => {
      const token = localStorage.getItem("token");

      try {

          //Guardar datos base de dificultad
          const info = JSON.parse(localStorage.getItem("progresoUsuario") );
          const nivelesHabilitados = JSON.parse(localStorage.getItem("nivelesHabilitados"));
          let registroFinal = {};

          nivelesHabilitados.forEach((numero) => {
            const etapaKey = `etapa_${numero}`;
            const etapaProgreso = info[etapaKey].dificultad;
            registroFinal[numero] = etapaProgreso;
          });

        //await fetch("http://localhost:8000/api/guardar-informacion-desafio/", {
        await fetch("https://mm-minigame1-f0cff7eb7d42.herokuapp.com/api/guardar-informacion-desafio/", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            puntaje_obtenido: puntaje,
            puntaje_preguntas: puntajePregunta,
            puntaje_tiempo: puntajeTiempo,
            puntaje_maximo: puntajeObtenible,
            hora_inicio: horaInicio?.toISOString(),
            hora_termino: horaTermino?.toISOString(),
            dificultades_iniciales: dificultadInicial,
            dificultades_finales: registroFinal
          }),
        });

        console.log("Datos del desafío guardados exitosamente.");
      } catch (error) {
        console.error("Error al guardar los resultados del desafío:", error);
      }
    };

    if (horaInicio && horaTermino) {
      enviarResultados();
    }
  },[horaInicio, horaTermino]);


  const irAlInicio = () => {
    navigate("/return");
  };

  return (
    <Box className="challenge-final-container">
      <Confetti width={width} height={height} recycle={false} numberOfPieces={600}/>
      <Typography variant="h3" className="challenge-title">
        ¡Terminaste!
      </Typography>

      <Box elevation={3} className="challenge-summary">
        <Typography variant="h5" gutterBottom>
          Acertaste {respuestasCorrectas} de {cantidad_preguntas} preguntas
        </Typography>
      </Box>

      <Box className="challenge-score-box">
        {typeof puntajeAnterior.puntaje_obtenido === "number" && puntajeAnterior.puntaje_obtenido < puntaje && (
          <Typography variant="h6" gutterBottom>
            🏆 NUEVO RÉCORD PERSONAL 🏆
          </Typography>
        )}

        <Typography variant="h6" gutterBottom>
          Puntaje total: {puntaje}
        </Typography>

        <Typography variant="body1">
          Preguntas: {puntajePregunta} puntos | Bono: {puntajeTiempo} puntos
        </Typography>
      </Box>

      <Box className="challenge-difficulty-box">
        <Typography variant="h6" gutterBottom>
          Cambios de dificultad por etapa
        </Typography>

        <Box style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {Object.entries(dificultadInicial).map(([etapa, dificultadIni]) => {
            const info = JSON.parse(localStorage.getItem("progresoUsuario"));
            const dificultadFin = info[`etapa_${etapa}`]?.dificultad || "N/A";

            return (
              <Box key={etapa} className="difficulty-row">
                <Typography>Etapa {etapa}</Typography>
                <Typography>
                  {dificultadIni} → {dificultadFin}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Button variant="contained" color="primary" onClick={irAlInicio}>
        Volver al inicio
      </Button>
    </Box>
  );
}