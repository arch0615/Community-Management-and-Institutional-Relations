# Technical Manual: Modular CRM for Community Management and Institutional Relations

**Version:** 1.0
**Date:** March 2026
**Project Type:** Full-Stack SaaS Web Application

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Database Schema](#5-database-schema)
6. [Backend API Reference](#6-backend-api-reference)
7. [Frontend Application](#7-frontend-application)
8. [Authentication & Security](#8-authentication--security)
9. [Meta API Integration](#9-meta-api-integration)
10. [Configuration & Environment](#10-configuration--environment)
11. [Development Guide](#11-development-guide)
12. [Deployment](#12-deployment)
13. [Extending the System](#13-extending-the-system)

---

## 1. Project Overview

### Purpose

A centralized CRM platform for managing contacts, automating communication flows, segmenting audiences, and generating executive reports. Designed to be replicable across multiple organizations with multi-tenancy support.

### Target Users

Organizations managing community engagement and institutional relationships, including NGOs, associations, government agencies, and community-driven enterprises.

### Core Capabilities

| Module | Description |
|--------|-------------|
| **Contact Management** | Full CRUD for contacts with tagging, interests, interaction tracking |
| **Audience Segmentation** | Dynamic segments with filters on gender, status, location, interests, tags |
| **Multi-Channel Messaging** | WhatsApp, Instagram, Facebook Messenger, Email, SMS support |
| **Reporting & Analytics** | Dashboard stats, engagement metrics, contact growth, demographic breakdown |
| **Meta Integration** | Webhook-based inbound message processing from Meta platforms |
| **Multi-Tenancy** | Organization-scoped data isolation with role-based access control |

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼───────────────────────────────────────┐
│              Next.js Frontend (Port 3000)                    │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────────┐  │
│  │  Pages  │ │Components│ │  Hooks   │ │  React Query    │  │
│  └─────────┘ └──────────┘ └──────────┘ └─────────────────┘  │
└──────────────────────┬───────────────────────────────────────┘
                       │ REST API (Axios)
┌──────────────────────▼───────────────────────────────────────┐
│              Express.js Backend (Port 4000)                  │
│  ┌──────┐ ┌──────────┐ ┌────────────┐ ┌──────────────────┐  │
│  │ Auth │ │ Contacts │ │ Segments   │ │ Messages/Reports │  │
│  └──────┘ └──────────┘ └────────────┘ └──────────────────┘  │
│  ┌──────────────────┐ ┌──────────────────────────────────┐   │
│  │ Meta Integration │ │ Middleware (JWT, Validation, CORS)│  │
│  └──────────────────┘ └──────────────────────────────────┘   │
└──────────────────────┬───────────────────────────────────────┘
                       │ Prisma ORM
┌──────────────────────▼───────────────────────────────────────┐
│                    PostgreSQL Database                        │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Monorepo Structure (Turborepo)

The project uses a Turborepo-managed monorepo with three workspaces:

- **apps/backend** -- Node.js/Express REST API server
- **apps/frontend** -- Next.js 14 React web application
- **packages/shared** -- Shared TypeScript type definitions

### 2.3 Design Patterns

| Pattern | Usage |
|---------|-------|
| **Modular Architecture** | Backend features organized as self-contained modules (controller, service, routes, validation) |
| **Multi-Tenancy** | All data models include `organizationId` for tenant isolation |
| **Repository Pattern** | Prisma service layer abstracts database operations |
| **Provider Pattern** | React context providers for auth state and React Query |
| **Route Groups** | Next.js `(dashboard)` layout group for authenticated pages |

---

## 3. Technology Stack

### 3.1 Backend

| Category | Technology | Version |
|----------|-----------|---------|
| Runtime | Node.js | >= 18.0.0 |
| Framework | Express.js | ^4.21.0 |
| Language | TypeScript | ^5.5.0 |
| ORM | Prisma | ^5.22.0 |
| Database | PostgreSQL | -- |
| Auth | Passport.js + JWT | ^0.7.0 |
| Password Hashing | bcryptjs | ^2.4.3 |
| Validation | express-validator | ^7.2.0 |
| Security | Helmet | ^8.0.0 |
| File Upload | Multer | ^1.4.5 |
| CSV Processing | csv-parser / json2csv | ^3.0.0 / ^6.0.0 |
| Logging | Morgan | ^1.10.0 |

### 3.2 Frontend

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Next.js | ^14.2.0 |
| UI Library | React | ^18.3.0 |
| Styling | Tailwind CSS | ^3.4.0 |
| Component Primitives | Radix UI | Various |
| State Management | TanStack React Query | ^5.60.0 |
| HTTP Client | Axios | ^1.7.0 |
| Forms | React Hook Form | ^7.53.0 |
| Validation | Zod | ^3.23.0 |
| Charts | Recharts | ^2.13.0 |
| Icons | Lucide React | ^0.460.0 |
| Notifications | Sonner | ^1.7.0 |

### 3.3 Build & Tooling

| Category | Technology | Version |
|----------|-----------|---------|
| Monorepo | Turborepo | ^2.3.0 |
| TS Execution | tsx | ^4.19.0 |
| Linting | ESLint | -- |
| CSS Processing | PostCSS | ^8.4.0 |

---

## 4. Project Structure

```
project-root/
├── apps/
│   ├── backend/
│   │   ├── prisma/
│   │   │   └── schema.prisma              # Database schema
│   │   ├── src/
│   │   │   ├── app.ts                     # Express server entry point
│   │   │   ├── config/
│   │   │   │   ├── index.ts               # Environment configuration
│   │   │   │   ├── database.ts            # Prisma client singleton
│   │   │   │   └── passport.ts            # JWT & Local auth strategies
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts                # JWT authentication guard
│   │   │   │   ├── errorHandler.ts        # Global error handler
│   │   │   │   └── validate.ts            # Request validation
│   │   │   ├── modules/
│   │   │   │   ├── auth/                  # Authentication module
│   │   │   │   ├── contacts/              # Contact management module
│   │   │   │   ├── segmentation/          # Audience segmentation module
│   │   │   │   ├── messaging/             # Messaging module
│   │   │   │   ├── reports/               # Reports & analytics module
│   │   │   │   └── meta-integration/      # Meta API webhook module
│   │   │   └── utils/
│   │   │       └── pagination.ts          # Pagination helper
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .env.example
│   │
│   └── frontend/
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx             # Root layout (providers)
│       │   │   ├── page.tsx               # Landing / redirect page
│       │   │   ├── globals.css            # Tailwind imports & global styles
│       │   │   ├── login/page.tsx         # Login page
│       │   │   ├── register/page.tsx      # Registration page
│       │   │   └── (dashboard)/           # Authenticated route group
│       │   │       ├── layout.tsx         # Dashboard layout (sidebar + header)
│       │   │       ├── dashboard/page.tsx # Dashboard overview
│       │   │       ├── contacts/          # Contacts list & detail pages
│       │   │       ├── segments/page.tsx  # Segment management
│       │   │       ├── messages/page.tsx  # Messaging interface
│       │   │       ├── reports/page.tsx   # Reports & analytics
│       │   │       └── settings/page.tsx  # User settings
│       │   ├── components/
│       │   │   ├── ui/                    # Reusable UI components (Button, Card, Input, etc.)
│       │   │   ├── layout/               # Sidebar, Header, Providers
│       │   │   ├── contacts/             # Contact-specific components
│       │   │   ├── dashboard/            # Dashboard widgets
│       │   │   ├── messages/             # Message components
│       │   │   ├── reports/              # Report components
│       │   │   └── segments/             # Segment components
│       │   ├── lib/
│       │   │   ├── api.ts                # Axios instance with interceptors
│       │   │   └── utils.ts              # Utility functions (cn helper)
│       │   └── hooks/
│       │       └── use-auth.ts           # Authentication context & hook
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   └── shared/
│       ├── src/
│       │   └── index.ts                   # Shared TypeScript type definitions
│       └── package.json
│
├── package.json                           # Root workspace config
├── turbo.json                             # Turborepo pipeline config
├── tsconfig.json                          # Root TypeScript config
└── .gitignore
```

### 4.1 Backend Module Structure

Each backend module follows a consistent pattern:

```
modules/<module-name>/
├── <name>.controller.ts    # HTTP request handlers
├── <name>.service.ts       # Business logic & database operations
├── <name>.routes.ts        # Route definitions with middleware
└── <name>.validation.ts    # Input validation rules (where applicable)
```

**Controller** -- Parses request parameters, calls the service, and returns HTTP responses.
**Service** -- Contains business logic, interacts with Prisma, returns data objects.
**Routes** -- Registers Express routes, applies authentication and validation middleware.
**Validation** -- Defines express-validator chains for request body/query validation.

---

## 5. Database Schema

### 5.1 Entity Relationship Overview

```
Organization ──┬── User (role: ADMIN | MANAGER | MEMBER)
               ├── Contact ──┬── ContactTag ── Tag
               │             ├── ContactInterest ── Interest
               │             ├── Interaction
               │             └── Message
               ├── Segment ── SegmentContact ── Contact
               ├── Campaign
               ├── Channel
               ├── Tag
               └── ActivityLog
```

### 5.2 Core Models

#### Organization

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| name | String | Organization name |
| slug | String (unique) | URL-friendly identifier |
| description | String? | Optional description |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

#### User

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| email | String (unique) | Login email |
| password | String | bcrypt-hashed password |
| firstName | String | First name |
| lastName | String | Last name |
| role | UserRole | ADMIN, MANAGER, or MEMBER |
| isActive | Boolean | Account status |
| organizationId | String | Foreign key to Organization |

#### Contact

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| firstName | String | First name |
| lastName | String | Last name |
| email | String? | Email address |
| phone | String? | Phone number |
| gender | Gender? | MALE, FEMALE, NON_BINARY, OTHER, PREFER_NOT_TO_SAY |
| dateOfBirth | DateTime? | Date of birth |
| city | String? | City |
| state | String? | State/Province |
| country | String? | Country |
| source | String? | Acquisition source |
| status | ContactStatus | ACTIVE, INACTIVE, ARCHIVED, BLOCKED |
| notes | String? | Free-text notes |
| externalId | String? | External platform ID |
| organizationId | String | Foreign key to Organization |

#### Message

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| content | String | Message body |
| direction | MessageDirection | INBOUND or OUTBOUND |
| status | MessageStatus | SENT, DELIVERED, READ, FAILED |
| channel | ChannelType | WHATSAPP, INSTAGRAM, FACEBOOK_MESSENGER, EMAIL, SMS |
| externalId | String? | Platform message ID |
| metadata | Json? | Additional platform-specific data |
| contactId | String | Foreign key to Contact |
| organizationId | String | Foreign key to Organization |

#### Segment

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| name | String | Segment name |
| description | String? | Segment description |
| filters | Json | Dynamic filter criteria |
| contactCount | Int | Cached count of matched contacts |
| organizationId | String | Foreign key to Organization |

#### Campaign

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| name | String | Campaign name |
| description | String? | Campaign description |
| status | CampaignStatus | DRAFT, SCHEDULED, SENDING, SENT, CANCELLED |
| channel | ChannelType | Target channel |
| content | String | Message template |
| scheduledAt | DateTime? | Scheduled send time |
| sentAt | DateTime? | Actual send time |
| recipientCount | Int | Number of recipients |
| segmentId | String? | Target segment |
| organizationId | String | Foreign key to Organization |

### 5.3 Enumerations

```
UserRole:        ADMIN | MANAGER | MEMBER
Gender:          MALE | FEMALE | NON_BINARY | OTHER | PREFER_NOT_TO_SAY
ContactStatus:   ACTIVE | INACTIVE | ARCHIVED | BLOCKED
InteractionType: EMAIL | PHONE_CALL | MEETING | WHATSAPP | INSTAGRAM_DM |
                 FACEBOOK_MESSAGE | NOTE | OTHER
MessageDirection: INBOUND | OUTBOUND
MessageStatus:   SENT | DELIVERED | READ | FAILED
ChannelType:     WHATSAPP | INSTAGRAM | FACEBOOK_MESSENGER | EMAIL | SMS
CampaignStatus:  DRAFT | SCHEDULED | SENDING | SENT | CANCELLED
```

### 5.4 Data Isolation

All models that store tenant data include an `organizationId` field. Every query in the service layer is scoped to the authenticated user's `organizationId`, ensuring complete data isolation between tenants.

---

## 6. Backend API Reference

### 6.1 Authentication

All protected endpoints require a `Bearer` token in the `Authorization` header.

#### POST /api/auth/register

Register a new user and create an organization.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "organizationName": "My Organization"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ADMIN"
  },
  "token": "jwt-token-string"
}
```

#### POST /api/auth/login

Authenticate an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "user": { ... },
  "token": "jwt-token-string"
}
```

#### GET /api/auth/profile

Get the authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "ADMIN",
  "organization": {
    "id": "uuid",
    "name": "My Organization"
  }
}
```

---

### 6.2 Contacts

All endpoints require authentication.

#### GET /api/contacts

List contacts with pagination, search, and filtering.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |
| search | string | Search by name, email, or phone |
| status | string | Filter by ContactStatus |
| gender | string | Filter by Gender |
| city | string | Filter by city |
| tag | string | Filter by tag ID |

**Response (200):**
```json
{
  "data": [ { "id": "uuid", "firstName": "...", ... } ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### GET /api/contacts/:id

Get a single contact with interactions and recent messages.

#### POST /api/contacts

Create a new contact.

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "gender": "FEMALE",
  "city": "New York",
  "status": "ACTIVE"
}
```

#### PUT /api/contacts/:id

Update a contact.

#### DELETE /api/contacts/:id

Delete a contact.

#### POST /api/contacts/:id/tags

Add a tag to a contact.

**Request Body:**
```json
{ "tagId": "uuid" }
```

#### DELETE /api/contacts/:id/tags/:tagId

Remove a tag from a contact.

#### POST /api/contacts/:id/interactions

Add an interaction to a contact.

**Request Body:**
```json
{
  "type": "MEETING",
  "notes": "Discussed partnership opportunities",
  "date": "2026-03-25T10:00:00Z"
}
```

#### GET /api/contacts/stats

Get contact statistics (total count, status breakdown, source breakdown).

---

### 6.3 Segmentation

#### GET /api/segments

List all segments for the organization.

#### GET /api/segments/:id

Get a segment with its matched contacts.

#### POST /api/segments

Create a new segment.

**Request Body:**
```json
{
  "name": "Active Women in NYC",
  "description": "Active female contacts based in New York",
  "filters": {
    "gender": "FEMALE",
    "status": "ACTIVE",
    "city": "New York"
  }
}
```

#### PUT /api/segments/:id

Update a segment.

#### DELETE /api/segments/:id

Delete a segment.

#### POST /api/segments/:id/apply

Apply segment filters and match contacts. Updates the segment's contact list and count.

#### GET /api/segments/tags/all

List all tags for the organization.

#### POST /api/segments/tags

Create a new tag.

**Request Body:**
```json
{
  "name": "VIP",
  "color": "#FFD700"
}
```

#### DELETE /api/segments/tags/:id

Delete a tag.

---

### 6.4 Messaging

#### GET /api/messages/conversations

List conversations grouped by contact (most recent message per contact).

#### GET /api/messages/:contactId

Get all messages for a specific contact.

**Query Parameters:** `channel` (optional filter by channel type)

#### POST /api/messages/:contactId/send

Send a message to a contact.

**Request Body:**
```json
{
  "content": "Hello! How are you?",
  "channel": "WHATSAPP"
}
```

#### GET /api/messages/stats

Get message statistics (total, by channel, by status).

---

### 6.5 Reports

#### GET /api/reports/dashboard

Get dashboard overview statistics.

**Response (200):**
```json
{
  "totalContacts": 1250,
  "activeContacts": 980,
  "totalSegments": 15,
  "totalMessages": 5430,
  "contactGrowth": [
    { "month": "2025-10", "count": 45 },
    { "month": "2025-11", "count": 62 }
  ],
  "contactsByGender": { "MALE": 520, "FEMALE": 680, ... },
  "contactsByStatus": { "ACTIVE": 980, "INACTIVE": 200, ... },
  "contactsBySource": { "website": 400, "referral": 350, ... }
}
```

#### GET /api/reports/engagement

Get engagement metrics for the last 30 days.

**Response (200):**
```json
{
  "interactionsByType": { "EMAIL": 120, "MEETING": 45, ... },
  "messagesByChannel": { "WHATSAPP": 890, "EMAIL": 340, ... },
  "recentInteractions": [ ... ]
}
```

---

### 6.6 Meta Integration

#### GET /api/meta/webhook

Meta webhook verification endpoint. Responds with the `hub.challenge` when `hub.verify_token` matches.

#### POST /api/meta/webhook

Receives incoming webhook events from Meta platforms (WhatsApp, Instagram, Messenger). Processes messages and stores them in the database.

#### GET /api/meta/channels

List configured communication channels.

#### POST /api/meta/channels

Create a new channel configuration.

**Request Body:**
```json
{
  "name": "WhatsApp Business",
  "type": "WHATSAPP",
  "config": {
    "phoneNumberId": "...",
    "accessToken": "..."
  }
}
```

#### POST /api/meta/channels/:id

Update a channel configuration.

---

## 7. Frontend Application

### 7.1 Page Structure

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Redirects to dashboard or login |
| `/login` | Login | Email/password authentication |
| `/register` | Register | User & organization registration |
| `/dashboard` | Dashboard | Overview stats, charts, recent activity |
| `/contacts` | Contacts | Searchable, filterable contact list |
| `/contacts/[id]` | Contact Detail | Contact info, interactions, messages |
| `/segments` | Segments | Create and manage audience segments |
| `/messages` | Messages | Conversation list and messaging interface |
| `/reports` | Reports | Analytics dashboards and engagement reports |
| `/settings` | Settings | User profile and account settings |

### 7.2 Component Architecture

**UI Components (Radix + Tailwind):**
- `Button` -- Variants: default, destructive, outline, secondary, ghost, link
- `Card` -- CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- `Input` -- Styled text input with label support
- `Badge` -- Status and category indicators
- `Table` -- Data tables with header, body, row, cell sub-components
- `Dialog` -- Modal dialogs for forms and confirmations
- `Select` -- Dropdown selection component
- `Tabs` -- Tab-based content navigation

**Layout Components:**
- `Sidebar` -- Main navigation with icons, collapsible
- `Header` -- Top bar with user info and actions
- `Providers` -- React Query provider and theme configuration

### 7.3 Data Flow

```
User Action
    │
    ▼
React Hook Form (validation via Zod)
    │
    ▼
React Query Mutation / Query
    │
    ▼
Axios Instance (auto-injects JWT token)
    │
    ▼
Express API Endpoint
    │
    ▼
Controller → Service → Prisma → PostgreSQL
    │
    ▼
Response flows back through the chain
    │
    ▼
React Query Cache Update → UI Re-render
    │
    ▼
Sonner Toast Notification (success/error)
```

### 7.4 Authentication Flow

1. User submits login form (React Hook Form + Zod validation)
2. Axios sends POST to `/api/auth/login`
3. Backend validates credentials, returns JWT token
4. Token stored in `localStorage` via `use-auth` hook
5. Axios interceptor injects token into all subsequent requests
6. On 401 response, interceptor clears token and redirects to `/login`
7. Dashboard layout checks auth state on mount, redirects unauthenticated users

### 7.5 State Management

| Type | Tool | Usage |
|------|------|-------|
| Server State | React Query | API data fetching, caching, background refetching |
| Auth State | React Context | User profile, token, login/logout actions |
| Form State | React Hook Form | Controlled forms, validation, submission |
| UI State | React useState | Modals, dropdowns, local component state |

---

## 8. Authentication & Security

### 8.1 Authentication Mechanism

- **Strategy:** JWT (JSON Web Tokens) via Passport.js
- **Token Expiry:** 7 days (configurable via `JWT_EXPIRES_IN`)
- **Password Storage:** bcryptjs hashing with salt rounds
- **Token Transport:** Bearer token in Authorization header

### 8.2 Authorization

Role-based access control with three levels:

| Role | Permissions |
|------|------------|
| **ADMIN** | Full access: user management, organization settings, all modules |
| **MANAGER** | Contact management, segmentation, messaging, reports |
| **MEMBER** | View contacts, view messages, basic operations |

### 8.3 Security Measures

| Measure | Implementation |
|---------|---------------|
| **HTTP Headers** | Helmet.js sets secure headers (X-Frame-Options, CSP, HSTS, etc.) |
| **CORS** | Configured to allow only the frontend origin |
| **SQL Injection** | Prisma ORM parameterizes all queries |
| **Input Validation** | express-validator on all endpoints |
| **Password Security** | bcryptjs with industry-standard salt rounds |
| **Token Security** | JWT with configurable secret and expiration |
| **Data Isolation** | All queries scoped to user's `organizationId` |
| **Error Handling** | Centralized error handler; no stack traces in production |
| **Request Logging** | Morgan for HTTP request logging |

---

## 9. Meta API Integration

### 9.1 Supported Platforms

- **WhatsApp Business API** -- Send/receive WhatsApp messages
- **Instagram Direct Messages** -- Receive Instagram DMs via webhook
- **Facebook Messenger** -- Receive Messenger messages via webhook

### 9.2 Webhook Flow

```
Meta Platform → POST /api/meta/webhook
    │
    ▼
Parse webhook payload (WhatsApp / Instagram / Messenger)
    │
    ▼
Match contact by phone number or external ID
    │
    ▼
Create contact if not found (auto-registration)
    │
    ▼
Store message with channel, direction (INBOUND), and metadata
```

### 9.3 Webhook Verification

Meta requires webhook verification during setup:

1. Meta sends GET request with `hub.mode`, `hub.verify_token`, `hub.challenge`
2. Backend validates `hub.verify_token` against `META_WEBHOOK_VERIFY_TOKEN`
3. Returns `hub.challenge` to complete verification

### 9.4 Outbound Messages

WhatsApp outbound messaging is supported via the Meta Cloud API:

```
POST /api/messages/:contactId/send
    │
    ▼
Meta Service sends message via WhatsApp Cloud API
    │
    ▼
Stores message record with status SENT
```

### 9.5 Channel Configuration

Channels store API credentials and settings for each platform:

```json
{
  "name": "WhatsApp Business",
  "type": "WHATSAPP",
  "isActive": true,
  "config": {
    "phoneNumberId": "META_PHONE_NUMBER_ID",
    "accessToken": "META_ACCESS_TOKEN"
  }
}
```

---

## 10. Configuration & Environment

### 10.1 Environment Variables

Create a `.env` file in `apps/backend/` based on `.env.example`:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/modular_crm?schema=public

# Authentication
JWT_SECRET=your-secure-jwt-secret-key
JWT_EXPIRES_IN=7d

# Server
PORT=4000
NODE_ENV=development

# Meta API Integration
META_APP_ID=your-meta-app-id
META_APP_SECRET=your-meta-app-secret
META_WEBHOOK_VERIFY_TOKEN=your-webhook-verify-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-whatsapp-access-token

# Frontend
FRONTEND_URL=http://localhost:3000
```

### 10.2 TypeScript Configuration

**Backend (`apps/backend/tsconfig.json`):**
- Target: ES2020
- Module: CommonJS
- Strict mode enabled
- Path aliases: `@/*` maps to `src/*`
- Output: `dist/` directory

**Frontend (`apps/frontend/tsconfig.json`):**
- Target: ES2017
- Module: ESNext
- JSX: Preserve (Next.js handles compilation)
- Path aliases: `@/*` maps to `./src/*`

### 10.3 Turborepo Pipeline (`turbo.json`)

```json
{
  "tasks": {
    "build": { "dependsOn": ["^build"] },
    "dev":   { "cache": false, "persistent": true },
    "lint":  { "dependsOn": ["build"] },
    "db:generate": { "cache": false },
    "db:push":     { "cache": false },
    "db:migrate":  { "cache": false },
    "db:studio":   { "cache": false }
  }
}
```

---

## 11. Development Guide

### 11.1 Prerequisites

- **Node.js** >= 18.0.0
- **PostgreSQL** running locally or remotely
- **npm** (comes with Node.js)

### 11.2 Initial Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd "Modular CRM Developer for Community Management and Institutional Relations"

# 2. Install all dependencies (monorepo-aware)
npm install

# 3. Configure environment
cp apps/backend/.env.example apps/backend/.env
# Edit .env with your database credentials and secrets

# 4. Set up the database
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database

# 5. Start development servers
npm run dev            # Starts both frontend (3000) and backend (4000)
```

### 11.3 Available Commands

| Command | Scope | Description |
|---------|-------|-------------|
| `npm run dev` | All | Start all services in development mode |
| `npm run build` | All | Build all packages for production |
| `npm run lint` | All | Run ESLint across all workspaces |
| `npm run dev:backend` | Backend | Start only the backend server |
| `npm run dev:frontend` | Frontend | Start only the frontend server |
| `npm run db:generate` | Backend | Generate Prisma client from schema |
| `npm run db:push` | Backend | Push schema changes to database |
| `npm run db:migrate` | Backend | Create a new database migration |
| `npm run db:studio` | Backend | Open Prisma Studio (database GUI) |

### 11.4 Adding a New Backend Module

1. Create the module directory:
   ```
   apps/backend/src/modules/<module-name>/
   ```

2. Create the module files:
   - `<name>.controller.ts` -- Request handlers
   - `<name>.service.ts` -- Business logic
   - `<name>.routes.ts` -- Route definitions
   - `<name>.validation.ts` -- Validation rules (optional)

3. Register routes in `apps/backend/src/app.ts`:
   ```typescript
   import { moduleRoutes } from './modules/<module-name>/<name>.routes';
   app.use('/api/<module-name>', authenticate, moduleRoutes);
   ```

4. Add shared types in `packages/shared/src/index.ts` if needed.

### 11.5 Adding a New Frontend Page

1. Create the page file under the appropriate route group:
   ```
   apps/frontend/src/app/(dashboard)/<page-name>/page.tsx
   ```

2. Add a navigation entry in `apps/frontend/src/components/layout/sidebar.tsx`.

3. Create feature-specific components in:
   ```
   apps/frontend/src/components/<page-name>/
   ```

### 11.6 Database Changes

1. Edit `apps/backend/prisma/schema.prisma`
2. Run `npm run db:generate` to update Prisma client
3. Run `npm run db:push` (development) or `npm run db:migrate` (production)

---

## 12. Deployment

### 12.1 Build for Production

```bash
# Build all packages
npm run build

# Backend output: apps/backend/dist/
# Frontend output: apps/frontend/.next/
```

### 12.2 Environment Requirements

| Service | Requirement |
|---------|------------|
| Backend | Node.js >= 18, PostgreSQL access |
| Frontend | Node.js >= 18 (for Next.js server) |
| Database | PostgreSQL 14+ recommended |

### 12.3 Deployment Options

**Option A: Traditional Server (VPS)**
```bash
# Backend
cd apps/backend
NODE_ENV=production node dist/app.js

# Frontend
cd apps/frontend
npm run start    # Starts Next.js production server
```

**Option B: Docker**
- Create Dockerfiles for backend and frontend
- Use docker-compose for orchestration with PostgreSQL

**Option C: Platform-as-a-Service**
- **Backend:** Railway, Render, Fly.io
- **Frontend:** Vercel (optimized for Next.js)
- **Database:** Supabase, Neon, Railway PostgreSQL

### 12.4 Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use a strong, unique `JWT_SECRET`
- [ ] Configure `FRONTEND_URL` for CORS
- [ ] Run database migrations (`npm run db:migrate`)
- [ ] Set up SSL/TLS for all endpoints
- [ ] Configure Meta webhook URLs for production domain
- [ ] Enable request rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy for PostgreSQL

---

## 13. Extending the System

### 13.1 Planned Enhancements

| Feature | Description | Module |
|---------|-------------|--------|
| Campaign Automation | Scheduled message sending to segments | messaging |
| Contact Import/Export | CSV file upload and download | contacts |
| Custom Fields | User-defined contact fields per organization | contacts |
| Advanced Analytics | Cohort analysis, engagement scoring | reports |
| Workflow Automation | Trigger-based actions on contact events | New module |
| API Rate Limiting | Request throttling per user/organization | middleware |
| Message Templates | Reusable message templates with variables | messaging |
| SSO Integration | OAuth/SAML single sign-on support | auth |
| Audit Log UI | Frontend for viewing activity logs | New page |
| Mobile App | React Native companion app | New workspace |

### 13.2 Integration Points

The system is designed for extensibility at these points:

- **New Modules:** Add to `apps/backend/src/modules/` following the existing pattern
- **New Channels:** Extend the `ChannelType` enum and add processing logic in meta-integration
- **New Pages:** Add to `apps/frontend/src/app/(dashboard)/`
- **Shared Types:** Extend `packages/shared/src/index.ts`
- **Middleware:** Add to `apps/backend/src/middleware/`
- **Webhooks:** Extend the meta-integration module for new event types

### 13.3 Key Conventions

1. All database queries must include `organizationId` for multi-tenancy
2. New routes must use the `authenticate` middleware
3. Input validation is required on all POST/PUT endpoints
4. Frontend API calls go through the central Axios instance (`lib/api.ts`)
5. Use React Query for all server state management
6. Follow the existing component structure with Radix UI primitives + Tailwind

---

*This technical manual covers the complete architecture, implementation, and operational guide for the Modular CRM system. For questions or contributions, refer to the project repository.*
