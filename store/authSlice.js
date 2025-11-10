import { createSlice } from 'https://cdn.skypack.dev/@reduxjs/toolkit';
import apiService from '../services/apiService.js'; 

const authSlice = createSlice({
    name: 'auth',
    initialState: { isAuthenticated: false, user: null, token: null },
    reducers: {
        loginSuccess: (state, action) => {
            const { user } = action.payload; 
            const token = 'fake-jwt-token-123'; 

            state.isAuthenticated = true; 
            state.user = user;
            state.token = token;
            
            apiService.setAuth(state.user, state.token); 
            
            console.log(`[Redux] Login exitoso. Singleton API actualizado para el usuario ${user.id}.`);
        },

        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            apiService.setAuth(null, null); 
            console.log(`[Redux] Logout exitoso.`);
        }
    }
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;