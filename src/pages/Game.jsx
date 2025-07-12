import "../styles/Game.css";
import {saveProgress} from "../utils/saveProgress"; 

import {useEffect, useState, Fragment} from "react";
import {
  Avatar,
  Box,
  Button,
  Grid,
  Typography,
  Paper,
  TextField,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import {useParams} from "react-router-dom";
import {useNavigate} from "react-router-dom";
import {useRef} from "react";


import ActivityBubble from "./Activity_Components/ActivityBubble";
import ActivityCompleteSentence from "./Activity_Components/ActivityCompleteSentence";
import ActivityOptions from "./Activity_Components/ActivityOptions";

function playSound() {
  try {
    const audio = new Audio('/text_appear_sound.mp3');
    audio.play().catch(error => {
      console.warn('Error al reproducir audio:', error);
    });
  } catch (error) {
    console.error('Error al crear el audio:', error);
  }
}

const personajes = {
  1: {nombre: "Aquiles Burlo", avatar: "/avatars/npc1.jpg"},
  2: {nombre: "Clara Clickbait", avatar: "/avatars/npc2.jpg"},
  3: {nombre: "Verónica Sesgada", avatar: "/avatars/npc3.jpg"},
  4: {nombre: "Pancho Descontexto", avatar: "/npc4.png"},
  5: {nombre: "Simón Suplente", avatar: "/npc5.png"},
  6: {nombre: "Camila Montaje", avatar: "/npc6.png"},
  7: {nombre: "Fabricio Invento", avatar: "/npc7.png"},
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
  const {etapaId} = useParams();

  //Personaje del nivel
  const personaje = personajes[etapaId] || { nombre: "Personaje desconocido", avatar: "/default.png" };

  //Mensajes de los chats
  const [allMessages, setAllMessages] = useState([]);
  
  //Niveles habilitados
  const nivelesHabilitados = localStorage.getItem("nivelesHabilitados");
  
  //Para manejar boton de retorno a desafio
  const [complete, setComplete] = useState(false);
  const [otherComplete, setOtherComplete] = useState(false);
  const [otherID, setOtherID] = useState(null);

  //Para chat de usuario
  const [esperandoComentario, setEsperandoComentario] = useState(false);
  const [comentarioUsuario, setComentarioUsuario] = useState("");

  // Obtener mensajes
  useEffect(() => {
    const fetchMensajes = async () => {
      const token = localStorage.getItem("token");
      try {
        //const response = await fetch(`http://localhost:8000/api/etapas/${etapaId}/conversaciones/`, {
        const response = await fetch(`https://mm-minigame1-f0cff7eb7d42.herokuapp.com/api/etapas/${etapaId}/conversaciones/`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Error al obtener mensajes");
        }
        const data = await response.json();
    
        // Imprimir pra ver que se recibe
        console.log("Datos recibidos del backend:", data);
        setAllMessages(data);


        // Para lo de cargar de inmediato los mensajes y actividades ya hechas 
        const progresoGuardado = localStorage.getItem("progresoUsuario");
        if (progresoGuardado) {
          const progresoObj = JSON.parse(progresoGuardado);
          const etapaKey = `etapa_${etapaId}`;
          const etapaProgreso = progresoObj[etapaKey] || {};

          setComplete(etapaProgreso.final_alcanzado);
          if (etapaProgreso.final_alcanzado) {
            setTyping(false);
          }

          const mensajesYaMostrados = [];
          let siguienteIndice = 0;

          data.forEach((item,index) => {
            if (item.tipo_general === "mensaje") {
              if (item.orden_salida <= (etapaProgreso.ultimo_chat_mostrado || 0)) {
                mensajesYaMostrados.push(item);
                siguienteIndice = index + 1;

                if (item.antes_comentario && item.contenido_comentario) {
                  console.log("ENTRO AQUI")
                  mensajesYaMostrados.push({
                    tipo_general: "mensaje",
                    contenido: item.contenido_comentario,
                    orden_salida: item.orden_salida + 0.1,
                    autor: "usuario", // ESTO ES IMPORTANTE
                  });
                }
              }

              
            } else if (item.tipo_general === "actividad") {
              if (item.orden_salida <= (etapaProgreso.ultima_actividad_completada || 0)) {
                mensajesYaMostrados.push(item);
                siguienteIndice = index + 1;

                // Si tiene una respuesta pasada, agregar el comentario como nuevo mensaje
                if (item.respuesta_usuario) {
                  // console.log("respuesta obtenida "+item.respuesta_usuario.es_correcta)
                  const comentario = item.respuesta_usuario.es_correcta
                    ? item.comentario_correcto
                    : item.comentario_incorrecto;

                  mensajesYaMostrados.push({
                    tipo_general: "mensaje",
                    contenido: comentario,
                    orden_salida: item.orden_salida + 0.5,
                  });
                }
              }
            }
          });
          console.log("DATA A RENDERIZAR")
          console.log(mensajesYaMostrados)
          setDisplayedMessages(mensajesYaMostrados);
          setCurrentIndex(siguienteIndice);
        }
        
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
        setTyping(false)
        playSound();
        return;
      }

      console.log(currentItem)

      if (currentItem.antes_comentario) {
        if (currentItem.comentario) {
          const comentarioPrevio = {
            tipo_general: "mensaje",
            contenido: currentItem.contenido_comentario,
            orden_salida: currentItem.orden_salida + 0.1,
            autor: "usuario",
          };
          setDisplayedMessages((prev) => [...prev, currentItem, comentarioPrevio]);
          setCurrentIndex((prev) => prev + 1); // avanzar automáticamente
        } else {
          setDisplayedMessages((prev) => [...prev, currentItem]);
          setEsperandoComentario(true);
          setTyping(false);
        }
        return;
      }

      setTyping(true);

      let tiempoEspera = 3000;
      if (currentItem.tipo_general === "mensaje" && currentItem.contenido) {
        const numCaracteres = currentItem.contenido.length;
        tiempoEspera = Math.min(Math.max(300 + numCaracteres * 50, 2000), 6000);
      }

      const timeout = setTimeout(() => {
        // // Mostrar escribiendo
        playSound();
        // setTyping(true);
        // Actualizar lista de mensjaes mostrados
        setDisplayedMessages((prev) => [...prev, currentItem]);
        
        if (currentItem.tipo_general === "mensaje"){
          // Guardar progrso del chat
          const progresoActual = JSON.parse(localStorage.getItem("progresoUsuario"));
          const etapaProgreso = progresoActual[etapaKey]
          const maximo_ultimo = Math.max(etapaProgreso.ultimo_chat_mostrado, currentItem.orden_salida );

          const nuevoProgresoEtapa = {
            ultimo_chat_mostrado: maximo_ultimo,
            ultima_actividad_completada: etapaProgreso.ultima_actividad_completada,
            final_alcanzado: currentItem.final,
            dificultad: etapaProgreso.dificultad
          };

          const nuevoProgreso = {
            ...progresoActual,              
            [etapaKey]: nuevoProgresoEtapa 
          };
          
          localStorage.setItem("progresoUsuario", JSON.stringify(nuevoProgreso));

          if (currentItem.final){
            const token = localStorage.getItem("token");
            setComplete(currentItem.final)
            saveProgress({
              etapaId,
              conversacion: currentItem.orden_salida,
              actividad: etapaProgreso.ultima_actividad_completada,
              final: currentItem.final,
              token: token,
            });
            setTyping(false);
            return;
          }
        }
        setCurrentIndex((prev) => prev + 1);
        setTyping(false);

      }, tiempoEspera); // Tiempo de espera entre mensajes

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
      const pG = JSON.parse(progresoGuardado);
      const etapaKey = `etapa_${etapaId}`;
      const etapaProgreso = pG[etapaKey]
      setComplete(etapaProgreso.final_alcanzado)
      if(etapaProgreso.final_alcanzado) {
        setTyping(false);
      }
    }
  }, [etapaId]);

  useEffect(() => {
    setOtherComplete(false);
    setOtherID(null);

    let parsedNiveles = [];

    try {
      const stored = localStorage.getItem("nivelesHabilitados");
      if (stored) {
        parsedNiveles = JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error al parsear nivelesHabilitados:", e);
    }


    if (Array.isArray(parsedNiveles) && etapaId) {
      const etapaIdNum = parseInt(etapaId, 10);
      const otraEtapaId = parsedNiveles.find(id => id !== etapaIdNum);

      if (otraEtapaId !== undefined) {
        const progresoGuardado = localStorage.getItem("progresoUsuario");
        
        const pG = JSON.parse(progresoGuardado);
        const etapaKey = `etapa_${otraEtapaId}`;
        const progresoOtraEtapa = pG[etapaKey];

        if (progresoOtraEtapa) {
          setOtherComplete(progresoOtraEtapa.final_alcanzado);
          setOtherID(otraEtapaId);
        }
      }
    }
  }, [nivelesHabilitados,etapaId]);



 //Para comentarios usuario
  const handleComentarioEnviar = async () => {
    const comentario = comentarioUsuario.trim();
    if (!comentario) return;

    setEsperandoComentario(false);
    setComentarioUsuario(""); // limpia input
    setTyping(true);

    try {
      //const response = await fetch("http://localhost:8000/api/guardar-comentario/", {
      const response = await fetch("https://mm-minigame1-f0cff7eb7d42.herokuapp.com/api/guardar-comentario/", {  
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          etapa_id: etapaId,
          comentario: comentario
        })
      });

      if (!response.ok) {
        throw new Error("Error al guardar comentario");
      }

      // Si se guardó correctamente, agrega la burbuja del usuario
      const comentarioBubble = {
        tipo_general: "mensaje",
        contenido: comentario,
        orden_salida: allMessages[currentIndex]?.orden_salida + 0.1 || 0,
        autor: "usuario"
      };

      setDisplayedMessages((prev) => [...prev, comentarioBubble]);

      // Simula que el personaje escribe después del comentario
      setCurrentIndex((prev) => prev + 1); // avanza al siguiente mensaje
    } catch (error) {

      console.error("No se pudo guardar el comentario:", error);
      setTyping(false);
    }
  };


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
            {levelLabels.map((label, index) => {
            const nivelId = index + 1;
            const habilitado = nivelesHabilitados.includes(nivelId);

            return (
              <Box 
                key={nivelId}
                className={`sidebar-level-item ${habilitado ? "" : "sidebar-disabled"}`}
                onClick={habilitado ? () => navigate(`/juego/${nivelId}`) : null}

              >
                <Avatar src={personajes[nivelId]?.avatar || "/npc.png"} className="sidebar-level-avatar"  />
                
                <Box>
                  <Typography className="sidebar-level-text">{label}</Typography>

                  <Typography 
                    variant="caption" 
                    className={`sidebar-level-status ${habilitado ? "green" : "red"}`}
                  >
                    ● {habilitado ? "En línea" : "Desconectado"}
                  </Typography>
                </Box>
              </Box>
            );
          })}
          </Box>

          {/* Botton desafío */}
          <Box 
            mt="auto" 
            className="sidebar-challenge-box" 
            pt={4}
            onClick={() => navigate("/juego/requisito")}
          >
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
          <Avatar src={personajes[etapaId]?.avatar || "/npc.png"} sx={{ width: 50, height: 50, mr: 2 }} />
          <Typography variant="h6" fontWeight="bold">
            {personaje.nombre}
          </Typography>
        </Box>

        {/* Zona de los mensajes mostrados */}
        <div className="chat-messages">
          {/* Mensajes mostrados */}
          
          {displayedMessages.map((item, index) => {
          // if (item.tipo_general === "mensaje") {
          //   return <ChatBubble key={index} text={item.contenido} />;
          // }

         if (item.tipo_general === "mensaje") {
          return (
            <ChatBubble 
              key={index}
              text={item.contenido} 
              autor={item.autor || "npc"} 
            />
          );
        }


          // Si es actividad
          const actividadCompletada = 
            progreso &&
            item.orden_salida <= progreso[`etapa_${etapaId}`]?.ultima_actividad_completada;

            const commonProps = {
              key: index,
              actividad: item,
              disabled: actividadCompletada,
              onResponder: (mostrado, comentario) => {
                const comentarioBubble = {
                  tipo_general: "mensaje",
                  contenido: comentario,
                  orden_salida: item.orden_salida + 0.5,
                };
                
                if (mostrado !== true){

                  //Calcular tiempor correspondiente al comentario 
                  const numCaracteres = comentario.length;
                  const tiempoEspera = Math.min(Math.max(300 + numCaracteres * 50, 2000), 6000);

                  setTyping(true);

                  setTimeout(() => {
                    playSound();
                    setDisplayedMessages((prev) => [...prev, comentarioBubble]);
                    setTyping(false);

                    // Avanzar al siguiente mensaje
                    setTimeout(() => {
                      setCurrentIndex((prev) => prev + 1);
                    }, 1000); 
                  }, tiempoEspera);

                }
                  
              },
            };
            
            switch (item.tipo) {
              case "seleccion_multiple":
                return <ActivityOptions {...commonProps} />;
              case "completar_frase":
                return <ActivityCompleteSentence {...commonProps} />;
              default:
                console.log("ERROR:tipo de render no identificado")
                return <ActivityBubble {...commonProps} />; 
            }
          })}
          
          
          {(complete || otherComplete) && complete && (
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "2rem" }}>
              {/* Botón para ir al otro chat */}
              {!otherComplete && (
                <Button
                  variant="contained"
                  onClick={() => navigate(`/juego/${otherID}`)}
                  sx={{ 
                    textTransform: "none", 
                    borderRadius: "20px",
                    fontSize: "1.1rem",
                  }}
                >
                  Ir al chat con {personajes[otherID].nombre}
                </Button>
              )}
              
              {/* Botón para ir al desafío (amarillo) */}
              {otherComplete && (
                <Button
                  variant="contained"
                  onClick={() => navigate("/juego/desafio")}
                  sx={{ 
                    textTransform: "none", 
                    borderRadius: "20px",
                    fontSize: "1.1rem",
                    backgroundColor: "#FFC107", // Naranjo
                    color: "#000", // Texto negro para mejor contraste
                    "&:hover": {
                      backgroundColor: "#FFB300", // Naranjo más oscuro al hover
                    }
                  }}
                >
                  Iniciar desafío
                </Button>
              )}
            </div>
          )}

          {/* Indicador de que personaje está escribiendo */}
          {typing && (
            <Typography
              variant="body2"
              sx={{ fontStyle: "italic", color: "black", mb: 2 }}
            >
              {personaje.nombre} está escribiendo{dots}
            </Typography>
          )}
          <div ref={bottomRef} />
        </div>

          {/*Indicacion de escribir para responder al personaje */}
          {esperandoComentario && (
            <Typography
              variant="subtitle2"
              sx={{
                color: "#555",
                textAlign: "center",
                mb: 1,
                fontStyle: "italic",
              }}
            >
              Escribe tu opinión para continuar...
            </Typography>
          )}


        {/* Zona para escribir texto */}
        <Box 
          mt={2} 
          display="flex" 
          alignItems="center" 
          justifyContent="center" 
          gap={2} 
          sx={{ width: "100%", padding: "1rem" }}
        >
          <TextField
            label="Escribe tu opinión..."
            variant="outlined"
            value={comentarioUsuario}
            onChange={(e) => setComentarioUsuario(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (esperandoComentario && comentarioUsuario.trim()) {
                  handleComentarioEnviar();
                }
              }
            }}
            rows={2}
            fullWidth
            disabled={!esperandoComentario}
            sx={{
              maxWidth: "80%",
              backgroundColor: esperandoComentario ? "#fff" : "#eee",
            }}
          />

          <Button
            variant="contained"
            onClick={handleComentarioEnviar}
            disabled={!esperandoComentario || !comentarioUsuario.trim()}
            sx={{ height: "fit-content" }}
          >
            Enviar
          </Button>
        </Box>


      </Grid>
    </Grid>
  );
}



function ChatBubble({ text, autor = "npc" }) {
  const esUsuario = autor === "usuario";

  return (
    <Paper
      className= {esUsuario ? "user-bubble" : "chat-bubble"}
      sx={{
        backgroundColor: esUsuario ? "#fc913a" : "#f5f5f5",
        alignSelf: esUsuario ? "flex-end" : "flex-start",
        maxWidth: "80%",
        padding: "0.8rem",
        marginBottom: "0.5rem",
      }}
    >
      <Typography variant="body2">{text}</Typography>
    </Paper>
  );
}