// 🧠 FUNCIÓN: Archivo de configuración principal, crea el Store de Redux Toolkit.
// 🧩 UTILIZA: configureStore para combinar los 6 slices y definir la estructura del estado global.
import { configureStore } from 'https://cdn.skypack.dev/@reduxjs/toolkit';
import authReducer from './authSlice.js';
import boardReducer from './boardSlice.js';
import tasksReducer from './tasksSlice.js';
import usersReducer from './usersSlice.js';
import activityLogReducer from './activityLogSlice.js';
import uiReducer from './uiSlice.js';

export const store = configureStore({
    // Configura el Store de Redux Toolkit.
    reducer: {
        // Objeto raíz del estado global. Cada clave es un slice.
        auth: authReducer,
        board: boardReducer,
        tasks: tasksReducer,
        users: usersReducer,
        activityLog: activityLogReducer,
        ui: uiReducer,
    },
});