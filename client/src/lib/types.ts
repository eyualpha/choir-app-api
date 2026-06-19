export type UserRole = "admin" | "member";
export type VoicePart = "Soprano" | "Alto" | "Tenor" | "Bass" | "Other";

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  voicePart?: VoicePart;
  subTeam?: string | null;
  isActive?: boolean;
  isPasswordChanged?: boolean;
  profile?: { url?: string; public_id?: string };
  createdAt?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  voicePart?: VoicePart;
  isPasswordChanged?: boolean;
}

export interface ChoirEvent {
  _id: string;
  title: string;
  description?: string;
  eventType: string;
  location?: string;
  startAt: string;
  endAt: string;
  status: string;
  requiredVoiceParts?: string[];
  notes?: string;
}

export interface Song {
  _id: string;
  title: string;
  composer?: string;
  category?: string;
  difficulty?: string;
  keySignature?: string;
  tags?: string[];
  isActive?: boolean;
}

export interface Announcement {
  _id: string;
  title: string;
  message: string;
  attachments?: Array<{ url: string; mimeType?: string }>;
  createdAt: string;
  createdBy?: User;
}

export interface Notification {
  _id: string;
  title: string;
  body: string;
  category: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiListMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface ApiErrorBody {
  success?: boolean;
  message?: string;
  details?: string[];
}
