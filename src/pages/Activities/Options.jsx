import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Grid,
  Typography,
  Paper,
  Fade,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/Options.css";



export default function OptionActivity() {
  const { etapaId, actividadId } = useParams();
  const navigate = useNavigate();

  const [actividad, setActividad] = useState(null);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);
  const [estadoRespuesta, setEstadoRespuesta] = useState(null); // "correcta" o "incorrecta"
  const [mostrarBotonVolver, setMostrarBotonVolver] = useState(false);

  useEffect(() => {
    const fetchActividad = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/etapas/${etapaId}/actividades/${actividadId}/`);
        if (!response.ok) throw new Error("Error al obtener la actividad");
        const data = await response.json();
        setActividad(data);
      } catch (error) {
        console.error("Error al obtener la actividad:", error);
      }
    };

    fetchActividad();
  }, [actividadId, etapaId]);

  const handleSeleccion = (opcion) => {
    setOpcionSeleccionada(opcion);
  };

  const verificarRespuesta = () => {
    if (opcionSeleccionada === actividad.respuesta) {
      setEstadoRespuesta("correcta");
    } else {
      setEstadoRespuesta("incorrecta");
    }
    // Mostrar botón para volver tras 3 segundos
    setTimeout(() => setMostrarBotonVolver(true), 3000);
  };

  const volverAEtapa = () => {
    navigate(`/juego/${etapaId}`);
  };

  if (!actividad) return <div>Cargando...</div>;

  return (
    <Box className="option-container">
      
      {/* Enunciado */}
      <Paper elevation={3} className="question-paper">
        <Typography variant="h6" align="center">
          {actividad.enunciado}
        </Typography>
      </Paper>

      {/* Opciones con tamaño uniforme   columns={10} ietms cambiar a 5*/}
      <Grid container columns={10} spacing={2} sx={{width:"100%"}}>
        
        {actividad?.contenido?.opciones?.map((opcion, index) => (
          <Grid item size={5} xs={12} sm={6} key={index}>
            <Box height="100%">
              <Paper
                elevation={opcionSeleccionada === opcion ? 6 : 1}
                className={`option-card ${opcionSeleccionada === opcion ? "selected" : ""}`}
                onClick={() => handleSeleccion(opcion)}
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
                    ? actividad.comentario_correcto
                    : actividad.comentario_incorrecto}
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
      {mostrarBotonVolver && (
        <Box mt={3} sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <Button className="back-button" variant="contained" onClick={volverAEtapa}>
            Volver a la etapa
          </Button>
        </Box>
      )}
    </Box>
  );
}