# DataPath.ai Roadmap Application

## Overview

DataPath.ai is a personalized learning platform for aspiring Data Analysts. The application provides customized learning roadmaps based on user questionnaires, tracks progress through learning modules, and offers an admin dashboard for management. Built as a full-stack web application with a React frontend and Express backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful endpoints under `/api` prefix
- **Session Management**: Express sessions with PostgreSQL storage
- **Authentication**: Replit OAuth integration with OpenID Connect

### Data Storage Solutions
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM with schema-first approach
- **Migrations**: Drizzle Kit for database schema management
- **Connection**: Connection pooling via @neondatabase/serverless

## Key Components

### Authentication System
- **Provider**: Replit OAuth via OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions (mandatory for Replit Auth)
- **Email Verification**: Token-based email verification with nodemailer
- **Authorization**: Role-based access (admin/user) with middleware protection

### User Management
- **User Profiles**: First name, last name, email, profile image
- **Admin System**: Admin flag for access to management dashboard
- **Email Verification**: Required for full platform access

### Learning System
- **Questionnaires**: Multi-step assessment for personalized roadmaps
- **Learning Modules**: Structured content with progress tracking
- **Progress Tracking**: Status-based progression (not_started, in_progress, completed)
- **Roadmap Configuration**: Personalized learning paths based on assessment

### UI Components
- **Design System**: shadcn/ui with "new-york" style variant
- **Theme**: Neutral base color with CSS variables
- **Responsive**: Mobile-first design with Tailwind breakpoints
- **Accessibility**: Radix UI primitives ensure WCAG compliance

## Data Flow

### User Onboarding
1. User authenticates via Replit OAuth
2. Email verification required before platform access
3. Questionnaire completion for roadmap personalization
4. Automatic redirect to personalized dashboard

### Learning Progress
1. User selects learning modules from roadmap
2. Progress updates sent to backend via API
3. Real-time progress tracking and statistics
4. Achievement system for completed modules

### Admin Management
1. Admin authentication and role verification
2. User management and progress monitoring
3. System analytics and user engagement metrics

## External Dependencies

### Authentication & Infrastructure
- **Replit Auth**: OAuth provider with OpenID Connect
- **Neon Database**: Serverless PostgreSQL hosting
- **Email Service**: SMTP via nodemailer (configurable provider)

### Frontend Libraries
- **React Ecosystem**: React 18, React DOM, React Query
- **UI Framework**: Radix UI primitives, Tailwind CSS
- **Development**: Vite, TypeScript, ESLint configurations
- **Utilities**: clsx, class-variance-authority, date-fns

### Backend Libraries
- **Core**: Express.js, TypeScript, tsx for development
- **Database**: Drizzle ORM, pg connection pooling
- **Authentication**: passport, openid-client, express-session
- **Email**: nodemailer with SMTP transport
- **Security**: connect-pg-simple for session storage

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution
- **Database**: Replit-provided PostgreSQL with migrations
- **Environment**: Replit-specific optimizations and error overlays

### Production Build
- **Frontend**: Vite build to `dist/public` directory
- **Backend**: esbuild bundle to `dist/index.js`
- **Static Serving**: Express serves built frontend assets
- **Database**: Production PostgreSQL with connection pooling

### Configuration Management
- **Environment Variables**: Database URL, SMTP credentials, session secrets
- **Domain Configuration**: Multi-domain support via REPLIT_DOMAINS
- **Security**: HTTPS enforcement, secure session cookies
- **Monitoring**: Request logging and error handling middleware

The application follows a monorepo structure with shared TypeScript types, clear separation of concerns, and production-ready deployment configuration suitable for Replit hosting.