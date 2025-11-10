import { createSlice } from 'https://cdn.skypack.dev/@reduxjs/toolkit';

const uiSlice = createSlice({
    name: 'ui',
    initialState: { 
        isModalOpen: false, 
        selectedTaskId: null, 
        exportStatus: 'idle' 
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