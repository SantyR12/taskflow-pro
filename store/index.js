// store/index.js
import { configureStore } from 'https://cdn.skypack.dev/@reduxjs/toolkit';
import authReducer from './authSlice.js';
import boardReducer from './boardSlice.js';
import tasksReducer from './tasksSlice.js';
import usersReducer from './usersSlice.js';
import activityLogReducer from './activityLogSlice.js';
import uiReducer from './uiSlice.js';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        board: boardReducer,
        tasks: tasksReducer,
        users: usersReducer,
        activityLog: activityLogReducer,
        ui: uiReducer,
    },
});