# Book Cart (Book Bazaar)

A modern full-stack bookstore application with an Android mobile client, web storefront, and backend API.

## Project Structure

```text
.
├── android/                  # Native Android application (Kotlin, Gradle)
├── apps/
│   ├── frontend/             # React 19 + Vite web storefront (Book Bazaar)
│   └── backend/              # Express 5 + TypeScript REST API server
├── packages/
│   ├── api-client-react/     # Generated React Query API hooks
│   ├── api-spec/             # OpenAPI 3.0 specification & Orval codegen
│   ├── api-zod/              # Generated Zod validation schemas
│   └── db/                   # PostgreSQL schema & Drizzle ORM models
├── scripts/                  # Workspace utility scripts
├── package.json              # Workspace root scripts & dev dependencies
├── pnpm-workspace.yaml       # pnpm monorepo workspace definition
└── tsconfig.json             # Root TypeScript project references
```

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm (`npm install -g pnpm`)

### Install Dependencies
```bash
pnpm install
```

### Running Applications

#### Frontend Web App
To run the React web storefront in development mode:
```bash
pnpm dev:frontend
# or
pnpm dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

#### Backend API Server
To build and start the Express API server:
```bash
pnpm dev:backend
```

#### Android Application
Open the `android/` directory in Android Studio or run Gradle:
```bash
cd android
./gradlew assembleDebug
```

### Type Checking & Building
```bash
pnpm run typecheck    # Typechecks all apps, packages, and scripts
pnpm run build        # Builds all workspace projects
```
