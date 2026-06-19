import { api, apiForm } from "./api";
import type { AuthUser, User } from "./types";

export const authApi = {
  login: (email: string, password: string) =>
    api<{ success: boolean; token: string; user: AuthUser; message?: string }>(
      "/api/auth/login",
      { method: "POST", json: { email, password }, token: null, skipAuthRedirect: true }
    ),
  me: () =>
    api<{ success: boolean; user: AuthUser }>("/api/auth/me", { skipAuthRedirect: true }),
  register: (data: { name: string; email: string; voicePart?: string }) =>
    api("/api/auth/register", { method: "POST", json: data }),
  requestReset: (email: string) =>
    api("/api/auth/reset-password", { method: "POST", json: { email }, token: null, skipAuthRedirect: true }),
  verifyOtp: (email: string, otp: string) =>
    api("/api/auth/reset-password/verify", { method: "POST", json: { email, otp }, token: null, skipAuthRedirect: true }),
  setPassword: (data: { email: string; otp: string; password: string; confirmPassword: string }) =>
    api("/api/auth/reset-password/set", { method: "POST", json: data, token: null, skipAuthRedirect: true }),
  changePassword: (password: string, confirmPassword: string) =>
    api("/api/users/change-password", { method: "POST", json: { password, confirmPassword } }),
};

export const usersApi = {
  list: () => api<{ success: boolean; users: User[]; count: number }>("/api/users"),
  updateProfile: (id: string, data: Partial<User>) =>
    api(`/api/users/${id}/profile`, { method: "PATCH", json: data }),
  updateStatus: (id: string, isActive: boolean) =>
    api(`/api/users/${id}/status`, { method: "PATCH", json: { isActive } }),
  updateSubTeam: (id: string, subTeam: string | null) =>
    api(`/api/users/${id}/subteam`, { method: "PATCH", json: { subTeam } }),
  delete: (id: string) => api(`/api/users/${id}`, { method: "DELETE" }),
  uploadPhoto: (file: File) => {
    const fd = new FormData();
    fd.append("avatar", file);
    return apiForm("/api/users/profile/photo", fd);
  },
};

export const eventsApi = {
  list: (params?: Record<string, string>) =>
    api(`/api/events?${new URLSearchParams(params || {}).toString()}`),
  upcoming: () => api("/api/events/upcoming"),
  get: (id: string) => api(`/api/events/${id}`),
  create: (data: Record<string, unknown>) => api("/api/events", { method: "POST", json: data }),
  update: (id: string, data: Record<string, unknown>) =>
    api(`/api/events/${id}`, { method: "PATCH", json: data }),
  cancel: (id: string) => api(`/api/events/${id}/cancel`, { method: "POST" }),
  complete: (id: string) => api(`/api/events/${id}/complete`, { method: "POST" }),
  conflicts: () => api("/api/events/conflicts"),
};

export const rsvpApi = {
  forEvent: (eventId: string) => api(`/api/rsvp/events/${eventId}`),
  myRsvp: (eventId: string) => api(`/api/rsvp/events/${eventId}/me`),
  submit: (eventId: string, status: string, note?: string) =>
    api(`/api/rsvp/events/${eventId}`, { method: "POST", json: { status, note } }),
  remove: (eventId: string) => api(`/api/rsvp/events/${eventId}`, { method: "DELETE" }),
};

export const songsApi = {
  list: (params?: Record<string, string>) =>
    api(`/api/songs?${new URLSearchParams(params || {}).toString()}`),
  get: (id: string) => api(`/api/songs/${id}`),
  create: (data: Record<string, unknown>) => api("/api/songs", { method: "POST", json: data }),
  update: (id: string, data: Record<string, unknown>) =>
    api(`/api/songs/${id}`, { method: "PATCH", json: data }),
  delete: (id: string) => api(`/api/songs/${id}`, { method: "DELETE" }),
  gaps: () => api("/api/songs/gaps/voice-parts"),
};

export const setlistsApi = {
  list: (params?: Record<string, string>) =>
    api(`/api/setlists?${new URLSearchParams(params || {}).toString()}`),
  templates: () => api("/api/setlists/templates"),
  get: (id: string) => api(`/api/setlists/${id}`),
  create: (data: Record<string, unknown>) => api("/api/setlists", { method: "POST", json: data }),
};

export const announcementsApi = {
  list: () => api<{ success: boolean; announcements: unknown[] }>("/api/announcements"),
  create: (title: string, message: string, files?: File[]) => {
    const fd = new FormData();
    fd.append("title", title);
    fd.append("message", message);
    files?.forEach((f) => fd.append("attachments", f));
    return apiForm("/api/announcements", fd);
  },
  delete: (id: string) => api(`/api/announcements/${id}`, { method: "DELETE" }),
};

export const assignmentsApi = {
  list: () => api("/api/assignments"),
  create: (data: Record<string, unknown>) => api("/api/assignments", { method: "POST", json: data }),
  delete: (id: string) => api(`/api/assignments/${id}`, { method: "DELETE" }),
};

export const resourcesApi = {
  list: () => api<{ success: boolean; resources: unknown[] }>("/api/resources"),
  upload: (title: string, description: string, files: File[]) => {
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    files.forEach((f) => fd.append("files", f));
    return apiForm("/api/resources/upload", fd);
  },
  delete: (id: string) => api(`/api/resources/${id}`, { method: "DELETE" }),
};

export const attendanceApi = {
  forEvent: (eventId: string) => api(`/api/attendance/events/${eventId}`),
  memberHistory: (memberId: string) => api(`/api/attendance/members/${memberId}`),
  mark: (eventId: string, data: Record<string, unknown>) =>
    api(`/api/attendance/events/${eventId}`, { method: "POST", json: data }),
  bulkMark: (eventId: string, entries: unknown[]) =>
    api(`/api/attendance/events/${eventId}/bulk`, { method: "POST", json: { entries } }),
  voicePartRates: () => api("/api/attendance/reports/voice-parts"),
};

export const notificationsApi = {
  list: () => api("/api/notifications"),
  unreadCount: () => api("/api/notifications/unread-count"),
  markRead: (id: string) => api(`/api/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () => api("/api/notifications/read-all", { method: "PATCH" }),
  create: (data: Record<string, unknown>) =>
    api("/api/notifications", { method: "POST", json: data }),
};

export const rehearsalsApi = {
  get: (eventId: string) => api(`/api/rehearsals/${eventId}`),
  update: (eventId: string, data: Record<string, unknown>) =>
    api(`/api/rehearsals/${eventId}`, { method: "PUT", json: data }),
  publish: (eventId: string) => api(`/api/rehearsals/${eventId}/publish`, { method: "POST" }),
};

export const practiceApi = {
  list: (params?: Record<string, string>) =>
    api(`/api/practice-logs?${new URLSearchParams(params || {}).toString()}`),
  create: (data: Record<string, unknown>) => api("/api/practice-logs", { method: "POST", json: data }),
  stats: (memberId: string) => api(`/api/practice-logs/stats/${memberId}`),
  feed: () => api("/api/practice-logs/feed"),
  delete: (id: string) => api(`/api/practice-logs/${id}`, { method: "DELETE" }),
};

export const rosterApi = {
  list: () => api("/api/roster"),
  getProfile: (userId: string) => api(`/api/roster/${userId}`),
  updateProfile: (userId: string, data: Record<string, unknown>) =>
    api(`/api/roster/${userId}`, { method: "PUT", json: data }),
  voiceParts: () => api("/api/roster/voice-parts"),
};

export const reportsApi = {
  dashboard: () => api("/api/reports/dashboard"),
  memberGrowth: () => api("/api/reports/member-growth"),
  songUsage: () => api("/api/reports/song-usage"),
  eventCompletion: () => api("/api/reports/event-completion"),
};

export const engagementApi = {
  list: () => api("/api/engagement"),
  leaderboard: () => api("/api/engagement/leaderboard"),
  atRisk: () => api("/api/engagement/at-risk"),
  memberScore: (memberId: string) => api(`/api/engagement/members/${memberId}`),
};

export const auditApi = {
  list: (params?: Record<string, string>) =>
    api(`/api/audit?${new URLSearchParams(params || {}).toString()}`),
  summary: () => api("/api/audit/summary"),
};

export const remindersApi = {
  pending: () => api("/api/reminders/pending"),
  stats: () => api("/api/reminders/stats"),
  sendEvents: (daysAhead = 1) =>
    api("/api/reminders/events", { method: "POST", json: { daysAhead } }),
};

export const exportsApi = {
  membersCsv: () => api("/api/exports/members"),
  eventsCsv: () => api("/api/exports/events"),
};

export const healthApi = {
  check: () => api("/api/health", { token: null }),
};
