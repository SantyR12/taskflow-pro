// store/activityLogSlice.js
import { createSlice } from 'https://cdn.skypack.dev/@reduxjs/toolkit';

const activityLogSlice = createSlice({
    name: 'activityLog',
    initialState: { log: [] },
    reducers: {
        // Acción usada por el WorkerFacade (Observer Listener)
        addLog: (state, action) => {
            // El payload es el objeto creado por el Patrón Factory
            state.log.unshift(action.payload);
            if (state.log.length > 10) {
                state.log.pop();
            }
        }
    }
});

export const { addLog } = activityLogSlice.actions;
export default activityLogSlice.reducer;