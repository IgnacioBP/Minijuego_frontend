import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";

export default function LoadingScreen() {
  const navigate = useNavigate();
    const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProgress = async () => {
      const max_tries = 3
      let retries = 0
      let success = false

      while (retries < max_tries && !success) {
        try {
          // Simula delay
          await new Promise(resolve => setTimeout(resolve, 2000));
          const token = localStorage.getItem("token");
          //const progresoRes = await fetch("http://localhost:8000/api/obtener-progreso/", {
          const progresoRes = await fetch("https://mm-minigame1-f0cff7eb7d42.herokuapp.com/api/obtener-progreso/", {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });

          if (!progresoRes.ok) {
            throw new Error(`Intento ${retries + 1}: fallo al obtener progreso`);
          }

          const progresoUsuario = await progresoRes.json();
          localStorage.setItem("progresoUsuario", JSON.stringify(progresoUsuario));

          // Niveles habilitados (ajusta si después usas backend para esto)
          const nivelesusuario = [1, 2];
          localStorage.setItem("nivelesHabilitados", JSON.stringify(nivelesusuario));

          // Navega a la pantalla del juego
          navigate("/juego/requisito");
          success = true;
        } catch (error) {
          console.error("Error al cargar progreso:", error);
          retries += 1;

          if (retries === max_tries) {
            setError(true); 
            setTimeout(() => {
              navigate("/");
            }, 5000);
          }
        }
      }
    };

    fetchProgress();
    
  }, [navigate]);

   return (
       <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      {!error ? (
        <>
          <CircularProgress />
          <h2 style={{ marginTop: "1rem" }}>Cargando tu progreso...</h2>
        </>
      ) : (
        <>
          <h2 style={{ color: "red" }}>Error al cargar tu progreso.</h2>
          <p>Serás redirigido al inicio en unos segundos...</p>
        </>
      )}
    </div>
  );
}