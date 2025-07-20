
# Project Architecture

This project is a web application built with a modern JavaScript stack. It uses React for the frontend, Convex for the backend, and Vite for the build tooling.

## Frontend

The frontend is a React application located in the `app` directory. It uses React Router for routing, as indicated by the presence of `react-router.config.ts` and the `@react-router/dev` dependency. The application's main entry point is likely `app/root.tsx`.

The `app` directory is structured as follows:

-   `components`: Contains reusable React components.
-   `routes`: Contains the different routes of the application.
-   `lib`: Contains utility functions and other library code.
-   `assets`: Contains static assets like images and CSS.

The frontend is built with Vite, as configured in `vite.config.ts`. It uses Tailwind CSS for styling.

## Backend

The backend is a Convex application located in the `convex` directory. Convex provides a real-time database and serverless functions. The `convex` directory contains the following:

-   `schema.ts`: Defines the database schema.
-   `*.ts`: These files define the Convex functions that can be called from the frontend. The filenames suggest a wide range of functionality, including user authentication, data import, business logic, and more.
-   `http.ts`: This file likely defines HTTP endpoints for the Convex backend.

## Key Technologies

-   **React**: A JavaScript library for building user interfaces.
-   **React Router**: A routing library for React applications.
-   **Convex**: A backend-as-a-service platform that provides a real-time database and serverless functions.
-   **Vite**: A fast build tool for modern web applications.
-   **TypeScript**: A typed superset of JavaScript.
-   **Tailwind CSS**: A utility-first CSS framework.

## Scripts and Tooling

The `package.json` file defines several scripts for common development tasks:

-   `dev`: Starts the development server.
-   `build`: Builds the application for production.
-   `start`: Starts the production server.
-   `typecheck`: Runs the TypeScript compiler to check for type errors.
-   `import-csv`: Imports data from a CSV file.
-   `generate-sitemap`: Generates a sitemap for the website.
