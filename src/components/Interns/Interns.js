import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(10),
    background: 'linear-gradient(180deg, #fff 0%, #f8f9fa 50%, #fafafa 100%)',
    minHeight: '100vh',
  },
  header: {
    textAlign: 'center',
    marginBottom: theme.spacing(5),
    animation: '$fadeInDown 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
  },
  '@keyframes fadeInDown': {
    '0%': {
      opacity: 0,
      transform: 'translateY(-24px)',
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  title: {
    fontWeight: 600,
    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
    letterSpacing: '-0.02em',
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
  },
  subtitle: {
    color: theme.palette.text.secondary,
    fontSize: '0.95rem',
    opacity: 0.9,
  },
  categoryWrap: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(5),
    animation: '$fadeIn 0.6s 0.2s cubic-bezier(0.22, 1, 0.36, 1) both',
  },
  '@keyframes fadeIn': {
    '0%': { opacity: 0 },
    '100%': { opacity: 1 },
  },
  categoryBtn: {
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontWeight: 600,
    fontSize: '0.8rem',
    padding: theme.spacing(1.25, 2.5),
    borderRadius: 9999,
    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'scale(1)',
    '&:hover': {
      backgroundColor: 'rgba(255, 117, 4, 0.1)',
      color: theme.palette.primary.main,
      transform: 'scale(1.03)',
    },
  },
  categoryBtnActive: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    boxShadow: '0 4px 14px rgba(255, 117, 4, 0.35)',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark || '#e66a03',
      color: theme.palette.primary.contrastText,
      transform: 'scale(1.03)',
      boxShadow: '0 6px 20px rgba(255, 117, 4, 0.4)',
    },
  },
  gridWrap: {
    animation: '$fadeIn 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
  },
  cardWrap: {
    animation: '$cardEnter 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
  },
  '@keyframes cardEnter': {
    '0%': {
      opacity: 0,
      transform: 'translateY(24px) scale(0.96)',
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0) scale(1)',
    },
  },
  card: {
    height: '100%',
    borderRadius: 10,
    overflow: 'visible',
    backgroundColor: 'transparent',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-8px)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.03)',
    },
  },
  cardMediaWrap: {
    minHeight: 160,
    overflow: 'visible',
    backgroundColor: 'transparent',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  cardMedia: {
    width: '100%',
    maxHeight: 260,
    height: 'auto',
    objectFit: 'contain',
    objectPosition: 'top center',
    display: 'block',
    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    '$cardWrap:hover &': {
      transform: 'scale(1.05)',
    },
  },
  placeholderMedia: {
    height: 160,
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #e66a03 50%, #d95f02 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    '$cardWrap:hover &': {
      transform: 'scale(1.03)',
    },
  },
  placeholderInitial: {
    fontSize: '2.25rem',
    fontWeight: 700,
    color: 'rgba(255,255,255,0.95)',
    textShadow: '0 2px 12px rgba(0,0,0,0.2)',
    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    '$cardWrap:hover &': {
      transform: 'scale(1.05)',
    },
  },
  cardContent: {
    padding: theme.spacing(1.25, 1.5),
    backgroundColor: theme.palette.background.paper,
    borderRadius: '0 0 10px 10px',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(0,0,0,0.01)',
    },
  },
  internName: {
    fontWeight: 600,
    fontSize: '0.9rem',
    letterSpacing: '-0.02em',
    color: theme.palette.text.primary,
    transition: 'color 0.25s ease',
  },
  teamLabel: {
    fontSize: '0.7rem',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    transition: 'color 0.25s ease',
  },
}));

const Interns = () => {
  const classes = useStyles();
  const [selectedCategory, setSelectedCategory] = useState('DEVELOPMENT');
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (internId) => {
    setImageErrors((prev) => ({ ...prev, [internId]: true }));
  };

  const categories = [
    { id: 'DEVELOPMENT', label: 'Development' },
    { id: 'BUSINESS', label: 'Business' },
    { id: 'OPERATIONS', label: 'Operations' },
  ];

  const internPhotosBase = `${process.env.PUBLIC_URL || ''}/RADZTECH_INTERNS`;
  const internsData = {
    DEVELOPMENT: [
      { id: 1, name: 'Kurt', image: `${internPhotosBase}/KURT.png` },
      { id: 2, name: 'Adam', image: `${internPhotosBase}/ADAM.png` },
      { id: 3, name: 'Brayan', image: `${internPhotosBase}/BRAYAN.png` },
      { id: 4, name: 'Merlvin', image: `${internPhotosBase}/MERLVIN.png` },
      { id: 5, name: 'Marth', image: `${internPhotosBase}/MARTH.png` },
    ],
    BUSINESS: [
      { id: 7, name: 'Dean', image: null },
      { id: 8, name: 'Jerick', image: null },
      { id: 9, name: 'Justine', image: null },
      { id: 10, name: 'Diane', image: null },
      { id: 11, name: 'Vince', image: null },
      { id: 12, name: 'Adrian', image: null },
    ],
    OPERATIONS: [
      { id: 13, name: 'Justine', image: null },
      { id: 14, name: 'Charmaine', image: null },
      { id: 15, name: 'Oliver', image: null },
      { id: 16, name: 'Hyacinth', image: null },
      { id: 17, name: 'Kail', image: null },
      { id: 18, name: 'Minnette', image: null },
    ],
  };

  const teamLabels = {
    DEVELOPMENT: 'Development Team',
    BUSINESS: 'Business Development Team',
    OPERATIONS: 'Operations Team',
  };

  const currentInterns = internsData[selectedCategory] || [];
  const teamLabel = teamLabels[selectedCategory] || 'Team';

  return (
    <Box className={classes.root}>
      <Container maxWidth="lg">
        <Box className={classes.header}>
          <Typography variant="h1" className={classes.title}>
            Meet the Batch 11 Radztech Interns
          </Typography>
          <Typography className={classes.subtitle}>
            Our interns across Development, Business, and Operations
          </Typography>
        </Box>

        <Box className={classes.categoryWrap}>
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`${classes.categoryBtn} ${
                selectedCategory === category.id ? classes.categoryBtnActive : ''
              }`}
              disableElevation
            >
              {category.label}
            </Button>
          ))}
        </Box>

        <Grid container spacing={3} key={selectedCategory} className={classes.gridWrap}>
          {currentInterns.map((intern, index) => (
            <Grid item xs={12} sm={6} md={4} key={intern.id}>
              <Box
                className={classes.cardWrap}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <Card className={classes.card} elevation={0}>
                  {intern.image && !imageErrors[intern.id] ? (
                    <Box className={classes.cardMediaWrap}>
                      <CardMedia
                        component="img"
                        alt={intern.name}
                        image={intern.image}
                        onError={() => handleImageError(intern.id)}
                        className={classes.cardMedia}
                      />
                    </Box>
                  ) : (
                    <Box className={classes.placeholderMedia}>
                      <Typography className={classes.placeholderInitial}>
                        {intern.name.charAt(0)}
                      </Typography>
                    </Box>
                  )}
                  <CardContent className={classes.cardContent}>
                    <Typography className={classes.internName}>{intern.name}</Typography>
                    <Typography className={classes.teamLabel}>{teamLabel}</Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Interns;
