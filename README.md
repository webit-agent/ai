Project Brief: Competitor Tracker
Overview

I want to build a Competitor Tracker — a web-based SaaS tool that helps businesses (initially small to medium-sized e-commerce stores and online businesses) monitor their competitors automatically. Instead of manually checking competitor websites, the tool tracks price changes, new products, marketing content, and other public signals, then delivers insights and alerts to the user.

Market Analysis & Competitive Landscape

This is a proven market — several established players exist, which validates demand but also means differentiation is essential.

Existing Competitors
Tool	Starting Price	Notes
Prisync	$99–$399/month	Market leader; unlimited competitor tracking, dynamic pricing engine, 4.8/5 rating
Price2Spy	From $99/month (URL-based)	Flexible monitoring + automated repricing
Minderest	Custom (Enterprise)	AI-driven pricing platform
PriceShape	Custom	Focuses on turning market data into pricing strategy
Price Observatory	€2,500/year	Large enterprise-focused solution
PageCrawl	Variable	General website monitoring with automatic price detection

Nearly all major players target medium-to-large e-commerce businesses managing hundreds or thousands of SKUs — not small store owners with a handful of products to track.

Common Problems Reported by Existing Users

These recurring complaints represent clear opportunities for differentiation:

Scraping reliability issues — Tools frequently fail to extract accurate prices from non-standard e-commerce platforms or sites that change their HTML structure, leading to missing or incorrect data.
No alerts for broken tracking links — When a competitor's URL breaks or changes, most tools don't notify the user; the issue is only discovered after data has already been missed for a while.
Heavy manual maintenance — Users must manually update tracked URLs whenever a competitor changes their product pages, which is time-consuming.
Key features locked behind expensive tiers — Basic features like historical price charts are often reserved for the most expensive plan, which users find frustrating and overpriced.
Inconsistent customer support quality — Reviews are polarized: some users report excellent support, others report unresponsive or inaccurate support that led to real financial losses (e.g., selling at outdated prices).
Complex, lengthy onboarding — Initial setup and ongoing link maintenance can be tedious, especially for non-technical users.
Identified Market Gap & Opportunity

There is a clear underserved segment: small store owners and solo entrepreneurs who only need to track a handful of competitors/products and don't want to pay $99+/month for enterprise-grade tooling. A differentiated approach could focus on:

Simple, affordable pricing — a single straightforward tier (e.g., $10–$25/month) instead of 3–4 confusing tiers
Proactive broken-link detection — automatically alert users when a tracked page stops returning valid data, instead of failing silently
Price history included from day one — not locked behind the top-tier plan
A much simpler onboarding experience — built for non-technical small business owners, not enterprise pricing teams
Target Users
Small to medium e-commerce store owners
Marketing teams who need to stay aware of competitor pricing/positioning
Freelance consultants managing competitive analysis for clients
Tech Stack (planned)
Frontend: Deployed on Netlify (React or similar SPA framework)
Backend: Node.js/Python API hosted on a VPS, behind Nginx as a reverse proxy
Database: PostgreSQL (or similar relational DB) for storing tracked competitors, price history, and user data
Scheduled jobs: Cron jobs on the VPS for periodic scraping/checking of competitor pages
Notifications: Email (initially), Telegram Bot integration (for real-time alerts)
Auth: JWT-based authentication, since frontend and backend are on separate domains
AI Integration: Anthropic API (Claude) for generating human-readable summaries and insights from raw tracked data
Core Concept (MVP — Phase 1)

Build the simplest version that works end-to-end:

User can sign up and log in
User adds a single competitor by entering a product page URL
System checks the page periodically (e.g., every 1-2 hours) and extracts the price
System stores a historical log of price changes
When a price change is detected, the user receives a simple email notification
A basic dashboard shows a table of tracked prices over time
Phase 2 Features (after MVP validation)
Support tracking multiple competitors and multiple products per competitor
Visual price history charts (line graphs over time)
Side-by-side comparison view across multiple competitors
Detection of new products added or products removed from a competitor's catalog
Telegram Bot integration for instant push notifications
Customizable alert thresholds (e.g., "notify me only if price drops more than 10%")
Weekly/monthly digest email summarizing all detected changes
Phase 3 Features (advanced / differentiation layer)
AI-generated insights: Instead of showing raw data, use an LLM to generate natural-language summaries (e.g., "Competitor X raised prices on 3 products this week, likely due to seasonal demand")
Trend prediction: Basic pattern detection based on historical data (e.g., recurring monthly discount cycles)
Marketing content monitoring: Track homepage/landing page changes via periodic screenshots and diffing
Review monitoring: Track competitor reviews on Google/Trustpilot to surface common customer complaints
Job posting monitoring: Track competitor hiring activity (via LinkedIn Jobs or similar) as a signal of business expansion
News monitoring: Automated search for competitor mentions in news/press releases
"Competitor Strength Score": A calculated metric based on factors like update frequency, product range growth, and marketing activity
PDF report generation: Professionally formatted weekly/monthly reports suitable for sharing with stakeholders
Team collaboration: Multi-user accounts with roles (Admin/Viewer), internal notes/comments on each tracked competitor
Public API: Allow advanced users to pull their tracked data programmatically
Browser extension: A companion extension that lets users add a competitor to tracking directly from any product page with one click
Integrations: Export reports to Google Sheets, send alerts to Slack/Discord channels
Key Technical Considerations
Scraping reliability: Competitor websites may change their HTML structure; the scraping logic needs to be resilient and easy to update per-target
Rate limiting & ethics: Checks should be spaced out reasonably to avoid overloading target sites or triggering anti-bot measures; respect robots.txt where applicable
Legal considerations: Only track publicly available data; avoid scraping data that requires login or violates a site's terms of service
Scalability: Design the database schema and job scheduling system so that adding more tracked competitors/products doesn't require major architecture changes later
CORS & security: Frontend (Netlify) and backend (VPS) are on different domains — proper CORS configuration and HTTPS are required throughout
What I Need Help With

Please review this brief and help me:

Suggest a clean database schema for the MVP (users, competitors, products, price_history, alerts)
Recommend the best approach for the scraping/checking mechanism (libraries, scheduling strategy)
Outline the core API endpoints needed for the MVP
Flag any technical risks or considerations I might be missing
Suggest a realistic order of implementation to go from MVP to Phase 2 features
Advise on how to build in the differentiators identified above (broken-link detection, included price history, simple pricing) without overcomplicating the MVP
Constraints
I'm currently working primarily from a mobile device with limited access to a desktop computer
I have a VPS ready for backend hosting and a Netlify account for frontend hosting
I'm looking for a pragmatic, incremental approach rather than trying to build everything at once
