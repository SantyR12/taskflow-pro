import { createSlice } from 'https://cdn.skypack.dev/@reduxjs/toolkit';

const activityLogSlice = createSlice({
    name: 'activityLog',
    initialState: { log: [] },
    reducers: {
        addLog: (state, action) => {
            state.log.unshift(action.payload);
            if (state.log.length > 10) {
                state.log.pop();
            }
        }
    }
});

export const { addLog } = activityLogSlice.actions;
export default activityLogSlice.reducer;