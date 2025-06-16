
import {useEffect, useState} from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
} from "@mui/material";
import {useParams, useNavigate} from "react-router-dom";
import "../styles/Challenge.css";
import ChallengeOption from "./Challenge_Activities/ChallengeOption";
import ChallengeCompleteSentence from "./Challenge_Activities/ChallengeCompleteSentence";
import ChallengeFinal from "./ChallengeFinal";


export default function Challenge() {

  //Obtener niveles habilitados
  const nivelesHabilitados = JSON.parse(localStorage.getItem("nivelesHabilitados"));
  
  //Setear datos de pregunta que se va a mostrar en el momento (La idea es obtener estos datos desde el endpoint de django)
  const cantidad_preguntas= 3
  const [numeroPregunta, setNumeroPregunta] = useState(1);
  const [pregunta,setPregunta] = useState("")

  //Conteo de respuestas correctas
  const [respuestasCorrectas, setRespuestasCorrectas] = useState(0);


  //Metodo de sumar mas a la cantidad de respeustas correctas
  const aumentarContador = () => {
    setRespuestasCorrectas(prev => prev + 1);
  };

 
  //Funcion para hacer llamado al back y obtener una pregunta
  const obtenerPregunta = async () => {
      if (!pregunta && numeroPregunta <= cantidad_preguntas) {
        
      //Obtener token
      const token = localStorage.getItem("token"); 

      //Determinar random el tipo (enntre los chats habilitados)
      const tipo_pregunta = nivelesHabilitados[Math.floor(Math.random() * nivelesHabilitados.length)];
        
      //Obtener dificultad
      const info = JSON.parse(localStorage.getItem("progresoUsuario") )
      const etapaKey = `etapa_${tipo_pregunta}`;
      const etapaProgreso = info[etapaKey].dificultad


      // Determinar aleatoriamente el tipo de actividad
      const tiposActividad = ["opcion_multiple", "completar_oracion"];
      const tipo_act = tiposActividad[Math.floor(Math.random() * tiposActividad.length)];
      
      try {
        const response = await fetch("https://mm-minigame1-f0cff7eb7d42.herokuapp.com/api/generar-pregunta/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            category: tipo_pregunta,
            lvl: etapaProgreso, //modificar para obtener dinamicamente
            question_type: tipo_act,
          }),
        });

        if (!response.ok) {
          throw new Error("Error al obtener la pregunta");
        }

        const data = await response.json();
        data.tipo = tipo_act; // añade el tipo
        setPregunta(data);

        console.log(data)

      } catch (error) {
        console.error("Error al obtener la pregunta:", error);
      }


    }
  }       

  //Resetear variables para siguiente pregunta
  const siguientePregunta = () => {
    setPregunta("")
    setNumeroPregunta(numeroPregunta + 1);
  };


  useEffect(() => {
    obtenerPregunta();
  }, [pregunta]);
  



  if (numeroPregunta > cantidad_preguntas) {
    return (
        <ChallengeFinal
          respuestasCorrectas={respuestasCorrectas}
          cantidad_preguntas={cantidad_preguntas}
        />
    );
  }

  if (!pregunta) return <p>Cargando pregunta...</p>;

  return (
     <div>
      {/* PREGUNTA DE OPCION MULTIPLE, RENDERIZADO DEFINIDO EN OTRO ARCHIVO */}

      {pregunta.tipo === "opcion_multiple" && (
        <ChallengeOption
          actividad={pregunta}
          aumentarContador={aumentarContador}
          siguientePregunta={siguientePregunta}
        />
      )}


      {/* PREGUNTA DE COMPLETAR FRASE, RENDERIZADO DEFINIDO EN OTRO ARCHIVO */}

      {pregunta.tipo === "completar_oracion" && (
        <ChallengeCompleteSentence
          actividad={pregunta}
          aumentarContador={aumentarContador}
          siguientePregunta={siguientePregunta}
        />
      )}


    </div>

  );
}