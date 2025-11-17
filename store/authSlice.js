//FUNCIÓN: Controla el estado de autenticación (login/logout).
//UTILIZA: El APIService (Patrón Singleton) para configurar las credenciales de red de forma global.
import { createSlice } from 'https://cdn.skypack.dev/@reduxjs/toolkit';
import apiService from '../services/apiService.js'; // Importa la ÚNICA instancia del APIService (Singleton).

const authSlice = createSlice({
    name: 'auth',
    initialState: { isAuthenticated: false, user: null, token: null },
    reducers: {
        loginSuccess: (state, action) => {
            const { user } = action.payload; 
            const token = 'fake-jwt-token-123'; // Token de autenticación simulado.

            // Mutaciones del estado de Redux:
            state.isAuthenticated = true; // Indica que la sesión está activa.
            state.user = user;
            state.token = token;

            // PUNTO CRÍTICO: Integración del Patrón Singleton.
            // Llama al método del servicio para establecer el token globalmente.
            // Esto es una Mutación Lateral Controlada: no afecta el estado local de Redux, sino un objeto externo.
            apiService.setAuth(state.user, state.token); 

            console.log(`[Redux] Login exitoso. Singleton API actualizado para el usuario ${user.id}.`);
        },

        logout: (state) => {
            // Reestablece el estado a no autenticado.
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            // Limpia las credenciales del Singleton para futuras peticiones.
            apiService.setAuth(null, null); 
            console.log(`[Redux] Logout exitoso.`);
        }
    }
}); 

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;