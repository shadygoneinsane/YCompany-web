# YCompany Product Management App

This is a web application built with Next.js and Firebase for managing a product catalog. Users can view existing products and add new ones to the inventory.

## Overview

YCompany is a modern, responsive application designed to showcase and manage products. It features a clean user interface built with ShadCN UI components and Tailwind CSS, and leverages Firebase for backend data storage.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **UI**: React
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN UI
- **Backend & Database**: Firebase (Firestore)
- **AI Integration**: Genkit (for potential future AI-powered features)
- **Deployment**: Configured for Firebase App Hosting (see `apphosting.yaml`)

## Features

- **Product Listing**: View all products in a card-based layout on the homepage.
- **Add New Product**: A dedicated form to add new products with details like name, description, price, and an image URL.
- **Image URL Support**: Products are displayed using image URLs.
- **Duplicate Product Name Prevention**: Server-side validation to ensure product names are unique (case-insensitive).
- **Loading States**: UI indicators (spinners) during page navigations (e.g., when loading the "Add Product" form).
- **Error Handling**:
    - Graceful fallback for image loading errors within product cards.
    - Custom error page (`src/app/error.tsx`) for unhandled runtime errors, providing options to retry or navigate to the homepage.
- **Responsive Design**: Adapts to various screen sizes.
- **Optimized Images**: Uses `next/image` for image optimization (requires hostname configuration in `next.config.js`).

## Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn

## Getting Started

Follow these steps to get the project up and running on your local machine.

### 1. Clone the Repository (Example)

```bash
git clone <your-repository-url>
cd <project-directory>
```

### 2. Install Dependencies

Install the project dependencies using npm:

```bash
npm install
```
Or if you prefer yarn:
```bash
yarn install
```

### 3. Firebase Setup

This project uses Firebase for its backend (Firestore database).

1.  **Create a Firebase Project**: If you haven't already, create a new project on the [Firebase Console](https://console.firebase.google.com/).
2.  **Enable Firestore**: In your Firebase project, navigate to "Firestore Database" and create a database. Start in **test mode** for easier setup, but remember to secure your rules before production.
3.  **Get Firebase Configuration**:
    *   In your Firebase project settings (click the gear icon next to "Project Overview"), find your web app's configuration.
    *   It will look something like this:
        ```javascript
        const firebaseConfig = {
          apiKey: "YOUR_API_KEY",
          authDomain: "YOUR_AUTH_DOMAIN",
          projectId: "YOUR_PROJECT_ID",
          storageBucket: "YOUR_STORAGE_BUCKET",
          messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
          appId: "YOUR_APP_ID",
          measurementId: "YOUR_MEASUREMENT_ID" // Optional
        };
        ```
4.  **Update Firebase Config in Code**:
    *   Open the file `src/lib/firebase.ts`.
    *   Replace the placeholder `firebaseConfig` object with your actual Firebase project configuration values.

### 4. Configure Image Hostnames

The application uses `next/image` for optimized image display. You need to specify which remote hostnames are allowed for images.
- Open `next.config.js`.
- Add any hostnames you intend to use for product images to the `images.remotePatterns` array. For example:
  ```javascript
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'example.com' }, // Add your image domains here
      // ... other configured hostnames
    ],
  },
  ```

## Available Scripts

In the project directory, you can run the following commands:

-   **`npm run dev`**: Runs the app in development mode with Next.js Turbopack.
    Open [http://localhost:9002](http://localhost:9002) (or the port specified in your console) to view it in the browser.
    The page will reload if you make edits.

-   **`npm run genkit:dev`**: Starts the Genkit development server (for AI flows).

-   **`npm run genkit:watch`**: Starts the Genkit development server with watch mode.

-   **`npm run build`**: Builds the app for production to the `.next` folder.
    It correctly bundles React in production mode and optimizes the build for the best performance.

-   **`npm run start`**: Starts a Next.js production server (requires a build to be run first).

-   **`npm run lint`**: Runs Next.js's built-in ESLint checks.

-   **`npm run typecheck`**: Runs TypeScript type checking.

## Project Structure

A brief overview of the key directories:

-   **`src/app/`**: Contains the core application pages and layouts, following the Next.js App Router structure.
    -   `layout.tsx`: Root layout for the application.
    -   `page.tsx`: Homepage displaying the product list.
    -   `add-product/`: Directory for the "Add Product" page and its associated loading UI.
    -   `error.tsx`: Global error boundary for the application.
    -   `globals.css`: Global styles and Tailwind CSS theme configuration (ShadCN).
-   **`src/components/`**: Reusable React components.
    -   `ui/`: ShadCN UI components.
    -   `ProductCard.tsx`: Component to display individual product details.
    -   `ProductForm.tsx`: Form component for adding new products.
-   **`src/actions/`**: Server Actions for handling form submissions and backend logic (e.g., adding products).
-   **`src/lib/`**: Utility functions and library initializations.
    -   `firebase.ts`: Firebase SDK initialization and configuration.
    -   `utils.ts`: General utility functions (like `cn` for classnames).
-   **`src/ai/`**: Genkit related files for AI functionalities.
    -   `genkit.ts`: Genkit global instance.
-   **`src/types/`**: TypeScript type definitions for the application.
-   **`public/`**: Static assets.
-   **`next.config.js`**: Next.js configuration file (e.g., for image optimization).
-   **`package.json`**: Project dependencies and scripts.
-   **`tsconfig.json`**: TypeScript configuration.
-   **`apphosting.yaml`**: Configuration for Firebase App Hosting.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.
(You can add more specific contribution guidelines here if needed).

## License

This project is licensed under the MIT License. (Or specify your chosen license).
