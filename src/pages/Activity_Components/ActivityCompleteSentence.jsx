import { useState } from "react";
import { Box, Paper, Typography, Button, Grid } from "@mui/material";
import "../../styles/Activity_components/ActivityBubble.css";
import {saveProgress} from "../../utils/saveProgress"; 
import {useEffect} from "react";


export default function ActivityCompleteSentence({ actividad, onResponder, disabled }) {
 
  const [opcionesSeleccionadas, setOpcionesSeleccionadas] = useState([]);
  const [respondido, setRespondido] = useState(false);
  const [maxSeleccion, setMaxSeleccion] = useState(0);

  // Si la actividad ya fue respondida, pre-cargar esa info
  useEffect(() => {
    setMaxSeleccion(normalizarRespuesta(actividad.answer).length);

    if (actividad.respuesta_usuario) {
      console.log("RESPUESTA YA RESPONDIDA")
      console.log(actividad)
      const seleccionadas = normalizarRespuesta(actividad.respuesta_usuario.seleccion);
      const esCorrecta = actividad.respuesta_usuario.es_correcta;

      setOpcionesSeleccionadas(seleccionadas);
      setRespondido(true);

      const comentario = esCorrecta
        ? actividad.correct_feedback
        : actividad.incorrect_feedback;
      
      const mostrado = true
      onResponder(mostrado, comentario);
    }
  }, [actividad]);



  const manejarSeleccion = (opcion) => {
    if (respondido || disabled) return;

    if (opcionesSeleccionadas.includes(opcion)) {
      setOpcionesSeleccionadas(opcionesSeleccionadas.filter(o => o !== opcion));
    } else if (opcionesSeleccionadas.length < maxSeleccion) {
      setOpcionesSeleccionadas([...opcionesSeleccionadas, opcion]);
    }
  };

  const normalizarRespuesta = (respuesta) => {
    if (Array.isArray(respuesta)) return respuesta;
    if (typeof respuesta === "string") {
      try {
        const jsonParseable = respuesta.replace(/'/g, '"');
        const parsed = JSON.parse(jsonParseable);
        return Array.isArray(parsed) ? parsed : [respuesta];
      } catch {
        return [respuesta];
      }
    }
    return [];
  };



  const validarRespuesta = () => {
    const seleccion = normalizarRespuesta(opcionesSeleccionadas);
    const correcta = arraysIguales(
      seleccion.map(s => s.toLowerCase().trim()).sort(),
      normalizarRespuesta(actividad.answer).map(s => s.toLowerCase().trim()).sort()
    );

    setRespondido(true);

    // GUARDAR PROGRESO
    const progresoActual = JSON.parse(localStorage.getItem("progresoUsuario")) || {};
    const etapaKey = `etapa_${actividad.stage}`;
    const etapaProgreso = progresoActual[etapaKey] || {};

    const nuevaActividad = actividad.output_order;

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
        etapaId: actividad.stage,
        conversacion: etapaProgreso.ultimo_chat_mostrado,
        actividad: nuevaActividad,
        final: etapaProgreso.final_alcanzado || false,
        token: token,
        respuesta: {
            opcion_selecionada: opcionesSeleccionadas,
            acierto: correcta
          }
      });
    }
    
    // Mostrar feedback tras un pequeño delay
    setTimeout(() => {
      const comentario = correcta
        ? actividad.correct_feedback
        : actividad.incorrect_feedback;

      const mostrado = false
      onResponder(mostrado, comentario);
    }, 300);
  };

   const arraysIguales = (a, b) => JSON.stringify(a) === JSON.stringify(b);


  return (
    <Box className="actividad-bubble-container">
      <Paper elevation={3} className="actividad-paper">
        
        <Typography variant="subtitle1" className="actividad-pregunta">
          {actividad.statement}
        </Typography>

         <Grid container columns={12} spacing={2} sx={{ width: "100%" }}>
          {actividad?.content?.opciones?.map((opcion, index) => {
            const cantidadOpciones = actividad.content.opciones.length;
            const cols = cantidadOpciones === 4 ? 6 : 4;

            return (
              <Grid item size={cols} key={index}>
                <Button
                  variant="outlined"
                  onClick={() => manejarSeleccion(opcion)}
                  disabled={respondido}
                  className={`
                    opcion-boton
                    ${opcionesSeleccionadas.includes(opcion) ? "opcion-seleccionada " : ""}
                    ${respondido && normalizarRespuesta(actividad.answer).includes(opcion) ? "opcion-correcta" : ""}
                    ${respondido && opcionesSeleccionadas.includes(opcion) && !normalizarRespuesta(actividad.answer).includes(opcion) ? "opcion-incorrecta" : ""}
                  `}
                  sx={{ height: "100px" }}
                >
                  {opcion}
                </Button>
              </Grid>
            );
          })}
        </Grid>




        {/* Botón para marcar como lista */}
        {!respondido && (
          <Box mt={2} sx={{ textAlign: "center" }}>
            <Button
              variant="contained"
              disabled={opcionesSeleccionadas.length !== maxSeleccion}
              onClick={validarRespuesta}
            >
              Marcar como lista
            </Button>
          </Box>
        )}
        
      </Paper>
    </Box>
  );
}