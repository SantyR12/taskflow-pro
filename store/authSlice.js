// store/authSlice.js
import { createSlice } from 'https://cdn.skypack.dev/@reduxjs/toolkit';
import apiService from '../services/apiService.js'; // Importa el Singleton

const authSlice = createSlice({
    name: 'auth',
    initialState: { isAuthenticated: false, user: null, token: null },
    reducers: {
        loginSuccess: (state, action) => {
            // Desestructuración del payload.
            // Nota: JSONPlaceholder no proporciona un token, se usa uno simulado.
            const { user } = action.payload; 
            const token = 'fake-jwt-token-123'; // Token simulado

            // 1. Actualización del estado (Patrón Inmutable de Redux Toolkit)
            state.isAuthenticated = true; // <-- ¡Asegúrate de cambiar esto a true!
            state.user = user;
            state.token = token;
            
            // 2. Integración del Patrón Singleton: Actualizar el servicio API
            // Usamos el 'user' y 'token' del estado actualizado
            apiService.setAuth(state.user, state.token); 
            
            console.log(`[Redux] Login exitoso. Singleton API actualizado para el usuario ${user.id}.`);
        },

        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            
            // Opcional: Limpiar el Singleton en logout si fuera necesario
            apiService.setAuth(null, null); 
            console.log(`[Redux] Logout exitoso.`);
        }
    }
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;