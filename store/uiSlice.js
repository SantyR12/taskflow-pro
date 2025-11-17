// FUNCIÓN: Controla el estado efímero y visual de la interfaz (modales, estado de exportación).
// UTILIZA: El WorkerFacade para reflejar el 'exportStatus' del Export Worker (Worker 3).
import { createSlice } from 'https://cdn.skypack.dev/@reduxjs/toolkit';

const uiSlice = createSlice({
    name: 'ui',
    initialState: { 
        isModalOpen: false, // Controla la visibilidad de los modales.
        selectedTaskId: null, 
        exportStatus: 'idle' // 'idle', 'processing', 'complete', 'error'. Refleja el estado del Export Worker.
    },
    reducers: {
        setExportStatus: (state, action) => {
            state.exportStatus = action.payload;
        },
        openModal: (state, action) => {
            state.isModalOpen = true;
            state.selectedTaskId = action.payload.taskId;
        },
        closeModal: (state) => {
            state.isModalOpen = false;
            state.selectedTaskId = null;
        }
    }
});

export const { setExportStatus, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;