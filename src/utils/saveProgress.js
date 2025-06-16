export async function saveProgress({ etapaId, conversacion, actividad,final,token }) {
  
  try {
    const response = await fetch("https://mm-minigame1-f0cff7eb7d42.herokuapp.com/api/actualizar-progreso/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        etapa_id: etapaId,
        numero_conversacion_alcanzada: conversacion,
        numero_actividad_alcanzada: actividad,
        final_alcanzado: final
      }),
    });

  console.log(response)

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al guardar el progreso");
    }

    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error("Error al actualizar el progreso:", error);
    throw error;
  }
}