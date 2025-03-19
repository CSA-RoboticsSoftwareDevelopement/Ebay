# Resale - E-commerce Analytics Platform

Resale is an advanced analytics platform for e-commerce sellers, starting with eBay integration. It provides actionable insights, true profit calculations, and competitor analysis that native marketplace tools don't offer.

## Features

- **True Profit Analytics**: Understand your real margins beyond basic sales data
- **Competitor Analysis**: Compare your listings with competitors on price, shipping, and more
- **Sell-Through Rate**: Track how quickly your inventory sells
- **Top-Selling Products**: Identify your best-performing items
- **Admin Dashboard**: Key management and user administration

## Technology Stack

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: Node.js (Next.js API routes)
- **Database**: MySQL
- **Authentication**: JWT-based with secure HTTP-only cookies

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MySQL database

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/resale.git
   cd resale
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your database credentials and other settings
   ```

4. Run database migrations
   ```bash
   npm run db:migrate
   # or
   yarn db:migrate
   ```

5. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Development Guidelines

See [development guidelines](docs/developmentguidelines.md) for code style, best practices, and contribution guidelines.

## Design Rules

For UI/UX guidelines, see our [design rules](docs/designrules.md).

## MVP Roadmap

For details on our minimum viable product plan, see the [MVP roadmap](docs/mvp.md).

## License

[MIT License](LICENSE)
