import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/registrar/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        console.log(data)
        throw new Error(data.error || "Error al registrarse");
      }

      alert("Usuario creado exitosamente. Ahora puedes iniciar sesión.");
      navigate("/"); // Redirige al login
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{ backgroundColor: "#f3f3f3" }}
    >
      <Typography variant="h4" gutterBottom>Registro</Typography>
      <TextField
        label="Usuario"
        name="username"
        value={form.username}
        onChange={handleChange}
        sx={{ mb: 2, width: "300px" }}
      />
      <TextField
        label="Contraseña"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        sx={{ mb: 2, width: "300px" }}
      />
      {error && <Typography color="error">{error}</Typography>}
      <Button variant="contained" onClick={handleRegister}>
        Registrarse
      </Button>
      <Button onClick={() => navigate("/")}>
        Ya tengo cuenta
      </Button>
    </Box>
  );
}