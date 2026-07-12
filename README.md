# Laundry Management System (SaaS)

A web-based laundry management system built with Node.js, Express, and PostgreSQL, designed to help laundry businesses manage orders, customers, and operations through both desktop and mobile dashboards.

Live demo: [laundry-management-system-saa-s.vercel.app](https://laundry-management-system-saa-s.vercel.app/)

---

## About

**Laundry Management System (SaaS)** is a server-rendered application (Express + EJS) for managing day-to-day laundry business operations, including customer records, orders, and dashboard reporting. The project follows an MVC architecture with dedicated layers for controllers, models, services, routes, and middleware, and includes ERD/PRD documentation for the data design and product requirements.

## Features

- User authentication with hashed passwords (bcrypt) and session-based login
- Session persistence backed by PostgreSQL (via Sequelize / connect-pg-simple)
- Flash messages for user feedback (success/error notifications)
- Separate desktop and mobile dashboard views
- File uploads (e.g. proof of payment, customer/order attachments) via Multer
- Rate limiting and security headers (Helmet) for basic hardening
- RESTful-style routes with method override support (PUT/DELETE from HTML forms)
- Database seeding for initial/sample data
- Documented data model and requirements (ERD & PRD)

## Tech Stack

| Category | Technology |
|---|---|
| Runtime | Node.js |
| Web Framework | Express 5 |
| View Engine | EJS + express-ejs-layouts |
| Database | PostgreSQL |
| ORM | Sequelize |
| Authentication | bcryptjs, express-session |
| Session Store | connect-pg-simple / connect-session-sequelize |
| Security | Helmet, express-rate-limit |
| File Uploads | Multer |
| Deployment | Vercel |

## Project Structure

```
Laundry-management-System-SaaS-/
├── .agent/SKILL/         # Agent/skill configuration
├── ERD PRD/              # Entity Relationship Diagram & Product Requirements Document
├── config/                # App and database configuration
├── controllers/           # Request handlers / business logic
├── middleware/             # Custom Express middleware (auth, error handling, etc.)
├── models/                 # Sequelize models
├── public/                 # Static assets (CSS, JS, images)
├── routes/                 # Express route definitions
├── seeders/                 # Database seed scripts
├── services/                # Service layer / reusable business logic
├── utils/                    # Utility/helper functions
├── views/                     # EJS templates
├── app.js                     # Application entry point
├── desktop_dashboard.html      # Desktop dashboard reference/preview
├── mobile_dashboard.html       # Mobile dashboard reference/preview
└── vercel.json                  # Vercel deployment configuration
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- A PostgreSQL database instance

### 1. Clone the repository

```bash
git clone https://github.com/Greeval/Laundry-management-System-SaaS-.git
cd Laundry-management-System-SaaS-
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root with your database and session configuration, for example:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/laundry_db"
SESSION_SECRET="your-session-secret"
PORT=3000
```

### 4. Set up and seed the database

Make sure your PostgreSQL database is running and reachable, then run the seeder for initial data:

```bash
npm run seed
```

### 5. Run the application

```bash
npm run dev
# or
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000) (or the port set in `.env`).

## Scripts

| Command | Description |
|---|---|
| `npm start` | Starts the application |
| `npm run dev` | Starts the application (development) |
| `npm run seed` | Seeds the database with initial data |
| `npm test` | Placeholder, no tests configured yet |

## Deployment

This project is deployed using [Vercel](https://vercel.com). To deploy your own version:

1. Push the repository to GitHub
2. Import the project into [Vercel](https://vercel.com/new)
3. Add the required environment variables (e.g. `DATABASE_URL`, `SESSION_SECRET`) in the Vercel dashboard
4. Deploy

## Documentation

Data modeling and product requirements can be found in the `ERD PRD` directory, which contains the Entity Relationship Diagram and Product Requirements Document for this system.

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to open an [issue](https://github.com/Greeval/Laundry-management-System-SaaS-/issues) or submit a pull request.

1. Fork this repository
2. Create a new branch (`git checkout -b new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin new-feature`)
5. Open a Pull Request

## License

Licensed under ISC (as specified in `package.json`).

## Contact

Created by [Greeval](https://github.com/Greeval) — feel free to open an issue in this repo for questions or suggestions.
