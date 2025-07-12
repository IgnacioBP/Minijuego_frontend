import { useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";


export default function ReturnLoading() {
    const navigate = useNavigate();

    useEffect(() => {
        const timeout = setTimeout(() => {
            navigate("/");
        }, 3000); // 3000 milisegundos = 3 segundos

        return () => clearTimeout(timeout); // limpieza si el componente se desmonta antes
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
            <CircularProgress />
            <h2 style={{ marginTop: "1rem" }}>
                Volviendo a inicio, gracias por jugar.
            </h2>
        </div>
    );
}