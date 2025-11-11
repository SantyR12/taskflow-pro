// 📜 FUNCIÓN: Gestiona el feed de actividad reciente, limitándolo a los 10 eventos más nuevos.
// 🔗 UTILIZA: El ActivityFactory para crear objetos de log y se alimenta del Sync Worker (Observer).
import { createSlice } from 'https://cdn.skypack.dev/@reduxjs/toolkit';

const activityLogSlice = createSlice({
    name: 'activityLog', // Nombre del slice. Se usa para acceder a esta parte del estado (ej. state.activityLog).
    initialState: { log: [] }, // El estado inicial es un objeto que contiene el array 'log' vacío.
    //2 en 1
    reducers: {
        addLog: (state, action) => {
            // Reducer que se llama para añadir una entrada al log.
            // action.payload es el objeto de log creado por el ActivityFactory. Algo sucedio
            // .unshift() es un método que añade el elemento al inicio del array.
            // Se utiliza para que la actividad más reciente aparezca en la parte superior del feed.
            state.log.unshift(action.payload);
            
            // Lógica de Buffer (Control de Capacidad/Memoria):
            if (state.log.length > 10) {
                // Si el array excede 10 elementos...
                // .pop() elimina el último elemento (el más antiguo).
                // Esto es una optimización para evitar que el log crezca indefinidamente.
                state.log.pop();
            }
        }
    }
});

export const { addLog } = activityLogSlice.actions; // Exporta el Action Creator 'addLog'.
export default activityLogSlice.reducer; // Exporta el Reducer para combinarlo en el Store raíz.