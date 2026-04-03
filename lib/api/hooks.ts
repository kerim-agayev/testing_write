'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from './client';

// ─── Screenplays ───
export function useScreenplays() {
  return useQuery({ queryKey: ['screenplays'], queryFn: () => get('/screenplays') });
}

export function useScreenplay(id: string) {
  return useQuery({ queryKey: ['screenplay', id], queryFn: () => get(`/screenplays/${id}`), enabled: !!id });
}

export function useDemoScreenplay() {
  return useQuery({ queryKey: ['demo'], queryFn: () => get('/screenplays/demo') });
}

export function useCreateScreenplay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => post('/screenplays', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['screenplays'] }),
  });
}

export function useDeleteScreenplay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del(`/screenplays/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['screenplays'] }),
  });
}

// ─── Scenes ───
export function useScenes(screenplayId: string) {
  return useQuery({
    queryKey: ['scenes', screenplayId],
    queryFn: () => get(`/screenplays/${screenplayId}/scenes`),
    enabled: !!screenplayId,
  });
}

export function useSaveScene(screenplayId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sceneId, data }: { sceneId: string; data: Record<string, unknown> }) =>
      patch(`/screenplays/${screenplayId}/scenes/${sceneId}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scenes', screenplayId] }),
  });
}

export function useCreateScene(screenplayId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => post(`/screenplays/${screenplayId}/scenes`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scenes', screenplayId] }),
  });
}

// ─── Characters ───
export function useCharacters(screenplayId: string) {
  return useQuery({
    queryKey: ['characters', screenplayId],
    queryFn: () => get(`/screenplays/${screenplayId}/characters`),
    enabled: !!screenplayId,
  });
}

export function useCreateCharacter(screenplayId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => post(`/screenplays/${screenplayId}/characters`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['characters', screenplayId] }),
  });
}

export function useUpdateCharacter(screenplayId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      patch(`/screenplays/${screenplayId}/characters/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['characters', screenplayId] }),
  });
}

// ─── Arcs ───
export function useArcs(screenplayId: string) {
  return useQuery({
    queryKey: ['arcs', screenplayId],
    queryFn: () => get(`/screenplays/${screenplayId}/arcs`),
    enabled: !!screenplayId,
  });
}

export function useUpsertArc(screenplayId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => post(`/screenplays/${screenplayId}/arcs`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['arcs', screenplayId] }),
  });
}

// ─── Analytics ───
export function useAnalytics(screenplayId: string) {
  return useQuery({
    queryKey: ['analytics', screenplayId],
    queryFn: () => get(`/screenplays/${screenplayId}/analytics`),
    enabled: !!screenplayId,
  });
}

// ─── Profile ───
export function useProfile() {
  return useQuery({ queryKey: ['profile'], queryFn: () => get('/profile') });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => patch('/profile', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  });
}

// ─── Mentor ───
export function useMentorAssignments() {
  return useQuery({ queryKey: ['mentor-assignments'], queryFn: () => get('/mentor/assignments') });
}

export function useCreateMentorNote() {
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => post('/mentor/notes', data),
  });
}

// ─── Admin ───
export function useAdminStats() {
  return useQuery({ queryKey: ['admin-stats'], queryFn: () => get('/admin/stats') });
}

export function useAdminUsers(search?: string) {
  return useQuery({
    queryKey: ['admin-users', search],
    queryFn: () => get(`/admin/users${search ? `?search=${search}` : ''}`),
  });
}

export function useAdminMentors() {
  return useQuery({ queryKey: ['admin-mentors'], queryFn: () => get('/admin/mentors') });
}

export function useCreateMentor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => post('/admin/mentors', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-mentors'] }),
  });
}
