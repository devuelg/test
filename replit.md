# FitFramework Pro - Replit Development Guide

## Overview

FitFramework Pro is a comprehensive fitness application that combines a modern React frontend with an Express.js backend, featuring advanced BMR calculations, workout planning, nutrition tracking, and an extensible plugin system. The application integrates a Python-based calculation framework for complex fitness computations and uses WebSocket connections for real-time updates.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a full-stack architecture with clear separation between frontend, backend, and data layers:

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom neumorphic design system
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Updates**: WebSocket client for live data streaming

### Backend (Node.js + Express)
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **WebSocket Server**: Native WebSocket implementation for real-time features

### Database Layer
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Migrations**: Drizzle Kit for database schema management

### Python Integration
- **Calculation Engine**: Python framework for BMR calculations and fitness computations
- **Communication**: JSON-based stdin/stdout communication bridge
- **Extensibility**: Plugin-based architecture for future calculation methods

## Key Components

### Authentication System
- **Provider**: Replit Auth integration
- **Session Storage**: PostgreSQL-backed sessions
- **Security**: HTTP-only cookies with CSRF protection
- **User Management**: Automatic user creation and profile synchronization

### Database Schema
The application uses a comprehensive schema with the following core entities:
- **Users**: Authentication and basic profile information
- **UserProfiles**: Detailed fitness data (age, weight, height, goals)
- **BMRCalculations**: Historical calculation results with metadata
- **WorkoutPlans/Workouts**: Exercise planning and tracking
- **NutritionEntries/NutritionGoals**: Food intake and dietary targets
- **Plugins**: Extensible calculation and feature modules
- **Experiments**: A/B testing framework for feature rollouts
- **FrameworkEvents**: System monitoring and analytics

### Frontend Architecture
- **Component Structure**: Modular dashboard tabs (Dashboard, Workouts, Nutrition, Analytics, Plugins)
- **UI System**: Neumorphic design with gradient accents and shadow effects
- **Real-time Features**: WebSocket integration for live system updates
- **Theme Support**: Light/dark mode with system preference detection

### Python Framework Integration
- **BMR Calculations**: Multiple calculation methods (Mifflin-St Jeor, Harris-Benedict)
- **Plugin System**: Extensible architecture for custom calculations
- **Health Monitoring**: System performance and calculation tracking
- **Structured Logging**: Comprehensive event logging for debugging

## Data Flow

### User Authentication Flow
1. User accesses application
2. Replit Auth redirects to OAuth provider
3. Successful authentication creates/updates user record
4. Session established with PostgreSQL storage
5. Frontend receives user data and enables authenticated features

### BMR Calculation Flow
1. Frontend requests BMR calculation with user profile data
2. Backend validates request and prepares Python framework command
3. Python process executes calculation using specified method
4. Results returned via JSON response and stored in database
5. Frontend displays results with historical comparison

### Real-time Update Flow
1. WebSocket connection established on user login
2. Backend periodically broadcasts system metrics
3. Frontend receives updates and refreshes dashboard components
4. Plugin status changes and calculations trigger immediate updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for Neon database
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/react-***: Accessible UI component primitives
- **drizzle-orm**: Type-safe database ORM
- **express**: Web application framework
- **passport**: Authentication middleware

### Development Dependencies
- **Vite**: Frontend build tool and development server
- **TypeScript**: Static type checking
- **Tailwind CSS**: Utility-first CSS framework
- **esbuild**: Fast JavaScript bundler for production builds

### Python Dependencies
- **Standard Library**: JSON, logging, datetime, math for core functionality
- **No External Packages**: Self-contained Python framework for reliability

## Deployment Strategy

### Development Environment
- **Frontend**: Vite development server with HMR
- **Backend**: tsx for TypeScript execution with live reload
- **Database**: Neon PostgreSQL with connection pooling
- **Python**: Direct process spawning for calculations

### Production Build
- **Frontend**: Static asset generation with Vite
- **Backend**: esbuild compilation to optimized JavaScript
- **Deployment**: Single Node.js process serving both API and static files
- **Database**: Production PostgreSQL with connection pooling

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **SESSION_SECRET**: Session encryption key (required)
- **REPLIT_DOMAINS**: Authentication domain configuration
- **NODE_ENV**: Environment mode (development/production)

### Scalability Considerations
- **Database**: Connection pooling prevents connection exhaustion
- **Python Framework**: Stateless design allows horizontal scaling
- **WebSocket**: Single-process limitation, can be extracted to separate service
- **Plugin System**: Modular architecture supports feature expansion without core changes

The application is designed for easy deployment on Replit with automatic database provisioning and seamless integration with Replit's authentication system. The Python framework provides a foundation for complex fitness calculations while maintaining clean separation from the main application logic.