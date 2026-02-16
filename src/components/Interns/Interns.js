import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  makeStyles,
  useTheme,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  sectionContainer: {
    width: '100%',
    padding: theme.spacing(6, 3),
    backgroundColor: '#FFFFFF',
    position: 'relative',
    boxSizing: 'border-box',
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(8, 4),
    },
  },
  headerContainer: {
    textAlign: 'center',
    marginBottom: theme.spacing(4),
    padding: theme.spacing(0, 2),
    [theme.breakpoints.up('md')]: {
      marginBottom: theme.spacing(5),
    },
  },
  title: {
    fontWeight: 800,
    color: theme.palette.primary.main,
    marginBottom: 0,
    fontFamily: 'Poppins, sans-serif',
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.75rem',
      letterSpacing: '1px',
    },
    [theme.breakpoints.up('md')]: {
      fontSize: '2.5rem',
      letterSpacing: '2px',
    },
  },
  categoryContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(4),
    flexWrap: 'wrap',
    padding: theme.spacing(0, 2),
    [theme.breakpoints.up('md')]: {
      marginBottom: theme.spacing(5),
      gap: theme.spacing(2),
    },
  },
  categoryButton: {
    borderRadius: '30px',
    padding: theme.spacing(1.25, 2.5),
    fontSize: '0.8125rem',
    fontWeight: 600,
    fontFamily: 'Poppins, sans-serif',
    textTransform: 'none',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
    '&:hover': {
      transform: 'translateY(-2px) scale(1.02)',
    },
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(1.5, 3),
      fontSize: '0.875rem',
    },
  },
  categoryButtonSelected: {
    backgroundColor: theme.palette.primary.main,
    color: '#FFFFFF',
    boxShadow: '0 6px 20px rgba(255, 117, 4, 0.35)',
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      transform: 'scale(1.05)',
    },
  },
  categoryButtonUnselected: {
    backgroundColor: '#F5F5F5',
    color: '#333333',
    '&:hover': {
      backgroundColor: '#EEEEEE',
    },
  },
  internCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-12px) scale(1.02)',
      '& $photoContainer': {
        boxShadow: '0 15px 35px rgba(255, 117, 4, 0.4), 0 6px 15px rgba(255, 117, 4, 0.3)',
      },
      '& $internName': {
        color: theme.palette.primary.main,
      },
    },
  },
  photoContainer: {
    width: '100%',
    maxWidth: 200,
    aspectRatio: '4/5',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(2),
    overflow: 'hidden',
    boxShadow: '0 10px 25px rgba(255, 117, 4, 0.3), 0 4px 12px rgba(255, 117, 4, 0.2)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    [theme.breakpoints.up('md')]: {
      maxWidth: 220,
      borderRadius: '20px',
      marginBottom: theme.spacing(2.5),
    },
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.primary.main,
    fontFamily: 'Poppins, sans-serif',
    fontWeight: 700,
    transition: 'transform 0.4s ease',
    '&:hover': {
      transform: 'scale(1.1)',
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '3rem',
    },
    [theme.breakpoints.up('md')]: {
      fontSize: '4.5rem',
    },
  },
  internName: {
    fontWeight: 700,
    color: '#1a1a1a',
    fontFamily: 'Poppins, sans-serif',
    textAlign: 'center',
    transition: 'color 0.3s ease',
    padding: theme.spacing(0, 1),
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.125rem',
    },
    [theme.breakpoints.up('md')]: {
      fontSize: '1.375rem',
    },
  },
  fadeIn: {
    opacity: 0,
    transform: 'translateY(-30px)',
    transition: 'opacity 1s ease-out, transform 1s ease-out',
  },
  fadeInVisible: {
    opacity: 1,
    transform: 'translateY(0)',
  },
  fadeInButton: {
    transitionDelay: '0.3s',
  },
}));

const Interns = () => {
  const [selectedCategory, setSelectedCategory] = useState('DEVELOPMENT');
  const [isVisible, setIsVisible] = useState(false);
  const theme = useTheme();
  const classes = useStyles();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const categories = [
    { id: 'DEVELOPMENT', label: 'DEVELOPMENT INTERNS' },
    { id: 'BUSINESS', label: 'BUSINESS DEVELOPMENT INTERNS' },
    { id: 'OPERATIONS', label: 'OPERATIONS INTERNS' },
  ];

  // Sample intern data - replace with actual data
  const internsData = {
    DEVELOPMENT: [
      { id: 1, name: 'Kurt', image: '/api/placeholder/200/250' },
      { id: 2, name: 'Adam', image: '/api/placeholder/200/250' },
      { id: 3, name: 'Brayan', image: '/api/placeholder/200/250' },
      { id: 4, name: 'Avegail', image: '/api/placeholder/200/250' },
      { id: 5, name: 'Merlvin', image: '/api/placeholder/200/250' },
      { id: 6, name: 'Marth', image: '/api/placeholder/200/250' },
    ],
    BUSINESS: [
      { id: 7, name: 'Dean', image: '/api/placeholder/200/250' },
      { id: 8, name: 'Jerick', image: '/api/placeholder/200/250' },
      { id: 9, name: 'Justine', image: '/api/placeholder/200/250' },
    ],
    OPERATIONS: [
      { id: 10, name: 'David', image: '/api/placeholder/200/250' },
      { id: 11, name: 'Lisa', image: '/api/placeholder/200/250' },
      { id: 12, name: 'John', image: '/api/placeholder/200/250' },
    ],
  };

  const currentInterns = internsData[selectedCategory] || [];

  return (
    <Box className={classes.sectionContainer}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box className={classes.headerContainer}>
          <Typography
            variant="h1"
            className={`${classes.title} ${isVisible ? classes.fadeInVisible : classes.fadeIn}`}>
            MEET THE BATCH 11 RADZTECH INTERNS
          </Typography>
        </Box>

        {/* Category Tabs */}
        <Box className={classes.categoryContainer}>
          {categories.map((category, index) => {
            const isSelected = selectedCategory === category.id;
            const parts = category.label.split(' ');
            
            return (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`${classes.categoryButton} ${
                  isSelected
                    ? classes.categoryButtonSelected
                    : classes.categoryButtonUnselected
                } ${isVisible ? classes.fadeInVisible : classes.fadeIn}`}
                style={{
                  transitionDelay: `${0.3 + index * 0.15}s`,
                }}>
                {parts[0]}{' '}
                <Box component="span" style={{ color: isSelected ? '#FFFFFF' : theme.palette.primary.main }}>
                  INTERNS
                </Box>
              </Button>
            );
          })}
        </Box>

        {/* Interns Grid */}
        <Grid
          container
          spacing={3}
          key={selectedCategory}
          style={{ padding: theme.spacing(0, 2) }}>
          {currentInterns.map((intern, index) => {
            return (
              <Grid item xs={6} sm={4} md={3} key={intern.id}>
                <Box
                  className={classes.internCard}
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`,
                    opacity: 0,
                  }}>
                  {/* Photo Container */}
                  <Box className={classes.photoContainer}>
                    <Box className={classes.photoPlaceholder}>
                      {intern.name.charAt(0)}
                    </Box>
                  </Box>

                  {/* Name */}
                  <Typography className={classes.internName}>
                    {intern.name}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default Interns;
