import { useDispatch, useSelector } from 'react-redux';
import { useMemo } from 'react';

// Typed hooks for use throughout the app
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Custom hooks for each slice
export const useDashboard = () => {
  const dashboard = useSelector((state) => state.dashboard);
  const dispatch = useDispatch();
  return useMemo(() => ({ ...dashboard, dispatch }), [dashboard, dispatch]);
};

export const useUsers = () => {
  const users = useSelector((state) => state.users);
  const dispatch = useDispatch();
  return useMemo(() => ({ ...users, dispatch }), [users, dispatch]);
};

export const useRoles = () => {
  const roles = useSelector((state) => state.roles);
  const dispatch = useDispatch();
  return useMemo(() => ({ ...roles, dispatch }), [roles, dispatch]);
};

export const useProfile = () => {
  const profile = useSelector((state) => state.profile);
  const dispatch = useDispatch();
  return useMemo(() => ({ ...profile, dispatch }), [profile, dispatch]);
};

export const useCandidates = () => {
  const candidates = useSelector((state) => state.candidate);
  const dispatch = useDispatch();
  return useMemo(() => ({ ...candidates, dispatch }), [candidates, dispatch]);
};

export const useColleges = () => {
  const colleges = useSelector((state) => state.college);
  const dispatch = useDispatch();
  return useMemo(() => ({ ...colleges, dispatch }), [colleges, dispatch]);
};
