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

const allMessages = [
  "En esos casos puede que estés frente a una parodia o sátira.",
  "Estas suelen crear realidades y exagerar acciones o hechos...",
  "Si está bien hecha, el lector puede llegar a creerla y compartir información falsa.",
  "Pero claro aún estás muy verde para escribir una sátira como un profesional.",
  "Primero empecemos con algo sencillo.",
];

export default function ChatGame() {
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typing, setTyping] = useState(false);
  const [dots, setDots] = useState(".");

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

  // Controlar el envío secuencial de mensajes
  useEffect(() => {
    if (currentIndex < allMessages.length) {
      setTyping(true);

      const timeout = setTimeout(() => {
        setTyping(false);
        setDisplayedMessages((prev) => [...prev, allMessages[currentIndex]]);
        setCurrentIndex((prev) => prev + 1);
      }, 1500); // Tiempo de espera entre mensajes

      return () => clearTimeout(timeout);
    }
  }, [currentIndex]);

  return (
    <Grid container className="chat-container">
      
      {/* Panel lateral */}
      <Grid item className="sidebar">
        <Box display="flex" flexDirection="column" alignItems="center">
          
          <Avatar sx={{ width: 60, height: 60, mb: 1 }} />
          
          <Typography fontWeight="bold" color="green">
            USER NAME
          </Typography>
          
          {[...Array(5)].map((_, index) => (
            <Box key={index} display="flex" alignItems="center" mt={2}>
              <Avatar src="/npc.png" sx={{ width: 24, height: 24, mr: 1 }} />
              <Typography variant="caption">
                Nivel {index + 1}/ habilidad {index + 1}
              </Typography>
            </Box>
          ))}
          
          <Box mt="auto" textAlign="center" pt={4}>
            <EmojiEventsIcon fontSize="small" />
            <Typography variant="caption">Modo desafío</Typography>
          </Box>
          
        </Box>
      </Grid>

      {/* Zona de chat */}
      <Grid item className="chat-area">

        {/* Header de chat */}
        <Box className="chat-header">
          <Avatar src="/npc.png" sx={{ width: 50, height: 50, mr: 2 }} />
          <Typography variant="h6" fontWeight="bold">
            Aquiles Burlo
          </Typography>
        </Box>

        {/* Mensajes mostrados */}
        {displayedMessages.map((msg, index) => (
          <ChatBubble key={index} text={msg} />
        ))}

        {/* Indicador de que personaje está escribiendo */}
        {typing && (
          <Typography
            variant="body2"
            sx={{ fontStyle: "italic", color: "gray", mb: 2 }}
          >
            Aquiles está escribiendo{dots}
          </Typography>
        )}

        {/* Botón del usuario */}
        {!typing && currentIndex === allMessages.length && (
          <Box mt={4} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              sx={{ borderRadius: "20px", textTransform: "none" }}
              color = "primary"
              onClick={() => alert("¡Vamos a la actividad!")}
            >
              👉 ¡Intentar actividad!
            </Button>
          </Box>
        )}
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
