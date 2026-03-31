// ─── API Response Types ─────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  details?: any;
}

// ─── Auth Types ─────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  organizationName: string;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "MEMBER";
  avatar?: string;
  organizationId: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

// ─── Contact Types ──────────────────────────────────────────

export type Gender = "MALE" | "FEMALE" | "NON_BINARY" | "OTHER" | "PREFER_NOT_TO_SAY";
export type ContactStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED" | "BLOCKED";

export interface Contact {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gender?: Gender;
  location?: string;
  status: ContactStatus;
  source?: string;
  avatarUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  tags?: { tag: Tag }[];
  interests?: { interest: Interest }[];
  _count?: {
    interactions: number;
    messages: number;
  };
}

export interface CreateContactRequest {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gender?: Gender;
  location?: string;
  source?: string;
}

export interface UpdateContactRequest extends Partial<CreateContactRequest> {
  status?: ContactStatus;
}

// ─── Tag & Interest Types ───────────────────────────────────

export interface Tag {
  id: string;
  name: string;
  color: string;
  _count?: { contacts: number };
}

export interface Interest {
  id: string;
  name: string;
}

// ─── Segment Types ──────────────────────────────────────────

export interface Segment {
  id: string;
  name: string;
  description?: string;
  filters: SegmentFilters;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { contacts: number };
}

export interface SegmentFilters {
  gender?: Gender;
  status?: ContactStatus;
  location?: string;
  source?: string;
  tagIds?: string[];
  interestIds?: string[];
}

// ─── Campaign Types ─────────────────────────────────────────

export type CampaignStatus = "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "CANCELLED";

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  channel?: ChannelType;
  content?: { message?: string; subject?: string };
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
  segmentId?: string;
  segment?: {
    id: string;
    name: string;
    _count?: { contacts: number };
  };
}

// ─── Message Types ──────────────────────────────────────────

export type ChannelType = "WHATSAPP" | "INSTAGRAM" | "FACEBOOK_MESSENGER" | "EMAIL" | "SMS";
export type MessageDirection = "INBOUND" | "OUTBOUND";
export type MessageStatus = "SENT" | "DELIVERED" | "READ" | "FAILED";

export interface Message {
  id: string;
  content: string;
  direction: MessageDirection;
  channel: ChannelType;
  status: MessageStatus;
  sentAt: string;
  createdAt: string;
  contact?: {
    firstName: string;
    lastName?: string;
  };
}

// ─── Interaction Types ──────────────────────────────────────

export type InteractionType =
  | "EMAIL"
  | "PHONE_CALL"
  | "MEETING"
  | "WHATSAPP"
  | "INSTAGRAM_DM"
  | "FACEBOOK_MESSAGE"
  | "NOTE"
  | "OTHER";

export interface Interaction {
  id: string;
  type: InteractionType;
  subject?: string;
  notes?: string;
  date: string;
  contactId: string;
}

// ─── Dashboard Types ────────────────────────────────────────

export interface DashboardStats {
  overview: {
    totalContacts: number;
    activeContacts: number;
    inactiveContacts: number;
    totalSegments: number;
    totalMessages: number;
  };
  contactsByGender: { gender: Gender | null; _count: number }[];
  contactsByStatus: { status: ContactStatus; _count: number }[];
  contactsBySource: { source: string | null; _count: number }[];
  recentInteractions: (Interaction & { contact: { firstName: string; lastName?: string } })[];
  contactGrowth: { month: string; count: number }[];
  messagesByChannel: { channel: ChannelType; _count: number }[];
}

// ─── Admin Types ─────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { users: number; contacts: number; campaigns: number };
  users?: AdminUser[];
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserProfile["role"];
  isActive: boolean;
  createdAt: string;
  organization?: { id: string; name: string; slug: string };
}

export interface PlatformStats {
  totalOrganizations: number;
  totalUsers: number;
  totalContacts: number;
  totalMessages: number;
  contactsByStatus: { status: string; count: number }[];
  usersByRole: { role: string; count: number }[];
  messagesByChannel: { channel: string; count: number }[];
  contactGrowth: { month: string; count: number }[];
  contactsByOrg: { name: string; contacts: number; users: number; campaigns: number }[];
  recentActivity: {
    id: string;
    action: string;
    entityType: string;
    details: { description?: string } | null;
    userName: string;
    orgName: string;
    createdAt: string;
  }[];
}
