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

// ─── Collaborators ───
export function useCollaborators(screenplayId: string) {
  return useQuery({
    queryKey: ['collaborators', screenplayId],
    queryFn: () => get(`/screenplays/${screenplayId}/collaborators`),
    enabled: !!screenplayId,
  });
}

export function useInviteCollaborator(screenplayId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string }) => post(`/screenplays/${screenplayId}/collaborators`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collaborators', screenplayId] }),
  });
}

// ─── Mentor System (User-facing) ───
export function useActiveMentors() {
  return useQuery({ queryKey: ['active-mentors'], queryFn: () => get('/mentors') });
}

export function useMentorRequest(screenplayId: string) {
  return useQuery({
    queryKey: ['mentor-request', screenplayId],
    queryFn: () => get(`/screenplays/${screenplayId}/mentor-request`),
    enabled: !!screenplayId,
  });
}

export function useRequestMentor(screenplayId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { mentorId: string }) => post(`/screenplays/${screenplayId}/mentor-request`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mentor-request', screenplayId] }),
  });
}

export function useCancelMentorRequest(screenplayId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => del(`/screenplays/${screenplayId}/mentor-request`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mentor-request', screenplayId] }),
  });
}

// ─── Admin Mentor Requests ───
export function useAdminMentorRequests(status?: string) {
  return useQuery({
    queryKey: ['admin-mentor-requests', status],
    queryFn: () => get(`/admin/assignments${status ? `?status=${status}` : ''}`),
  });
}

export function useApproveMentorRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; status: 'ACTIVE' | 'COMPLETED' }) => patch('/admin/assignments', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-mentor-requests'] }),
  });
}

export function useRejectMentorRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del(`/admin/assignments?id=${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-mentor-requests'] }),
  });
}

// ─── Mentor Notes (for scenes) ───
export function useMentorNotes(sceneId: string) {
  return useQuery({
    queryKey: ['mentor-notes', sceneId],
    queryFn: () => get(`/mentor/notes?sceneId=${sceneId}`),
    enabled: !!sceneId,
  });
}

// ─── Scenes for a screenplay (used in mentor page) ───
export function useScreenplayScenes(screenplayId: string) {
  return useQuery({
    queryKey: ['screenplay-scenes', screenplayId],
    queryFn: () => get(`/screenplays/${screenplayId}/scenes`),
    enabled: !!screenplayId,
  });
}
