import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoadingScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProgress = async () => {
      // Simula un "delay"
      await new Promise(resolve => setTimeout(resolve, 1000));

      
      try {
        //Recuperar progrso de usaurio
        const token = localStorage.getItem("token")

        const progresoRes = await fetch("http://localhost:8000/api/obtener-progreso/", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!progresoRes.ok) throw new Error("Error al obtener progreso del usuario");

        const progresoUsuario = await progresoRes.json();

        localStorage.setItem("progresoUsuario", JSON.stringify(progresoUsuario));


        //Niveles habilitados
        const nivelesusuario = [1,3]
        localStorage.setItem("nivelesHabilitados", JSON.stringify(nivelesusuario))
        console.log(nivelesusuario)
 
        navigate("/juego/requisito");


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