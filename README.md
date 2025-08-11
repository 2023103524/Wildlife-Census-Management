# Wildlife Census Management System

A comprehensive system for managing wildlife census data, including species tracking, location management, and census record keeping.

## Features

- Species management with conservation status tracking
- Location management with geographical coordinates
- Census record management
- Report generation with date range filtering
- Population density calculations
- Growth rate tracking
- Automated data updates through triggers
- Backup and report generation capabilities

## Tech Stack

- Frontend: React.js with Material-UI
- Backend: Node.js with Express
- Database: MySQL
- Additional Libraries: Axios, React Router, Material-UI Date Pickers

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v8 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wildlife-census
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Set up the database:
- Create a MySQL database named `wildlife_census`
- Import the schema from `database/schema.sql`

5. Configure the database connection:
- Update the database configuration in `database/config.js` with your MySQL credentials

## Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```
The backend server will run on http://localhost:5000

2. Start the frontend development server:
```bash
cd frontend
npm start
```
The frontend application will run on http://localhost:3000

## Database Features

### Tables
- species: Stores information about wildlife species
- locations: Stores geographical locations and their details
- census_records: Stores census data for each species at different locations

### Stored Procedures
- generate_census_report: Generates reports based on date range
- process_species_data: Processes species data using cursors

### Functions
- calculate_growth_rate: Calculates species growth rate over a specified period

### Triggers
- after_census_insert: Updates species population count and last census date

### Derived Attributes
- population_density: Calculated based on population count and area

## API Endpoints

### Species
- GET /api/species - Get all species
- POST /api/species - Add new species

### Locations
- GET /api/locations - Get all locations
- POST /api/locations - Add new location

### Census Records
- GET /api/census - Get all census records
- POST /api/census - Add new census record

### Reports
- GET /api/reports/census - Generate census report
- GET /api/species/:id/growth-rate - Calculate species growth rate

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 
(Initial commit - Wildlife Census Management Project)
