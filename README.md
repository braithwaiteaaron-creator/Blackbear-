# Bear Hub Pro - Tree Care Management System

A professional job and quote management system built for Blackbear tree care services. Manage customers, jobs, quotes, and transactions all in one place instead of using notepad.

## ✨ Features

### 📋 Job Management
- Create and track tree care jobs (removals, trimming, stump grinding, etc.)
- Set job status (Quote, Scheduled, In Progress, Completed, Cancelled)
- Track job values and requirements (permits, clearance, climbing)
- Add detailed notes and tree types
- Upload photos and documentation
- Quick view job details

### 💰 Quote Management
- Generate professional quotes with auto-numbered quote IDs
- Track quote status (Pending, Sent, Approved, Declined, Expired)
- Link quotes to customers
- Set quote validity dates
- Monitor pending quotes at a glance

### 👥 Customer Management
- Store complete customer information (name, email, phone, address)
- Track customer history and notes
- Monitor total jobs and spending per customer
- Quick access to customer details

### 📊 Dashboard Overview
- Real-time statistics (total customers, active jobs, pending quotes, completed jobs)
- Color-coded status indicators
- Quick action buttons for creating new records
- Professional dark theme UI

## 🛠 Technology Stack

- **Frontend**: Next.js 16 with TypeScript & Turbopack
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📁 Database Schema

Your Supabase database includes the following tables:

- **customers** - Client information and metrics
- **jobs** - Tree care work orders with status tracking
- **quotes** - Service quotes with auto-generated numbers
- **leads** - Potential customers and opportunities
- **agents** - Team member profiles and performance
- **transactions** - Payment tracking and revenue
- **route_stops** - Job scheduling and route planning
- **spotted_damage** - Potential damage opportunities with GPS

## 🔧 Core Features Ready to Use

1. **Add Customers** - Build your customer database
2. **Create Jobs** - Log tree care work with all details
3. **Generate Quotes** - Professional quote system with status tracking
4. **Track Progress** - Monitor jobs from quote to completion
5. **View Statistics** - Dashboard with real-time business metrics

## 📝 Environment Variables

Configure these in `.env.development.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🚢 Deploy on Vercel

The easiest way to deploy is to use the [Vercel Platform](https://vercel.com):

```bash
npm run build
vercel deploy
```

---

**Built with ❤️ for Blackbear Tree Care** | Replace your notepad with a professional system
