# VoyAI Copilot Instructions

This file provides custom instructions for working with the VoyAI codebase in GitHub Copilot.

## Project Overview

VoyAI is an AI travel agent SaaS built with:
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI**: Shadcn/UI
- **Database**: PostgreSQL (Supabase) + Prisma ORM
- **State**: Zustand
- **AI**: Claude API (Anthropic)
- **Payments**: Stripe
- **APIs**: SerpAPI (flights), Booking.com (hotels), Mapbox (maps)

## Code Style & Patterns

### Component Structure
- Functional components only
- `'use client'` for interactive components
- Props interfaces at top of file
- Component composition over inheritance

### API Routes
- Use Next.js App Router `/api/` directory
- Always authenticate (Supabase) before processing
- Validate input with Zod
- Return consistent JSON responses
- Include proper error handling

### Database
- Prisma ORM for all database access
- Use singleton pattern for Prisma client (`src/lib/prisma.ts`)
- Include proper relations and cascading deletes
- Update timestamps on mutations

### State Management
- Zustand for global state
- Persist sensitive UI state (draft trips)
- Use clear action names
- Keep slices focused and small

### Types
- All types defined in `src/types/`
- Export interfaces, not types
- Use strict typing (no `any`)
- Keep types close to usage

## Folder Structure

Follow the exact structure in root `/src`:
- `app/` - Pages and API routes (App Router)
- `components/` - React components
  - `ui/` - Shadcn components
  - `layout/`, `trip/`, `search/`, `ai/`, `map/` - Feature components
- `lib/` - Utilities (Prisma, Supabase, Redis, etc.)
- `hooks/` - React hooks
- `store/` - Zustand stores
- `types/` - TypeScript interfaces
- `middleware.ts` - Auth middleware

## Common Tasks

### Adding an API Endpoint
1. Create route file: `src/app/api/[feature]/[action]/route.ts`
2. Import auth: `const supabase = createClient()`
3. Validate input: `schema.parse(await req.json())`
4. Access database: `await prisma.model.findUnique(...)`
5. Return JSON response

### Adding a Component
1. Create in appropriate folder under `src/components/`
2. Export named function component
3. Add `'use client'` if interactive
4. Import styles/components at top
5. Document complex props with JSDoc

### Adding a Database Model
1. Update `prisma/schema.prisma`
2. Run: `npx prisma db push`
3. Use in API routes with Prisma client

### Connecting to External Services
1. Add API key to `.env.local`
2. Create service file in `src/lib/`
3. Export main function(s)
4. Implement caching where appropriate

## Authentication

- **Service**: Supabase Auth
- **Flow**: Client -> Supabase -> App
- **Protection**: Middleware checks auth on protected routes
- **Database**: Link with `supabaseId` field on User model

## Important Files

- `.env.local` - Environment variables (template: `.env.local.example`)
- `src/middleware.ts` - Auth protection & redirects
- `src/lib/prisma.ts` - Database client singleton
- `src/app/api/` - All API endpoints
- `prisma/schema.prisma` - Database schema
- `tsconfig.json` - TS configuration with `@/*` alias

## Common Gotchas

1. **Supabase SSR**: Must use `@supabase/ssr` package
2. **Prisma Multiple Instances**: Use singleton pattern
3. **IATA Codes**: Use 3-letter codes (e.g., "LAX" not "Los Angeles")
4. **Caching**: Flight/hotel results cached in Redis (15-30 min)
5. **Rate Limiting**: Free tier: 10 AI requests/hour, 30 searches/min
6. **Stripe Webhooks**: Must read raw body before parsing

## Testing
- Run `npm run lint` for linting
- Run `npm run type-check` for type validation
- Test API routes with curl or Postman
- Use browser DevTools for client debugging

## Deployment
- **Host**: Vercel
- **Database**: Supabase PostgreSQL
- **Environment**: Set vars in Vercel dashboard
- **Webhooks**: Configure Stripe webhooks in dashboard

## AI System Prompts

### Trip Planner
Generates full JSON itineraries with activities, restaurants, and tips. System prompt in `src/lib/anthropic.ts`.

### Chat Refinement
(To be implemented) Refine existing itineraries through conversation.

## Performance Tips

- Use Redis caching for API responses
- Paginate database queries
- Optimize images with Next.js Image
- Use React.memo for expensive components
- Implement rate limiting on public endpoints
- Monitor N+1 query problems in Prisma

## Next.js Features Used

- App Router (not Pages Router)
- Server Components (default)
- Client Components (`'use client'` opt-in)
- API Routes (`src/app/api/`)
- Middleware (`src/middleware.ts`)
- Environment Variables (`.env.local`)
- Image Optimization (next/image)

---

Last updated: April 2026
