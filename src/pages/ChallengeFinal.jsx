import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function ChallengeFinal({ respuestasCorrectas, cantidad_preguntas }) {
  const navigate = useNavigate();

  const irAlInicio = () => {
    navigate("/");
  };

  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      textAlign="center"
      px={2}
    >
      <Typography variant="h4" gutterBottom>
        ¡Terminaste!
      </Typography>
      <Typography variant="h6" gutterBottom>
        Acertaste {respuestasCorrectas} de {cantidad_preguntas} preguntas.
      </Typography>
      <Button variant="contained" color="primary" onClick={irAlInicio}>
        Volver al inicio
      </Button>
    </Box>
  );
}