Backend: Laravel 12, PostgreSQL, Firebase JWT for authentication
Frontend: Next.js, Firebase for authentication, Redux for state management, Tailwind CSS for styling

Prerequisites
Before setting up the project, ensure you have the following installed:

PHP 8.2 or higher
Composer (for PHP dependency management)
PostgreSQL 15 or higher
Node.js 18 or higher (includes npm)
Git
A Firebase project (for authentication)

Project Setup
1. Clone the Repository
Clone the PlateMatch repository to your local machine:
git clone https://github.com/<your-username>/platematch.git

2. Backend Setup (Laravel)
The backend is located in the backend directory.
a. Navigate to the Backend Directory
cd backend

b. Install PHP Dependencies
Install Laravel dependencies using Composer:
composer install

c. Configure Environment Variables
Copy the example environment file and update it with your configuration:
cp .env.example .env

Edit the .env file to configure your PostgreSQL database and Firebase JWT settings:
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=platematch
DB_USERNAME=your_postgres_username
DB_PASSWORD=your_postgres_password

d. Generate Application Key
Generate a Laravel application key:
php artisan key:generate

e. Run Database Migrations
Ensure your PostgreSQL server is running, then run the migrations to create the users and likes tables:
php artisan migrate

The migrations include:

users table: Stores KOLs and Restaurants (id, name, email, type, location, profile_photo, description, etc.).
likes table: Stores mutual likes (from_user_id, to_user_id).

f. Start the Backend Server
Run the Laravel development server:
php artisan serve

The backend will be available at http://localhost:8000.

3. Frontend Setup (Next.js)
The frontend is located in the frontend directory.
a. Navigate to the Frontend Directory
cd frontend

b. Install Node.js Dependencies
Install the required packages:
npm install

c. Configure Firebase
Create a Firebase project in the Firebase Console. Add a web app to your project and copy the Firebase configuration.
Create a file src/config/firebase.js with your Firebase configuration:
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "your-firebase-api-key",
  authDomain: "your-firebase-project-id.firebaseapp.com",
  projectId: "your-firebase-project-id",
  storageBucket: "your-firebase-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

Replace the placeholder values with your Firebase project’s configuration.
d. Configure Environment Variables
Create a .env.development file in the frontend directory:

Add the following environment variable for the backend API URL:
NEXT_PUBLIC_BASEURL=http://localhost:8000

e. Start the Frontend Server
Run the Next.js development server:
npm run dev

The frontend will be available at http://localhost:3000.
Running the Project

Ensure Both Servers Are Running:

Backend: http://localhost:8000 (run php artisan serve in the backend directory).
Frontend: http://localhost:3000 (run npm run dev in the frontend directory).


Access the App:

Open http://localhost:3000 in your browser.
