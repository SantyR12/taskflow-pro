// store/usersSlice.js - Caché de Usuarios para evitar fetch repetidos
import { createSlice } from 'https://cdn.skypack.dev/@reduxjs/toolkit';

const usersSlice = createSlice({
    name: 'users',
    initialState: { users: {} },
    reducers: {
        // Acción usada por el Worker 1 (Prefetch)
        setUsers: (state, action) => {
            state.users = action.payload;
            console.log(`[Redux] Usuarios cacheados desde Worker 1 (${Object.keys(action.payload).length} usuarios).`);
        }
    }
});

export const { setUsers } = usersSlice.actions;
export default usersSlice.reducer;