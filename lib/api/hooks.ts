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
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['scenes', screenplayId] });
      qc.invalidateQueries({ queryKey: ['scene-data', variables.sceneId] });
    },
  });
}

export function useCreateScene(screenplayId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => post(`/screenplays/${screenplayId}/scenes`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scenes', screenplayId] }),
  });
}

export function useScene(screenplayId: string, sceneId: string | null) {
  return useQuery({
    queryKey: ['scene', screenplayId, sceneId],
    queryFn: () => get(`/screenplays/${screenplayId}/scenes/${sceneId}`),
    enabled: !!screenplayId && !!sceneId,
  });
}

export function useDeleteScene(screenplayId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sceneId: string) => del(`/screenplays/${screenplayId}/scenes/${sceneId}`),
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

// ─── Locations ───
export function useLocations(screenplayId: string) {
  return useQuery({
    queryKey: ['locations', screenplayId],
    queryFn: () => get(`/screenplays/${screenplayId}/locations`),
    enabled: !!screenplayId,
  });
}

export function useCreateLocation(screenplayId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => post(`/screenplays/${screenplayId}/locations`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['locations', screenplayId] }),
  });
}

export function useUpdateLocation(screenplayId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      patch(`/screenplays/${screenplayId}/locations/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['locations', screenplayId] }),
  });
}

export function useDeleteLocation(screenplayId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del(`/screenplays/${screenplayId}/locations/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['locations', screenplayId] }),
  });
}

// ─── Cards ───
export function useCards(screenplayId: string) {
  return useQuery({
    queryKey: ['cards', screenplayId],
    queryFn: () => get(`/screenplays/${screenplayId}/cards`),
    enabled: !!screenplayId,
  });
}

export function useCreateCard(screenplayId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => post(`/screenplays/${screenplayId}/cards`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cards', screenplayId] }),
  });
}

export function useUpdateCard(screenplayId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      patch(`/screenplays/${screenplayId}/cards/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cards', screenplayId] }),
  });
}

export function useDeleteCard(screenplayId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del(`/screenplays/${screenplayId}/cards/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cards', screenplayId] }),
  });
}

export function useReorderCards(screenplayId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: Array<{ id: string; order: number }>) =>
      patch(`/screenplays/${screenplayId}/cards/reorder`, { items }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cards', screenplayId] }),
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

// ─── Title Page ───
export function useUpdateTitlePage(screenplayId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => patch(`/screenplays/${screenplayId}/titlepage`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['screenplay', screenplayId] });
    },
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

// ─── Notifications ───
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => get('/notifications'),
    refetchInterval: 30000,
  });
}

export function useMarkNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => patch('/notifications/read-all', {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

// ─── Invites ───
export function usePendingInvites() {
  return useQuery({
    queryKey: ['pending-invites'],
    queryFn: () => get('/invites/pending'),
  });
}

export function useRespondToInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { screenplayId: string; userId: string; action: 'accept' | 'reject' }) =>
      post('/invites/respond', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pending-invites'] });
      qc.invalidateQueries({ queryKey: ['screenplays'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
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
