import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import axios from 'axios';
import TransactionList from './TransactionList';
import AddTransaction from './AddTransaction';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import HomeIcon from '@mui/icons-material/Home';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import SchoolIcon from '@mui/icons-material/School';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import '../../styles/global.css';

const COLORS = ['#2196F3', '#4CAF50', '#FFC107', '#FF5722', '#9C27B0', '#3F51B5'];

const CATEGORY_ICONS = {
  'Shopping': <ShoppingCartIcon />,
  'Healthcare': <LocalHospitalIcon />,
  'Utilities': <AccountBalanceIcon />,
  'Rent': <HomeIcon />,
  'Transportation': <DirectionsBusIcon />,
  'Groceries': <FastfoodIcon />,
  'Education': <SchoolIcon />,
  'Entertainment': <TheaterComedyIcon />,
  'Other Expenses': <MoreHorizIcon />,
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name || 'User');
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [transactionsRes, statsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/transactions`, config),
        axios.get(`${process.env.REACT_APP_API_URL}/transactions/stats`, config)
      ]);

      // Ensure amounts are numbers
      const processedTransactions = transactionsRes.data.map(t => ({
        ...t,
        amount: parseFloat(t.amount)
      }));

      setTransactions(processedTransactions);
      setMonthlyData(statsRes.data.monthly);

      // Process category data to ensure unique categories and proper formatting
      const categoryMap = new Map();
      statsRes.data.byCategory
        .filter(cat => cat.type === 'expense')
        .forEach(cat => {
          const existingAmount = categoryMap.get(cat.name) || 0;
          categoryMap.set(cat.name, existingAmount + parseFloat(cat.total));
        });

      const processedCategoryData = Array.from(categoryMap.entries())
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({
          name,
          value,
          icon: CATEGORY_ICONS[name] || <MoreHorizIcon />
        }));

      setCategoryData(processedCategoryData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        style={{ fontSize: '12px', fontWeight: 'bold' }}
      >
        {formatCurrency(value)}
      </text>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
            Welcome back, {userName}!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Here's an overview of your financial status
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => setShowAddTransaction(true)}
          startIcon={<AddIcon />}
          sx={{ 
            borderRadius: 2,
            px: 3,
            py: 1.5,
            fontWeight: 500,
            boxShadow: 2,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 3
            },
            transition: 'all 0.2s ease'
          }}
        >
          Add Transaction
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Summary Cards Row */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: 140,
                  bgcolor: '#e3f2fd',
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                }}
              >
                <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 600, mb: 1 }}>
                  Total Income
                </Typography>
                <Typography variant="h3" sx={{ mt: 'auto', fontWeight: 700, color: 'primary.main' }}>
                  {formatCurrency(totalIncome)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: 140,
                  bgcolor: '#fbe9e7',
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                }}
              >
                <Typography variant="h6" color="error.dark" sx={{ fontWeight: 600, mb: 1 }}>
                  Total Expenses
                </Typography>
                <Typography variant="h3" sx={{ mt: 'auto', fontWeight: 700, color: 'error.main' }}>
                  {formatCurrency(totalExpenses)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: 140,
                  bgcolor: '#f1f8e9',
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                }}
              >
                <Typography variant="h6" color="success.dark" sx={{ fontWeight: 600, mb: 1 }}>
                  Balance
                </Typography>
                <Typography variant="h3" sx={{ mt: 'auto', fontWeight: 700, color: 'success.main' }}>
                  {formatCurrency(totalIncome - totalExpenses)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Charts Row */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: '500px',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              bgcolor: '#ffffff',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'text.primary' }}>
              Monthly Overview
            </Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={monthlyData}
                  margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#666"
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)} 
                    stroke="#666"
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                  />
                  <RechartsTooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      padding: '12px',
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
                    }}
                  />
                  <Bar dataKey="total_income" name="Income" fill="#4caf50" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total_expenses" name="Expenses" fill="#f44336" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4caf50' }} />
                <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}>Income</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f44336' }} />
                <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}>Expenses</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: '500px',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              bgcolor: '#ffffff',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'text.primary' }}>
              Expenses by Category
            </Typography>
            <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius="80%"
                    paddingAngle={2}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value, name) => [`${formatCurrency(value)}`, name]}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      padding: '12px',
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box 
              sx={{ 
                mt: 2,
                maxHeight: '120px',
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  width: '6px'
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '3px'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#888',
                  borderRadius: '3px',
                  '&:hover': {
                    background: '#666'
                  }
                }
              }}
            >
              {categoryData.map((entry, index) => (
                <Box
                  key={entry.name}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    py: 0.75,
                    px: 1,
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.02)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: COLORS[index % COLORS.length]
                      }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {CATEGORY_ICONS[entry.name]}
                      <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', fontWeight: 500 }}>
                        {entry.name}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
                    {formatCurrency(entry.value)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Transactions Table */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              bgcolor: '#ffffff'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'text.primary' }}>
              Recent Transactions
            </Typography>
            <TransactionList
              transactions={transactions}
              onTransactionUpdated={fetchData}
              categoryIcons={CATEGORY_ICONS}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Add Transaction Dialog */}
      <AddTransaction
        open={showAddTransaction}
        onClose={() => setShowAddTransaction(false)}
        onTransactionAdded={fetchData}
      />
    </Container>
  );
};

export default Dashboard; 