import { useState } from "react";
import { Box, Paper, Typography, Button } from "@mui/material";
import "../../styles/Activity_components/ActivityBubble.css";
import {saveProgress} from "../../utils/saveProgress"; 
import {useEffect} from "react";


export default function ActivityOptions({ actividad, onResponder, disabled }) {
  const [seleccion, setSeleccion] = useState(null);
  const [respondido, setRespondido] = useState(false);

  // Si la actividad ya fue respondida, pre-cargar esa info
  useEffect(() => {
    if (actividad.respuesta_usuario) {


      const correcta = actividad.respuesta_usuario.es_correcta;

      setSeleccion(actividad.respuesta_usuario.seleccion);
      setRespondido(true);
      
      const comentario = correcta
      ? actividad.comentario_correcto
      : actividad.comentario_incorrecto;
      
      const mostrado = true;
      onResponder(mostrado, comentario); 
    }
  }, [actividad]);



  const manejarSeleccion = (opcion) => {
    setSeleccion(opcion);
  };



  const validarRespuesta = () => {
    setRespondido(true);
    const correcta = seleccion === actividad.respuesta;

    // GUARDAR PROGRESO
    const progresoActual = JSON.parse(localStorage.getItem("progresoUsuario")) || {};
    const etapaKey = `etapa_${actividad.etapa}`;
    const etapaProgreso = progresoActual[etapaKey] || {};

    const nuevaActividad = actividad.orden_salida;

    const nuevoProgresoEtapa = {
      ...etapaProgreso,
      ultima_actividad_completada: nuevaActividad,
    };

    const nuevoProgreso = {
      ...progresoActual,
      [etapaKey]: nuevoProgresoEtapa,
    };

    localStorage.setItem("progresoUsuario", JSON.stringify(nuevoProgreso));

    // Guardar en backend
    const token = localStorage.getItem("token");
    if (token) {
      saveProgress({
        etapaId: actividad.etapa,
        conversacion: etapaProgreso.ultimo_chat_mostrado,
        actividad: nuevaActividad,
        final: etapaProgreso.final_alcanzado || false,
        token: token,
        respuesta: {
            opcion_selecionada: seleccion,
            acierto: correcta
          }
      });
    }
    
    // Mostrar feedback tras un pequeño delay
    setTimeout(() => {
      const comentario = correcta
        ? actividad.comentario_correcto
        : actividad.comentario_incorrecto;
      const mostrado = false
      onResponder(mostrado, comentario);
    }, 300);
  };

  return (
    <Box className="actividad-bubble-container">
      <Paper elevation={3} className="actividad-paper">
        
        <Typography variant="subtitle1" className="actividad-pregunta">
          {actividad.enunciado}
        </Typography>

        {actividad.contenido.opciones.map((opcion, idx) => {
          let clase = "opcion-boton";

          if (respondido) {
            if (opcion === actividad.respuesta) {
              clase += " opcion-correcta";
            } else if (seleccion === opcion) {
              clase += " opcion-incorrecta";
            }
          } else if (seleccion === opcion) {
            clase += " opcion-seleccionada";
          }

          return (
            <Button
              key={idx}
              className={clase}
              onClick={() => manejarSeleccion(opcion)}
              disabled={disabled || respondido}
            >
              {opcion}
            </Button>
          );
        })}

        {/* Botón para marcar como lista */}
        {!respondido && (
          <Box className="boton-entrega-box">
            <Button
              variant="contained"
              onClick={validarRespuesta}
              disabled={!seleccion}
              className="boton-entrega"
            >
              Marcar como lista
            </Button>
          </Box>
        )}


      </Paper>
    </Box>
  );
}