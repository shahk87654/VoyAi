# VoyAI - Your AI Travel Agent 🌍✨

VoyAI is an intelligent travel planning SaaS application that uses AI to create personalized, complete trip itineraries in minutes. Powered by Claude AI, real-time flight/hotel data, and beautiful interactive maps.

## Features 🚀

- **AI-Powered Trip Planning**: Describe where you want to go, and let Claude AI create a detailed day-by-day itinerary
- **Cheapest Flights Finder**: Search real-time flight prices across 6 popular routes using SerpAPI
- **Real-Time Flight Search**: Integration with SerpAPI for live flight prices and availability
- **Hotel Search & Deals**: Booking.com integration for finding the best accommodation rates
- **Interactive Maps**: Mapbox-powered maps to visualize your trip destinations
- **PDF Export**: Download your complete itinerary as a beautiful, shareable PDF
- **Trip Management**: Save, edit, and organize multiple trips
- **Responsive Design**: Mobile-first UI that works perfectly on all devices
- **User Authentication**: Secure Supabase auth with email/password and OAuth options
- **Payment Integration**: Stripe integration for premium features and subscriptions

## Tech Stack 💻

### Frontend
- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: Shadcn/UI + custom component library
- **State Management**: Zustand
- **Icons**: Lucide React
- **Real-time Updates**: React Hot Toast for notifications

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Caching**: Redis for flight/hotel results
- **Auth**: Supabase Auth with SSR

### External Services
- **AI**: Anthropic Claude API
- **Flights**: SerpAPI
- **Hotels**: Booking.com API
- **Maps**: Mapbox
- **Payments**: Stripe
- **Hosting**: Vercel
- **Database**: Supabase PostgreSQL

## Getting Started 🛫

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (Supabase recommended)
- API keys for:
  - Anthropic Claude
  - SerpAPI
  - Booking.com
  - Mapbox
  - Stripe

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/shahk87654/VoyAI.git
cd VoyAI
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your API keys:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_KEY=your_service_key

# AI
ANTHROPIC_API_KEY=your_claude_api_key

# Flight Search (uses SerpAPI's Google Flights)
SERPAPI_KEY=your_serpapi_key

# Hotel Search
BOOKING_API_KEY=your_booking_key

# Maps
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# Payments
STRIPE_SECRET_KEY=your_stripe_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_public
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Redis (optional, for caching)
REDIS_URL=your_redis_url
```

To get these keys:
- **Supabase**: https://supabase.com/ (Settings > API)
- **Anthropic**: https://console.anthropic.com/
- **SerpAPI**: https://serpapi.com/ (for real-time flight data)
- **Booking.com**: https://booking-api.developer.booking.com/
- **Mapbox**: https://account.mapbox.com/
- **Stripe**: https://dashboard.stripe.com/

4. **Set up the database**
```bash
npx prisma db push
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure 📁

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages (login, signup)
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── builder/       # Trip builder/planner
│   │   ├── dashboard/     # Main dashboard
│   │   ├── settings/      # User settings
│   │   └── trips/         # Trip management
│   ├── api/               # API routes
│   │   ├── ai/plan/       # AI itinerary generation
│   │   ├── search/        # Flight/hotel search
│   │   ├── trips/         # Trip CRUD operations
│   │   ├── auth/          # Authentication
│   │   ├── stripe/        # Payment webhooks
│   │   └── export/pdf/    # PDF export
│   └── page.tsx           # Landing page
├── components/            # Reusable React components
│   ├── ui/                # Shadcn UI components
│   ├── layout/            # Layout components (Navbar, Sidebar)
│   ├── search/            # Search components
│   ├── trip/              # Trip-related components
│   ├── ai/                # AI features components
│   ├── cards/             # Card components
│   ├── itinerary/         # Itinerary display
│   ├── map/               # Map components
│   └── loaders/           # Loading skeletons
├── lib/                   # Utility functions
│   ├── anthropic.ts       # Claude API integration
│   ├── serpapi.ts         # Flight search
│   ├── booking.ts         # Hotel search
│   ├── stripe.ts          # Payment handling
│   ├── prisma.ts          # Database client
│   ├── redis.ts           # Caching
│   ├── ratelimit.ts       # Rate limiting
│   └── supabase/          # Auth utilities
├── types/                 # TypeScript interfaces
│   ├── trip.ts
│   ├── flight.ts
│   ├── hotel.ts
│   └── ai.ts
├── store/                 # Zustand state management
├── styles/                # Global styles & design tokens
└── middleware.ts          # Auth middleware

prisma/
├── schema.prisma          # Database schema

public/                    # Static assets
```

## Key Features in Detail 🎯

### Cheapest Flights Finder
- Real-time searches across 6 popular flight routes (LAX→NYC, LAX→MIA, LAX→ORD, and more)
- Uses SerpAPI's Google Flights data for live pricing
- Sort by lowest price, best savings, or soonest departure
- Caches results for 15 minutes to optimize performance
- Shows airline, departure/arrival times, duration, and stops
- One-click booking integration

### AI Trip Planning
- Send a natural language description of your trip
- Claude AI generates a complete day-by-day itinerary
- Includes activities, restaurants, timings, and travel tips
- Fully customizable and editable

### Flight & Hotel Search
- Real-time pricing from thousands of options
- Advanced filtering (price, duration, airlines, etc.)
- Direct booking through partner APIs
- Price history and trend analysis

### User Authentication
- Secure email/password signup and login
- Google & other OAuth providers
- Email verification
- Password reset functionality
- Profile management

### Trip Management
- Create, read, update, delete trips
- Save draft itineraries
- Share trips with other users
- Collaboration features

### Premium Features
- Unlimited trips (vs. 3 on free tier)
- PDF export of itineraries
- Priority AI processing
- Advanced customization options
- Access to more search filters

## API Endpoints 🔌

### Trip Management
- `GET /api/trips` - Get all user trips
- `POST /api/trips` - Create new trip
- `GET /api/trips/[id]` - Get trip details
- `PUT /api/trips/[id]` - Update trip
- `DELETE /api/trips/[id]` - Delete trip

### AI Planning
- `POST /api/ai/plan` - Generate itinerary

### Search
- `POST /api/search/flights` - Search flights
- `GET /api/search/cheapest-flights` - Find cheapest flights across popular routes
- `POST /api/search/hotels` - Search hotels

### Export
- `POST /api/export/pdf` - Export itinerary as PDF

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Payments
- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/stripe/webhook` - Stripe webhook handler

## Development 👨‍💻

### Running Tests
```bash
npm run test
```

### Linting & Type Checking
```bash
npm run lint
npm run type-check
```

### Building for Production
```bash
npm run build
npm run start
```

### Database Migrations
```bash
npx prisma migrate dev --name migration_name
npx prisma studio  # Open Prisma Studio (GUI)
```

## Performance & Caching ⚡

- Flight/hotel search results cached for 15-30 minutes in Redis
- Rate limiting: 10 AI requests/hour (free), unlimited (pro)
- 30 searches/minute rate limit
- Optimized images with Next.js Image component
- React.memo for expensive components
- Paginated database queries

## Security 🔒

- Environment variables for all credentials
- Supabase auth for user management
- Middleware authentication on protected routes
- Input validation with Zod
- SQL injection prevention with Prisma ORM
- CORS headers on API routes
- Stripe webhook signature verification
- Rate limiting on public endpoints

## Deployment 🚀

### Deploying to Vercel
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy with one click!

```bash
# Or deploy from CLI
vercel
```

### Environment Setup for Production
- Set all `.env.local` variables in Vercel dashboard
- Configure Stripe webhooks pointing to production domain
- Update Supabase auth configuration
- Set up monitoring and error tracking (Sentry, etc.)

## Contributing 🤝

We welcome contributions! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License - see the LICENSE file for details.

## Support & Contact 📧

- GitHub Issues: [Report bugs](https://github.com/shahk87654/VoyAI/issues)
- Email: support@voyai.com
- Twitter: [@VoyAI](https://twitter.com/VoyAI)

## Roadmap 🗺️

- [ ] Collaborative trip planning with real-time sync
- [ ] Mobile app (React Native)
- [ ] Travel insurance integration
- [ ] Flight price alerts
- [ ] Group trip budgeting
- [ ] Social sharing features
- [ ] AI chat refinement of itineraries
- [ ] Integration with calendar apps
- [ ] Multi-language support
- [ ] Accessibility improvements

## Acknowledgments 🙏

- Built with [Next.js](https://nextjs.org/)
- UI powered by [Shadcn/UI](https://ui.shadcn.com/) and [Tailwind CSS](https://tailwindcss.com/)
- AI from [Anthropic Claude](https://www.anthropic.com/)
- Database by [Supabase](https://supabase.com/)
- Hosted on [Vercel](https://vercel.com/)

---

**Happy traveling! 🌍✨**

*Made with ❤️ by the VoyAI team*
