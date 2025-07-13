import {useEffect, useState} from "react";
import {
  Avatar,
  Box,
  Button,
  Grid,
  Typography,
  Paper,
  Fade,
  TextField
} from "@mui/material";
import {useParams, useNavigate} from "react-router-dom";
import "../../styles/Options.css";


const  temasTexto  = {
    1: "Sátira/Parodia",
    2: "Conexión Falsa",
    3: "Contenido Engañoso",
    4: "Contexto Falso",
    5: "Contenido Impostor",
    6: "Contenido Manipulado",
    7: "Contenido Fabricado"
}
    

export default function ChallengeTitle({ actividad, aumentarContador, siguientePregunta, guardarResultados, inicioPregunta,theme }) {

  const [respuestaUsuario, setRespuestaUsuario] = useState("");
  const [mostrarBotonSiguiente, setMostrarBotonSiguiente] = useState(false);
  const [analisis, setAnalisis] = useState("")
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const verificarRespuesta = (info) => {
    // Formato de actividad
    const  preguntaEvaluada = {
      pregunta: `Escribe un título para la siguiente noticia aplicando: ${temasTexto[theme]}`,
      opciones: actividad.contenido,
      respuesta_correcta: null,
      image: null
    }
    // Aumento contador de preguntas
    aumentarContador()
    // Calcular tiempo en segundos
    const tiempoResolucion = (new Date() - new Date(inicioPregunta)) / 1000;
    // Guardar resultados
    guardarResultados(preguntaEvaluada, respuestaUsuario, true, tiempoResolucion, info.puntaje)
    //Mostrar botón para volver tras 3 segundos
    setTimeout(() => setMostrarBotonSiguiente(true), 3000);
  };

  const manejarEnvio = () => {
    siguientePregunta()
  };

  const manejarRespuesta = async () => {
      setEnviando(true)
      const payload = {
        noticia: actividad.contenido,
        respuesta: respuestaUsuario,
        tema: theme
      };

      try {
        //const response = await fetch("http://localhost:8000/api/revisar_respuesta/", {
        const response = await fetch("https://mm-minigame1-f0cff7eb7d42.herokuapp.com/api/revisar_respuesta/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error("Error al enviar la respuesta");
        }

        const data = await response.json();
        console.log("Respuesta enviada correctamente:", data);

        setAnalisis(data)
        setEnviado(true)

        verificarRespuesta(data)
        
      } catch (error) {
    console.error("Error al enviar respuesta:", error);
    } finally {

    }
  };


  return (
    <Box className="option-container">
        {/* Enunciado */}
        <Paper elevation={3} className="question-paper">
            <Typography variant="h6" align="center">
            Escribe un título para la siguiente noticia aplicando: {temasTexto[theme] ?? "tema desconocido"}
            </Typography>
        </Paper>

        {/* Mostrar texto */}
        <Paper elevation={3}>
            <Typography variant="h6" align="center">
            {actividad.contenido}
            </Typography>
        </Paper>

        {/* Campo de texto */}
        <Box mt={3} display="flex" justifyContent="center">
          <TextField
            label="Escribe aquí tu respuesta"
            variant="filled"
            value={respuestaUsuario}
            onChange={(e) => setRespuestaUsuario(e.target.value)}
            disabled={enviando}
            fullWidth
            sx={{
              maxWidth: "80%",
              backgroundColor: "#f0f4ff",
              input: {
                color: "#1a237e", 
              },
              "& .MuiFilledInput-root": {
                backgroundColor: "#f0f4ff",
                "&:hover": {
                  backgroundColor: "#e3eaff",
                },
                "&.Mui-focused": {
                  backgroundColor: "#e3eaff",
                }
              },

            }}
          />
        </Box>

        {/* Boton de entregar */}
        {!enviado && (
          <Box mt={2} display="flex" justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              onClick={manejarRespuesta}
              disabled={enviando || !respuestaUsuario.trim()}
              sx={{ mt:2, textTransform: "none", borderRadius: "20px", fontSize: "1.1rem" }}
            >
              {enviando ? "Enviando..." : "Enviar respuesta"}
            </Button>
          </Box>
        )}

        {/* Mostrare feedback */}
        {analisis && (
          <Box mt={4} p={2} sx={{ backgroundColor: "#f0f4ff", borderRadius: 2 }}>            
            <Typography variant="body1" gutterBottom><strong>💪 Lo que hiciste bien:</strong> {analisis.retroalimentacion.lo_que_hiciste_bien}</Typography>
            
            <Typography variant="body1" gutterBottom><strong>🚀 Cómo mejorar:</strong> {analisis.retroalimentacion.como_mejorar_titulo}</Typography>
            
            <Typography variant="body1" gutterBottom><strong>📝 Ejemplo mejorado:</strong> {analisis.retroalimentacion.ejemplo_mejorado}</Typography>
            
            <Typography variant="body1" gutterBottom><strong>💡 Tip extra:</strong> {analisis.retroalimentacion.tip_escritura}</Typography>
          </Box>
        )}

        {/* Boton para siguiente actividad */}
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