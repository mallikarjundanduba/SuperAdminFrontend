import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './slices/dashboardSlice';
import usersReducer from './slices/usersSlice';
import rolesReducer from './slices/rolesSlice';
import profileReducer from './slices/profileSlice';
import candidateReducer from './slices/candidateSlice';
import collegeReducer from './slices/collegeSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    users: usersReducer,
    roles: rolesReducer,
    profile: profileReducer,
    candidate: candidateReducer,
    college: collegeReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});


