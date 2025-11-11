// 👤 FUNCIÓN: Implementa un caché para almacenar la información de los usuarios asignados a las tareas.
// 💾 UTILIZA: El Prefetch Worker (Worker 1) para cargar los datos de usuario en un solo lote.
import { createSlice } from 'https://cdn.skypack.dev/@reduxjs/toolkit';

const usersSlice = createSlice({
    name: 'users',
    initialState: { users: {} }, // Almacén de usuarios normalizado por ID.
    reducers: {
        setUsers: (state, action) => {
            // Recibe el diccionario de usuarios normalizado desde el Prefetch Worker (Worker 1).
            state.users = action.payload;
            console.log(`[Redux] Usuarios cacheados desde Worker 1 (${Object.keys(action.payload).length} usuarios).`);
        }
    }
});

export const { setUsers } = usersSlice.actions;
export default usersSlice.reducer;