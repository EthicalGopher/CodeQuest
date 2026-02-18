# CodeQuest Pro

A top-down JRPG-style game engine built with Phaser and React, featuring a Supabase-powered authentication system. This project serves as a template and starting point for creating rich, interactive web-based games.

## Features

- **Game Engine**: Built with [Phaser 3](https://phaser.io/), a fast, free, and fun open-source HTML5 game framework.
- **UI Framework**: Integrated with [React 19](https://react.dev/) for a flexible and modern user interface.
- **Top-Down JRPG Movement**: 4-directional character movement with animations, prioritizing single-axis movement (no diagonals).
- **Authentication**: Secure user login and sign-up powered by [Supabase](https://supabase.com/), supporting both email/password and Google OAuth.
- **Session Management**: Automatically checks for active user sessions to provide a seamless experience.
- **Routing**: Uses [React Router DOM](https://reactrouter.com/) to manage navigation between the title screen and the game interface.
- **Styling**: Styled with [Tailwind CSS](https://tailwindcss.com/) for a utility-first CSS workflow.
- **Bundling**: Fast and efficient development and build process handled by [Vite](https://vitejs.dev/).

## Tech Stack

- **Frontend**: React, React Router DOM
- **Game Engine**: Phaser 3
- **Backend-as-a-Service (BaaS)**: Supabase
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone <your-repository-url>
    cd <repository-folder>
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

### Configuration

This project requires a Supabase backend for authentication and data storage.

1.  **Create a Supabase Project:**
    - Go to [supabase.com](https://supabase.com/) and create a new project.
    - Find your project's **URL** and **anon public key** in the project settings (API section).

2.  **Create a `.env` file:**
    - In the root of the project, create a new file named `.env`.

3.  **Add Supabase credentials to `.env`:**
    - Open the `.env` file and add the following lines, replacing the placeholder values with your actual Supabase credentials:
      ```
      VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
      VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
      ```

4.  **(Optional) Configure Google OAuth:**
    - To enable Google Sign-In, follow the instructions in the `SUPABASE_GOOGLE_SIGNIN_SETUP.md` file located in the project root.

### Running the Application

1.  **Start the development server:**
    ```sh
    npm run dev
    ```

2.  **Open the application:**
    - Open your web browser and navigate to the URL provided by Vite (usually `http://localhost:5173`).

---
*This README was generated and updated based on the project's current state.*