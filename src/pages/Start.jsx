import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";


export default function Start() {
  const navigate = useNavigate();

  return (
    <Box
      height="100vh"
      display="flex"
      marginX="auto"
      width= "80%"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"

      sx={{ backgroundColor: "#e0f7fa" }}
    >
    
    {/* Titulo de bienvenida al juego */}
      <Typography variant="h3" sx={{ mb: 10 }}>
        Bienvenido al juego de .... Fake News!!
      </Typography>
    
    {/* Texto explicativo */}
      <Typography variant="h5" width="80%" textAlign="center"   sx={{ mb: 10 }}>
            En este juego aprenderás sobre los 7 tipos de desinformación que existen. <br />
            <br />
            Pero como sabemos que es mucha información, irás conociéndolos de a poco: aprenderás dos tipos por vez. Para eso, primero chatearás con los maestros de la desinformación, y luego pondrás a prueba tu <strong>desinforma-habilidad</strong> en el modo desafío. <br />
            <br />
            ¿Podrás superar los desafíos de tus maestros?
        </Typography>

      <Button
        variant="contained"
        onClick={() => {
          navigate("/login");
        }}
        sx={{ 
          borderRadius: "20px", 
          textTransform: "none",
          fontSize: "1.5rem",
          padding: "16px 32px",
          width: "20%",
        }}
      >
        Comenzar
      </Button>
    </Box>
  );
}
