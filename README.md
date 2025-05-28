# Personal Finance Tracker

A modern web application for tracking personal finances, built with React and Node.js.

## Features

- 📊 Interactive Dashboard with financial overview
- 💰 Income and Expense tracking
- 📈 Monthly financial trends visualization
- 🔄 Real-time category-wise expense breakdown
- 📱 Responsive design for all devices
- 🔒 Secure user authentication

## Tech Stack

### Frontend
- React.js
- Material-UI
- Recharts for data visualization
- Axios for API calls

### Backend
- Node.js
- Express.js
- MySQL
- JWT Authentication

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/Meghana1301/personal-finance-tracker.git
cd personal-finance-tracker
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables:
- Create `.env` files in both frontend and backend directories
- Add necessary environment variables (database connection, JWT secret, etc.)

4. Start the application:
```bash
# Start backend server
cd backend
npm start

# Start frontend development server
cd frontend
npm start
```

## Project Structure

```
personal-finance-tracker/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── styles/
│   │   └── App.jsx
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── models/
│   └── package.json
└── README.md
```

## Contributing

Feel free to submit issues and enhancement requests! 