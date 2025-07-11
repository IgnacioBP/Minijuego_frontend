
import {useEffect, useState, useRef} from "react";
import "../styles/Challenge.css";
import ChallengeOption from "./Challenge_Activities/ChallengeOption";
import ChallengeCompleteSentence from "./Challenge_Activities/ChallengeCompleteSentence";
import ChallengeFinal from "./ChallengeFinal";
import ChallengeTitle from "./Challenge_Activities/ChallengeNewsTitle";


export default function Challenge() {

  //Obtener niveles habilitados
  const nivelesHabilitados = JSON.parse(localStorage.getItem("nivelesHabilitados"));
  
  //Guardar temporalmente la dificultad y subtema
  const [dificulty,setDificulty] = useState("") 
  const [theme,setTheme] = useState("") 
  
  //Setear datos de pregunta que se va a mostrar en el momento (La idea es obtener estos datos desde el endpoint de django)
  const cantidad_preguntas= 3
  const [numeroPregunta, setNumeroPregunta] = useState(1);
  const [pregunta,setPregunta] = useState("")

  //Conteo de respuestas correctas
  const [respuestasCorrectas, setRespuestasCorrectas] = useState(0);

  //Garantiza que salgo al menos una de redactar
  const registroTipos = useRef([]);


  //Determinacion puntaje
  const pointSettings = {
    "facil" : { "puntos": 50, "puntaje_bono": [15,10,5], "tiempos_bono":[10,20,30] } ,
    "media" : { "puntos": 60, "puntaje_bono": [20,15,10],"tiempos_bono":[12,24,36] } ,
    "dificil":{ "puntos": 70, "puntaje_bono": [25,20,15],"tiempos_bono":[15,30,45] } ,
  }


  //para guardar tiempo inicial de pregunta
  const [inicioPregunta, setInicioPregunta] = useState(null);

  //Para puntaje previo
  const [mejorPuntajeAnterior, setMejorPuntajeAnterior] = useState(null);

  //Metricas
  const [puntaje,setPuntaje] = useState(0)
  const [puntajeTiempo,setPuntajetiempo] = useState(0)
  const [puntajePregunta,setPuntajePregunta] = useState(0)
  const [puntajeObtenible,setPuntajeObtenible] = useState(0)
  
  const [horaInicio,setHoraInicio] = useState()
  const [horaTermino,setHoraTermino] = useState()
  const [dificultadInicial,setDificultadInicial] = useState()
  
  const guardarPuntaje = (puntos, bono, obtenible) => {
    let nuevoPuntaje = puntaje + puntos + bono;
    let nuevoPuntajeBono = puntajeTiempo + bono;
    let nuevoPuntajePregunta = puntajePregunta + puntos;
    let nuevoPuntajeObtenible = puntajeObtenible + obtenible;

    console.log("=== Registro de puntaje ===");
    console.log("Pregunta:", puntos);
    console.log("Bono tiempo:", bono);
    console.log("Total acumulado:", nuevoPuntaje);
    console.log("Preguntas acumuladas:", nuevoPuntajePregunta);
    console.log("Bono acumulado:", nuevoPuntajeBono);
    console.log("Máximo obtenible acumulado:", nuevoPuntajeObtenible);

    setPuntaje(nuevoPuntaje);
    setPuntajetiempo(nuevoPuntajeBono);
    setPuntajePregunta(nuevoPuntajePregunta);
    setPuntajeObtenible(nuevoPuntajeObtenible);
  }

  const calcularBono = (setting, tiempoRespuesta) =>  {
    const tiempos = setting.tiempos_bono;
    const bonos = setting.puntaje_bono;

    for (let i = 0; i < tiempos.length; i++) {
      if (tiempoRespuesta < tiempos[i]) {
        return bonos[i];
      }
    }

    return 0;
  }



  //Setea valores para metricas y comparacion
  useEffect(() => {

    //Establecer hora de inicio
    console.log("FECHA DE INICIO", new Date())
    setHoraInicio(new Date());

    //Guardar datos base de dificultad
    const info = JSON.parse(localStorage.getItem("progresoUsuario") );
    
    let registro = {};

    nivelesHabilitados.forEach((numero) => {
      const etapaKey = `etapa_${numero}`;
      const etapaProgreso = info[etapaKey].dificultad;
      registro[numero] = etapaProgreso;
    });

    setDificultadInicial(registro);

    //Obenter mejor registro pasado
    const token = localStorage.getItem("token");
    //fetch("http://localhost:8000/api/mejor-puntaje/", {
    fetch("https://mm-minigame1-f0cff7eb7d42.herokuapp.com/api/mejor-puntaje/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("=== MEJOR PUNTAJE ===")
        console.log(data)
        setMejorPuntajeAnterior(data);
      })
      .catch((err) => console.error("Error al obtener mejor puntaje:", err));

    
  },[])

  //setea el valor en el cual se termino el juego
  useEffect(() => {
    if (numeroPregunta > cantidad_preguntas){
      console.log("FECHA DE TERMINO", new Date())
      setHoraTermino(new Date())
    }
      
  },[numeroPregunta])




  //Metodo de sumar mas a la cantidad de respeustas correctas
  const aumentarContador = () => {
    setRespuestasCorrectas(prev => prev + 1);
  };

  
  const obtenerTipoActividad = () => {
    const esUltimaPregunta = numeroPregunta === cantidad_preguntas;
    const hayDeTitulo = registroTipos.current.includes("escribir_respuesta");

    let tipoSeleccionado;

    if (esUltimaPregunta && !hayDeTitulo) {
      tipoSeleccionado = "escribir_respuesta"; // Forzar esta
    } else {
      const tiposDisponibles = ["opcion_multiple", "completar_oracion", "escribir_respuesta"];
      tipoSeleccionado = tiposDisponibles[Math.floor(Math.random() * tiposDisponibles.length)];
    }

    // Guardar el tipo en la lista
    registroTipos.current.push(tipoSeleccionado);

    return tipoSeleccionado;
  };

  //Funcion para hacer llamado al back y obtener una pregunta
  const obtenerPregunta = async () => {
      if (!pregunta && numeroPregunta <= cantidad_preguntas) {
        
      //Obtener token
      const token = localStorage.getItem("token"); 

      //Determinar random el tipo (enntre los chats habilitados)
      const tipo_pregunta = nivelesHabilitados[Math.floor(Math.random() * nivelesHabilitados.length)];
      setTheme(tipo_pregunta)

      //Obtener dificultad
      const info = JSON.parse(localStorage.getItem("progresoUsuario") )
      const etapaKey = `etapa_${tipo_pregunta}`;
      const etapaProgreso = info[etapaKey].dificultad
      setDificulty(etapaProgreso) 

      // Determinar aleatoriamente el tipo de actividad
      //const tiposActividad = ["opcion_multiple", "completar_oracion", "escribir_respuesta"];
      //const tipo_act = tiposActividad[Math.floor(Math.random() * tiposActividad.length)];
      //garantiza una actividad de escribir un titulo
      const tipo_act = obtenerTipoActividad()

      try {
        //const response = await fetch("http://localhost:8000/api/generar-pregunta/", {
        const response = await fetch("https://mm-minigame1-f0cff7eb7d42.herokuapp.com/api/generar-pregunta/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            category: tipo_pregunta,
            lvl: etapaProgreso,
            question_type: tipo_act,
          }),
        });

        if (!response.ok) {
          throw new Error("Error al obtener la pregunta");
        }
        console.log("RESPUESTA ",response)

        const data = await response.json();
        data.tipo = tipo_act; // añade el tipo
        
        setPregunta(data); //Guarda la pregunta para render 
        setInicioPregunta(new Date()); //Guarda tiempo inicial

        console.log(data)

      } catch (error) {
        console.error("Error al obtener la pregunta:", error);
      }


    }
  }       
  //Guardar respuesta
  const guardarResultados = async (actividad, seleccionJugador, acierto,tiempoResolucion, puntos_feedback = null) => {

    const token = localStorage.getItem("token");

    const cuerpo ={
        tema: theme,
        pregunta: actividad.pregunta,
        dificultad: dificulty,
        opciones: actividad.opciones,
        respuesta_correcta: actividad.respuesta_correcta,
        respuesta_jugador: seleccionJugador,
        es_correcta: acierto
    }

    if (puntos_feedback !== null ){
      cuerpo["puntaje"]= puntos_feedback
    }

    //await fetch("http://localhost:8000/api/guardar-respuesta-desafio/", {
    await fetch("https://mm-minigame1-f0cff7eb7d42.herokuapp.com/api/guardar-respuesta-desafio/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(cuerpo)
    });

    //Registro de datos del desafio general
    if (puntos_feedback !== null ){
      guardarPuntaje(puntos_feedback, 0, 50)
    } 
    else{
      const setting = pointSettings[dificulty];
      const bono = acierto ?  calcularBono(setting, tiempoResolucion) : 0
      const puntaje =  acierto ? setting.puntos : 0
      guardarPuntaje(puntaje, bono, setting.puntos)
    }


    //Actualizar la dificultad
    manejo_dificultad(theme, acierto)
  };


  const manejo_dificultad = (etapa, acierto) => {
    const progreso = JSON.parse(localStorage.getItem("progresoUsuario"));


    const key = `etapa_${etapa}`;
    const dificultadActual = progreso[key].dificultad;


    let nuevaDificultad = dificultadActual;

    if (acierto) {
      if (dificultadActual === "facil") nuevaDificultad = "media";
      else if (dificultadActual === "media") nuevaDificultad = "dificil";
    } else {
      if (dificultadActual === "dificil") nuevaDificultad = "media";
      else if (dificultadActual === "media") nuevaDificultad = "facil";
    }

    // Actualizar en el progreso
    progreso[key].dificultad = nuevaDificultad;

    // Guardar de nuevo en localStorage
    localStorage.setItem("progresoUsuario", JSON.stringify(progreso));

    return nuevaDificultad;
  }

  //Resetear variables para siguiente pregunta
  const siguientePregunta = () => {
    setPregunta("")
    setDificulty("")
    setNumeroPregunta(numeroPregunta + 1);
  };


  //btener  pregunta a renderizar
  useEffect(() => {
    obtenerPregunta();
  }, [pregunta]);
  




  if (numeroPregunta > cantidad_preguntas) {
    return (
        <ChallengeFinal
          respuestasCorrectas={respuestasCorrectas}
          cantidad_preguntas={cantidad_preguntas}
          puntaje={puntaje}
          puntajePregunta={puntajePregunta}
          puntajeTiempo={puntajeTiempo}
          puntajeObtenible={puntajeObtenible}
          horaInicio={horaInicio}
          horaTermino={horaTermino}
          dificultadInicial={dificultadInicial}
          puntajeAnterior= {mejorPuntajeAnterior}
      />
    );
  }

  if (!pregunta) return (
    // <p>Cargando pregunta...</p>);
    <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div className="loader-4">
        <div className="wave-container">
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
        </div>
        <div className="wave-text">Cargando siguiente pregunta</div>
      </div>
    </div>
  )








  return (
     <div>
      {/* PREGUNTA DE OPCION MULTIPLE, RENDERIZADO DEFINIDO EN OTRO ARCHIVO */}

      {pregunta.tipo === "opcion_multiple" && (
        <ChallengeOption
          actividad={pregunta}
          aumentarContador={aumentarContador}
          siguientePregunta={siguientePregunta}
          guardarResultados={guardarResultados}
          inicioPregunta={inicioPregunta}
        />
      )}


      {/* PREGUNTA DE COMPLETAR FRASE, RENDERIZADO DEFINIDO EN OTRO ARCHIVO */}

      {pregunta.tipo === "completar_oracion" && (
        <ChallengeCompleteSentence
          actividad={pregunta}
          aumentarContador={aumentarContador}
          siguientePregunta={siguientePregunta}
          guardarResultados={guardarResultados}
          inicioPregunta={inicioPregunta}
        />
      )}


      {pregunta.tipo === "escribir_respuesta" && (
        <ChallengeTitle
          actividad={pregunta}
          aumentarContador={aumentarContador}
          siguientePregunta={siguientePregunta}
          guardarResultados={guardarResultados}
          inicioPregunta={inicioPregunta}
          theme={theme}
        />
      )}


    </div>

  );
}