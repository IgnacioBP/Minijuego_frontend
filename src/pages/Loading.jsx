import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoadingScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProgress = async () => {
      // Simula un "delay"
      await new Promise(resolve => setTimeout(resolve, 1000));

      // En el futuro aquí iría el fetch real
      // const res = await fetch("url_de_tu_backend");
      // const progreso = await res.json();
      
      try {
        //Hacer login simulado con credenciales fijas para obtener token
        const loginRes = await fetch("http://localhost:8000/api/fake-login/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: "usuario_prueba", 
            password: "1234"
          })
        });

        if (!loginRes.ok) throw new Error("Error al obtener token");

        const tokenData = await loginRes.json();
        const token = tokenData.access;

        localStorage.setItem("token", token);

        // Simulación por ahora
        const progresoUsuario = {
          etapa_1: { ultimo_chat_mostrado: 0, ultima_actividad_completada: 0 },
          etapa_2: { ultimo_chat_mostrado: 0, ultima_actividad_completada: 0 },
          etapa_3: { ultimo_chat_mostrado: 0, ultima_actividad_completada: 0 },
          etapa_4: { ultimo_chat_mostrado: 0, ultima_actividad_completada: 0 },
          etapa_5: { ultimo_chat_mostrado: 0, ultima_actividad_completada: 0 },
          etapa_6: { ultimo_chat_mostrado: 0, ultima_actividad_completada: 0 },
          etapa_7: { ultimo_chat_mostrado: 0, ultima_actividad_completada: 0 },
        };

        localStorage.setItem("progresoUsuario", JSON.stringify(progresoUsuario));

        navigate("/juego/1");


      } catch (error) {
        console.error("Error durante carga:", error);
      }
    };

    fetchProgress();
  }, [navigate]);

  return (
    <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <h2>Cargando tu progreso...</h2>
    </div>
  );
}