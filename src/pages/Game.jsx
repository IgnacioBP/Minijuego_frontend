import "../styles/Game.css";

import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Grid,
  Typography,
  Paper,
} from "@mui/material";

import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

const personajes = {
  1: { nombre: "Aquiles Burlo", avatar: "/npc1.png" },
  2: { nombre: "Clara Clickbait", avatar: "/npc2.png" },
};



const levelLabels = [
  "Aquiles Burlo (Parodia)",
  "Clara Clickbait (Conexión falsa)",
  "Verónica Sesgada (Contenido engañoso)",
  "Pancho Descontexto (Contexto falso)",
  "Simón Suplente (Contenido impostor)",
  "Camila Montaje (Contenido Manipulado)",
  "Fabricio Invento (Contenido fabricado)"
]


export default function ChatGame() {
  
  const navigate = useNavigate();
  
  // Para los mensajes
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typing, setTyping] = useState(false);
  const [dots, setDots] = useState(".");

  // Para manejar progreso 
  const [progreso, setProgreso] = useState(null);

  // Para scroll
  const bottomRef = useRef(null);

  // Numero de etapa
  const { etapaId } = useParams();

  //Personaje del nivel
  const personaje = personajes[etapaId] || { nombre: "Personaje desconocido", avatar: "/default.png" };

  //Mensajes de los chats
  const [allMessages, setAllMessages] = useState([]);
  
  // Obtener mensajes
  useEffect(() => {
    const fetchMensajes = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/etapas/1/conversaciones/`);
        if (!response.ok) {
          throw new Error("Error al obtener mensajes");
        }
        const data = await response.json();
    
        // Imprimir pra ver que se recibe
        console.log("Datos recibidos del backend:", data);
    
        setAllMessages(data);
        setDisplayedMessages([]);
        setCurrentIndex(0);
      } catch (error) {
        console.error("Error al obtener mensajes:", error);
      }
    };
  
    fetchMensajes();
  }, [etapaId]);


  // Animar puntos suspensivos
  useEffect(() => {
    let interval;
    if (typing) {
      interval = setInterval(() => {
        setDots((prev) => (prev.length < 3 ? prev + "." : "."));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [typing]);



  // Controlar el envío secuencial de mensajes (AQUI ESTA EL TIMEPO ENTRE MENSAJES)
  useEffect(() => {
    if (!progreso || currentIndex >= allMessages.length) return;

      const currentItem = allMessages[currentIndex];
      const etapaKey = `etapa_${etapaId}`;
      const actividadLimite = progreso[etapaKey]?.ultima_actividad_completada ?? 0;

      if (currentItem.tipo_general === "actividad" && currentItem.orden_salida > actividadLimite) {
        setDisplayedMessages((prev) => [...prev, currentItem]);
        return;
      }

      setTyping(true);

      const timeout = setTimeout(() => {
        setTyping(false);
        setDisplayedMessages((prev) => [...prev, allMessages[currentIndex]]);
        setCurrentIndex((prev) => prev + 1);
      }, 1500); // Tiempo de espera entre mensajes

      return () => clearTimeout(timeout);
    
  },[currentIndex, allMessages, progreso]);

  //Hook para el scroll automatico
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [displayedMessages]);

  //hook para progreso usuario  
  useEffect(() => {
    const progresoGuardado = localStorage.getItem("progresoUsuario");
    if (progresoGuardado) {
      setProgreso(JSON.parse(progresoGuardado));
    }
  }, []);



  return (
    <Grid container className="chat-container">
      
      {/* Panel lateral */}
      <Grid item className="sidebar">
        <Box display="flex" flexDirection="column" height="100%">
        
          {/* Avatar + nombre */}
          <Box className="sidebar-avatar-box">
            <Avatar className="sidebar-avatar" />
            <Typography className="sidebar-username">USER NAME</Typography>
          </Box>

          {/* Niveles */}
          <Box className="sidebar-level-box">
            {levelLabels.map((label, index) => (
              <Box 
                key={index} 
                className="sidebar-level-item"
                onClick={() => navigate(`/juego/${index + 1}`)}  // redirige al nivel/chat de otro personaje
                sx={{ cursor: "pointer" }}
              >
                <Avatar src="/npc.png" sx={{ width: 45, height: 45, mr: 1 }} />
                <Typography className="sidebar-level-text">
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Botton desafío */}
          <Box mt="auto" className="sidebar-challenge-box" pt={4}>
            <EmojiEventsIcon className="sidebar-challenge-icon" />
            <Typography  className="sidebar-challenge-text">
              Modo desafío
            </Typography>
          </Box>

        </Box>
      </Grid>

      {/* Zona de chat */}
      <Grid item className="chat-area">

        {/* Header de chat */}
        <Box className="chat-header">
          <Avatar src="/npc.png" sx={{ width: 50, height: 50, mr: 2 }} />
          <Typography variant="h6" fontWeight="bold">
            {personaje.nombre}
          </Typography>
        </Box>

        {/* Zona de los mensajes mostrados */}
        <div className="chat-messages">
          {/* Mensajes mostrados */}
          {displayedMessages.map((item, index) => (
            item.tipo_general === "mensaje" ? (
              <ChatBubble 
                key={index} 
                text={item.contenido} 
              />
            ) : (
              <ActividadBubble 
                key={index}
                disabled={
                  progreso &&
                  item.orden_salida  <= progreso[`etapa_${etapaId}`]?.ultima_actividad_completada
                }  
                //onClick={() => handleIrActividad(item.id)}
                onClick={() => alert("¡Vamos a la actividad!")}
              />
            )
          ))}

          {/* Indicador de que personaje está escribiendo */}
          {typing && (
            <Typography
              variant="body2"
              sx={{ fontStyle: "italic", color: "gray", mb: 2 }}
            >
              {personaje.nombre} está escribiendo{dots}
            </Typography>
          )}

          {/* Botón del usuario
          {!typing && currentIndex === allMessages.length && (
            <Box mt={4} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                className="activity-bubble-button"
                onClick={() => alert("¡Vamos a la actividad!")}
              >
                👉 ¡Intentar actividad!
              </Button>
            </Box>
          )} */}

          <div ref={bottomRef} />
        </div>
      </Grid>
    </Grid>
  );
}




function ChatBubble({ text }) {
  return (
    <Paper className="chat-bubble">
      <Typography variant="body2">{text}</Typography>
    </Paper>
  );
}


function ActividadBubble({ onClick, disabled }) {
  return (
    <Box mt={4} display="flex" justifyContent="flex-end">
      <Button 
        variant="contained" 
        onClick={onClick} 
        disabled={disabled}
        className="activity-bubble-button"
      >
        {disabled ? "Actividad completada" : "👉 Ir a la actividad"}
      </Button>
     </Box> 
  );
}
