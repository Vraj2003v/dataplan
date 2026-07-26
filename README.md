# DataPlan CA

DataPlan CA is a full-stack web application designed to simplify the process of finding and comparing mobile data plans in Canada.

Mobile plans vary significantly across providers in terms of pricing, data allowance, and available features. DataPlan CA brings plan information together in one place, making it easier for users to explore available options and compare plans based on their needs.

## Features

* Browse mobile plans from Canadian carriers
* Compare plans based on price and data allowance
* View plan information through a simple and responsive interface
* Centralized access to plan data from multiple providers
* Backend API for managing and serving plan information
* Secure backend architecture using Spring Security and JWT
* Database persistence with PostgreSQL

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* TanStack React Query
* Axios
* Zustand

### Backend

* Java 21
* Spring Boot
* Spring Web
* Spring Data JPA
* Spring Security
* JWT
* Jsoup
* Maven

### Database

* PostgreSQL

## Project Structure

```text
dataplan/
├── backend/
│   ├── crawled-data/
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│
├── mvnw
└── mvnw.cmd
```

The project uses a separate frontend and backend architecture. The React frontend communicates with the Spring Boot backend through REST APIs.

## Getting Started

### Prerequisites

Make sure you have the following installed:

* Node.js
* npm
* Java 21
* Maven
* PostgreSQL
* Git

### Clone the Repository

```bash
git clone https://github.com/Vraj2003v/dataplan.git
cd dataplan
```

### Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

### Run the Backend

Navigate to the backend directory:

```bash
cd backend
mvn spring-boot:run
```

Configure the PostgreSQL database connection before starting the backend.

## How It Works

DataPlan CA collects and processes mobile plan information and makes it available through the Spring Boot backend.

The backend handles data processing, persistence, security, and API endpoints. The React frontend communicates with these APIs to retrieve plan information and present it through an accessible interface.

This architecture separates the user interface from the application and data layers, making the project easier to maintain and extend.

## Purpose

The purpose of DataPlan CA is to make mobile plan comparison more convenient.

Instead of checking multiple carrier websites individually, users can access plan information through a single application and compare available options more efficiently.

## Future Improvements

* Support for additional Canadian carriers
* Advanced filtering and sorting
* Personalized plan recommendations
* Plan price history
* Saved plans and comparisons
* Automatic plan data updates
* Improved search functionality

## Author

**Vrajkumar Patel**

GitHub: `Vraj2003v`
