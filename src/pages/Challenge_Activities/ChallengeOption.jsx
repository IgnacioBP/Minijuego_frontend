import {useEffect, useState} from "react";
import {
  Avatar,
  Box,
  Button,
  Grid,
  Typography,
  Paper,
  Fade,
} from "@mui/material";
import {useParams, useNavigate} from "react-router-dom";
import "../../styles/Options.css";


export default function ChallengeOption({ actividad, aumentarContador, siguientePregunta, guardarResultados, inicioPregunta }) {

  const [estadoRespuesta, setEstadoRespuesta] = useState(null); // "correcta" o "incorrecta"
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);
  const [mostrarBotonSiguiente, setMostrarBotonSiguiente] = useState(false);

  const verificarRespuesta = () => {
    var esCorrecta =  "";

    if (normalizarTexto(opcionSeleccionada) === normalizarTexto(actividad.respuesta_correcta)) {
      setEstadoRespuesta("correcta");
      esCorrecta = true
      aumentarContador()
    } else {
      setEstadoRespuesta("incorrecta");
      esCorrecta = false
    }

    // Calcular tiempo en segundos
    const tiempoResolucion = (new Date() - new Date(inicioPregunta)) / 1000;

    //Guardar resultados
    guardarResultados(actividad, opcionSeleccionada, esCorrecta, tiempoResolucion )

    //Mostrar botón para volver tras 3 segundos
    setTimeout(() => setMostrarBotonSiguiente(true), 3000);
  };

  const handleSeleccion = (opcion) => {
    setOpcionSeleccionada(opcion);
  };

  const manejarEnvio = () => {
    siguientePregunta()
  };

  const normalizarTexto = (texto) => {
    return texto.replace(/['"]+/g, '').trim().toLowerCase();
  };

  return (
    <Box className="option-container">
        {/* Enunciado */}
        <Paper elevation={3} className="question-paper">
            <Typography variant="h6" align="center">
            {actividad.pregunta}
            </Typography>
        </Paper>

        {/* Opciones con tamaño uniforme   columns={10} ietms cambiar a 5*/}
        <Grid container columns={10} spacing={2} sx={{width:"100%"}}>
            
            {actividad?.opciones?.map((opcion, index) => (
            <Grid item size={10} key={index}>
                <Box height="90%">
                <Paper
                    elevation={opcionSeleccionada === opcion ? 6 : 1}
                    className={`option-card
                        ${opcionSeleccionada === opcion ? "selected" : ""}
                        ${estadoRespuesta && normalizarTexto(opcion) === normalizarTexto(actividad.respuesta_correcta) ? "correct-answer" : ""}
                        ${estadoRespuesta && opcionSeleccionada === opcion && normalizarTexto(opcionSeleccionada) !== normalizarTexto(actividad.respuesta_correcta) ? "incorrect-answer" : ""}
                    `}             
                    onClick={() => !estadoRespuesta && handleSeleccion(opcion)}
                >
                    <Typography>{opcion}</Typography>
                </Paper>
                </Box>
            </Grid>
            ))}
        </Grid>
        
        {/* Botón o mensaje de resultado */}
        <Box mt={3} sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
            {estadoRespuesta ? (
            <Fade in>
                <Box className="feedback-bubble">

                    <Avatar alt="personaje" src="/avatar.png" />

                    <Paper
                        className={`feedback-text ${
                        estadoRespuesta === "correcta"
                            ? "feedback-correct"
                            : "feedback-incorrect"
                        }`}
                    >

                        <Typography variant="body1">
                        {estadoRespuesta === "correcta"
                            ? actividad.feedback_acierto
                            : actividad.feedback_fallo}
                        </Typography>
                    </Paper>

                </Box>
            </Fade>
            ) : (
            <Button
                variant="contained"
                disabled={!opcionSeleccionada}
                onClick={verificarRespuesta}
            >
                Marcar como lista
            </Button>
            )}
        </Box>

        {/* Botón de volver después del comentario */}
        {mostrarBotonSiguiente && (
            <Box mt={3} sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <Button className="back-button" variant="contained" onClick={manejarEnvio}>
                Siguiente
            </Button>
            </Box>
        )}

    </Box>
  );
}