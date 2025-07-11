import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography } from "@mui/material";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      //const response = await fetch("http://localhost:8000/api/login/", {
      const response = await fetch("https://mm-minigame1-f0cff7eb7d42.herokuapp.com/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) throw new Error("Credenciales inválidas");

      const data = await response.json();
      localStorage.setItem("token", data.access);
      console.log(data.access)

      navigate("/loading"); 
    } catch (error) {
      alert("Error al iniciar sesión: " + error.message);
    }
  };

  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{ backgroundColor: "#e9e0e0" }}
    >
      <Typography variant="h4" gutterBottom>
        Iniciar sesión
      </Typography>
      <TextField
        label="Nombre de usuario"
        variant="outlined"
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <TextField
        label="Contraseña"
        type="password"
        variant="outlined"
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleLogin}
        sx={{ mt: 2 }}
      >
        Entrar
      </Button>

       <Button
        variant="outlined"
        color="secondary"
        onClick={() => navigate("/register")}
        >
            Registrarse
       </Button>

    </Box>
  );
}