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


export default function ChallengeCompleteSentence({ actividad, aumentarContador, siguientePregunta, guardarResultados, inicioPregunta }) {

    const [opcionesSeleccionadas, setOpcionesSeleccionadas] = useState([]);
    const [estadoRespuesta, setEstadoRespuesta] = useState(null); // "correcta" o "incorrecta"
    const [mostrarBotonVolver, setMostrarBotonVolver] = useState(false);
    const [maxSeleccion, setMaxSeleccion] = useState(0)

    //Manejar selecion de respuestas
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
    //VERIFICAR RESPUESTA (IMPLICA ORDENAR PARA CONFIRMAR)
    const verificarRespuesta = () => {
        //Normalizamos respuesta para aegurarnos de que sea array
        const respuesta = Array.isArray(actividad.respuesta_correcta) ? actividad.respuesta_correcta: [actividad.respuesta_correcta];

        // Normalizamos y ordenamos para comparación sin importar el orden
        const normalizar = (lista) =>lista.map((p) => p.toLowerCase().trim()).sort();

        const seleccionOrdenada = normalizar(opcionesSeleccionadas);
        const respuestaOrdenada = normalizar(respuesta);

        let esCorrecta =  "";
        if (JSON.stringify(seleccionOrdenada) === JSON.stringify(respuestaOrdenada)) {
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
        guardarResultados(actividad, opcionesSeleccionadas, esCorrecta, tiempoResolucion)


        //Mostrar botón para volver tras 3 segundos
        setTimeout(() => setMostrarBotonVolver(true), 3000);
    };



    //Adaptar respuesta segun formato (1 sola respuesta o un arreglo)
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

    //Establece maximo de respúestas
    useEffect(() => {
        const respuesta = normalizarRespuesta(actividad.respuesta_correcta);
        setMaxSeleccion(respuesta.length);
    }, [actividad]);



    //Ir a siguente actividad
    const manejarEnvio = () => {
        siguientePregunta()
    };



    return(
        <Box className="option-container">
        
            {/* Enunciado */}
            <Paper elevation={3} className="question-paper">
                <Typography variant="h6" align="center">
                {actividad.pregunta}
                </Typography>
            </Paper>

            {/* Opciones con tamaño uniforme   columns={10} ietms cambiar a 5*/}
            <Grid container columns={12} spacing={2} sx={{ width: "100%" }}>
                {actividad?.opciones?.map((opcion, index) => {
                    const cantidadOpciones = actividad.opciones.length;
                    const cantidadColumnas = cantidadOpciones === 4 ? 6 :4;

                    return (
                    <Grid item size={cantidadColumnas} key={index}>
                        <Box height="90%">
                        <Paper
                        elevation={opcionesSeleccionadas.includes(opcion) ? 6 : 1}
                        className={`option-card
                            ${opcionesSeleccionadas.includes(opcion) ? "selected" : ""}
                            ${estadoRespuesta && normalizarRespuesta(actividad.respuesta_correcta).includes(opcion) ? "correct-answer" : ""}
                            ${estadoRespuesta && opcionesSeleccionadas.includes(opcion) && !normalizarRespuesta(actividad.respuesta_correcta).includes(opcion) ? "incorrect-answer" : ""}
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
                            ? actividad.feedback_acierto
                            : actividad.feedback_fallo}
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
                <Button className="back-button" variant="contained" onClick={manejarEnvio}>
                    Siguiente
                </Button>
                </Box>
            )}
        </Box>
    );
}