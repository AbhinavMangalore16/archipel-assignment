# Product Management System

A full-stack product management application built with Flask (backend) and React (frontend). This application allows users to perform CRUD operations on products with a beautiful, responsive UI.

## Features

- Create, Read, Update, and Delete products
- Search products by name
- Bulk product insertion
- Responsive design with Tailwind CSS
- RESTful API architecture
- SQLite database for data persistence

## Tech Stack

### Backend
- Python 3.12
- Flask
- SQLAlchemy
- Flask-CORS

### Frontend
- React
- Vite
- Tailwind CSS
- Axios

## Prerequisites

- Python 3.x
- Node.js (v14 or higher)
- npm or yarn

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd app
```

2. Create a virtual environment (optional but recommended):
```bash
# Windows
python -m venv venv
./venv/Scripts/activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

3. Install the required Python packages:
```bash
pip install -r requirements.txt
```

4. Run the Flask application:
```bash
python app.py
```

The backend server will start running on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd product-manager
```

2. Install the required npm packages:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend application will start running on `http://localhost:5173`

## API Endpoints

The backend provides the following RESTful API endpoints:

- `GET /api/products` - List all products
- `POST /api/products` - Create a new product
- `GET /api/products/<id>` - Get a specific product
- `PUT /api/products/<id>` - Update a product
- `DELETE /api/products/<id>` - Delete a product
- `POST /api/products/bulk` - Bulk insert products

## Project Structure

```
.
├── app/                    # Backend directory
│   ├── app.py             # Main Flask application
│   ├── controllers/       # API controllers
│   ├── models/           # Database models
│   └── extensions.py     # Flask extensions
│
└── product-manager/              # Frontend directory
    ├── app/              # Source files
    ├── public/           # Static files
    └── package.json      # Dependencies
```

## Development

- The backend uses Flask's debug mode for development
- The frontend uses Vite's hot module replacement for fast development
- CORS is enabled for local development
- SQLite database is used for simplicity

## Notes

- The application uses SQLite as the database, which is stored in `products.db`
- The frontend is configured to connect to `http://localhost:5000` for API requests
- Make sure both frontend and backend servers are running for the application to work properly 