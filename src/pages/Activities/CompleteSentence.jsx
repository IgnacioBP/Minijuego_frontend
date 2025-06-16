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
import "../../styles/CompleteSentence.css";
import {saveProgress} from "../../utils/saveProgress"; 



export default function CompleteSentenceActivity() {
  const {etapaId, actividadId} = useParams();
  const navigate = useNavigate();

  const [actividad, setActividad] = useState(null);
  const [opcionesSeleccionadas, setOpcionesSeleccionadas] = useState([]);
  const [estadoRespuesta, setEstadoRespuesta] = useState(null); // "correcta" o "incorrecta"
  const [mostrarBotonVolver, setMostrarBotonVolver] = useState(false);
  const [maxSeleccion, setMaxSeleccion] = useState(0)


  useEffect(() => {
    const fetchActividad = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/etapas/${etapaId}/actividades/${actividadId}/`);
        if (!response.ok) throw new Error("Error al obtener la actividad");
        const data = await response.json();
        setActividad(data);
        console.log(data)
        setMaxSeleccion(normalizarRespuesta(data.respuesta).length);

      } catch (error) {
        console.error("Error al obtener la actividad:", error);
      }
    };

    fetchActividad();
    

  }, [actividadId, etapaId]);

  //maneja la seleccion de las respuestas
  const handleSeleccion = (opcion) => {
    if (estadoRespuesta) return; // no permitir seleccionar si ya se compelto

      if (opcionesSeleccionadas.includes(opcion)) {
        // Si ya está seleccionada, la des selecionamos
        setOpcionesSeleccionadas(opcionesSeleccionadas.filter(o => o !== opcion));
      } else {
        // Si no está y no hemos alcanzado el máximo, la agregamos
        if (opcionesSeleccionadas.length < maxSeleccion) {
          setOpcionesSeleccionadas([...opcionesSeleccionadas, opcion]);
        }
      }
    };


  //Modificar para que ordene las palabras primero ANTES de confirmar si son o no
  const verificarRespuesta = () => {
    //Normalizamos respuesta para aegurarnos de quqe san array
    const respuesta = Array.isArray(actividad.respuesta) ? actividad.respuesta: [actividad.respuesta];

    // Normalizamos y ordenamos para comparación sin importar el orden
    const normalizar = (lista) =>lista.map((p) => p.toLowerCase().trim()).sort();

    const seleccionOrdenada = normalizar(opcionesSeleccionadas);
    const respuestaOrdenada = normalizar(respuesta);

    if (JSON.stringify(seleccionOrdenada) === JSON.stringify(respuestaOrdenada)) {
      setEstadoRespuesta("correcta");
    } else {
      setEstadoRespuesta("incorrecta");
    }

    //Mostrar botón para volver tras 3 segundos
    setTimeout(() => setMostrarBotonVolver(true), 3000);
  };

  //adapta la respuesta segun formato
  const normalizarRespuesta = (respuesta,) => {
    if (Array.isArray(respuesta)) return respuesta;

    if (typeof respuesta === "string") {
      try {
        // Reemplaza comillas simples por comillas dobles y convierte a JSON válido
        const jsonParseable = respuesta.replace(/'/g, '"');
        const parsed = JSON.parse(jsonParseable);
        return Array.isArray(parsed) ? parsed : [respuesta];
      } catch (e) {
        return [respuesta];
      }
    }

    return [];
  };


  const volverAEtapa = async () => {
    //Actualizar en local storage
    const etapaKey = `etapa_${etapaId}`;
    const progresoActual = JSON.parse(localStorage.getItem("progresoUsuario"));
    const etapaProgreso = progresoActual[etapaKey]
    
    const nuevoProgresoEtapa = {
      ultimo_chat_mostrado: etapaProgreso.ultimo_chat_mostrado,
      ultima_actividad_completada: actividad.orden_salida,
      final_alcanzado: false,
      dificultad: etapaProgreso.dificultad
    };

    const nuevoProgreso = {
      ...progresoActual,              
      [etapaKey]: nuevoProgresoEtapa 
    };
    
    localStorage.setItem("progresoUsuario", JSON.stringify(nuevoProgreso));

    //Actualizar en API
    const token = localStorage.getItem("token"); 
    const progress = JSON.parse(localStorage.getItem("progresoUsuario"))
    const activity = actividadId //Se lee la ultima conversacion
    const conversation = progress[`etapa_${etapaId}`].ultimo_chat_mostrado;; // Se actualiza la ultima actividad a la recien completada
    const final_alcanzado = progress[`etapa_${etapaId}`].final_alcanzado

    console.log("Actividad")
    console.log(activity)
    console.log("Conversacion")
    console.log(conversation)

    try {
      await saveProgress({
        etapaId: etapaId,
        conversacion: conversation,
        actividad: activity,
        final: final_alcanzado,
        token: token,
      });
    } catch (error) {
      console.error("Error al guardar el progreso:", error);
    }

    //Volver al chat
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
      <Grid container columns={12} spacing={2} sx={{ width: "100%" }}>
        {actividad?.contenido?.opciones?.map((opcion, index) => {
            const cantidadOpciones = actividad.contenido.opciones.length;
            const cantidadColumnas = cantidadOpciones === 4 ? 6 :4;

            return (
            <Grid item size={cantidadColumnas} key={index}>
                <Box height="90%">
                <Paper
                  elevation={opcionesSeleccionadas.includes(opcion) ? 6 : 1}
                  className={`option-card
                    ${opcionesSeleccionadas.includes(opcion) ? "selected" : ""}
                    ${estadoRespuesta && normalizarRespuesta(actividad.respuesta).includes(opcion) ? "correct-answer" : ""}
                    ${estadoRespuesta && opcionesSeleccionadas.includes(opcion) && !normalizarRespuesta(actividad.respuesta).includes(opcion) ? "incorrect-answer" : ""}
                  `}
                  onClick={() => handleSeleccion(opcion)}
                >
                  <Typography>{opcion}</Typography>
                </Paper>
                </Box>
            </Grid>
            );
        })}
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
            disabled={opcionesSeleccionadas.length !== maxSeleccion}
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