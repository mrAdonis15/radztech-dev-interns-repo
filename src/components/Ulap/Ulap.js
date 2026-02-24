import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Button, Container, makeStyles } from '@material-ui/core';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

const useStyles = makeStyles((theme) => ({
  heroContainer: {
    position: 'relative',
    width: '100%',
    height: 'calc(100vh - 60px)',
    maxHeight: 'calc(100vh - 60px)',
    minHeight: 600,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  video: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: 'translate(-50%, -50%)',
    zIndex: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(30, 30, 30, 0.85) 100%)',
    zIndex: 1,
  },
  particles: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 2,
    opacity: 0.1,
    backgroundImage: `
      radial-gradient(circle at 20% 30%, rgba(255, 117, 4, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(255, 117, 4, 0.2) 0%, transparent 50%)
    `,
    animation: '$pulse 4s ease-in-out infinite',
  },
  contentContainer: {
    position: 'relative',
    zIndex: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4, 3),
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(6, 5),
    },
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
  },
  headline: {
    color: '#FFFFFF',
    fontWeight: 800,
    textAlign: 'center',
    marginBottom: theme.spacing(3),
    fontFamily: 'Poppins, sans-serif',
    textShadow: '0 6px 30px rgba(0, 0, 0, 0.7), 0 2px 10px rgba(0, 0, 0, 0.5)',
    padding: theme.spacing(0, 2),
    [theme.breakpoints.down('sm')]: {
      fontSize: '2.25rem',
      letterSpacing: '1px',
    },
    [theme.breakpoints.up('md')]: {
      fontSize: '5rem',
      letterSpacing: '4px',
    },
  },
  subheadline: {
    color: '#FFFFFF',
    fontWeight: 400,
    textAlign: 'center',
    marginBottom: theme.spacing(6),
    fontFamily: 'Poppins, sans-serif',
    textShadow: '0 2px 15px rgba(0, 0, 0, 0.5)',
    padding: theme.spacing(0, 2),
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.25rem',
      letterSpacing: '0.5px',
    },
    [theme.breakpoints.up('md')]: {
      fontSize: '2rem',
      letterSpacing: '2px',
    },
  },
  applyButton: {
    borderRadius: '50px',
    padding: theme.spacing(2, 4),
    fontSize: '1.125rem',
    fontWeight: 600,
    fontFamily: 'Poppins, sans-serif',
    background: 'linear-gradient(135deg, #FF7504 0%, #FF5500 100%)',
    color: '#FFFFFF',
    boxShadow: '0 8px 25px rgba(255, 117, 4, 0.45), 0 4px 12px rgba(255, 117, 4, 0.3)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-6px) scale(1.06)',
      boxShadow: '0 12px 40px rgba(255, 117, 4, 0.65), 0 6px 20px rgba(255, 117, 4, 0.4)',
      background: 'linear-gradient(135deg, #FF7504 0%, #FF5500 100%)',
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1.5, 3),
      fontSize: '1rem',
    },
  },
  cloudSvg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 120,
    zIndex: 4,
    pointerEvents: 'none',
  },
  '@keyframes pulse': {
    '0%, 100%': {
      opacity: 0.1,
    },
    '50%': {
      opacity: 0.15,
    },
  },
  fadeIn: {
    opacity: 0,
    transform: 'translateY(30px)',
    transition: 'opacity 1.2s ease-out, transform 1.2s ease-out',
  },
  fadeInVisible: {
    opacity: 1,
    transform: 'translateY(0)',
  },
  fadeInDelayed: {
    transition: 'opacity 1.2s ease-out 0.4s, transform 1.2s ease-out 0.4s',
  },
  fadeInButton: {
    transition: 'opacity 1.2s ease-out 0.8s, transform 1.2s ease-out 0.8s',
  },
}));

const Ulap = ({ videoSrc }) => {
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const classes = useStyles();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <Box className={classes.heroContainer}>
      {/* Video Background */}
      {videoSrc && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className={classes.video}>
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* Animated Gradient Overlay */}
      <Box className={classes.overlay} />

      {/* Subtle Animated Particles */}
      <Box className={classes.particles} />

      {/* Content Container */}
      <Container maxWidth="lg" className={classes.contentContainer}>
        {/* Main Headline */}
        <Typography
          variant="h1"
          className={`${classes.headline} ${isVisible ? classes.fadeInVisible : classes.fadeIn}`}>
          CRAFTING SKILLS, CREATING POSSIBILITIES
        </Typography>

        {/* Sub-headline */}
        <Typography
          variant="h2"
          className={`${classes.subheadline} ${isVisible ? classes.fadeInVisible : classes.fadeIn} ${classes.fadeInDelayed}`}>
          OUR INTERNSHIP JOURNEY
        </Typography>

        {/* Apply Now Button */}
        <Button
          component="a"
          href="https://ulap.biz/jobs"
          target="_blank"
          rel="noopener noreferrer"
          variant="contained"
          className={`${classes.applyButton} ${isVisible ? classes.fadeInVisible : classes.fadeIn} ${classes.fadeInButton}`}
          endIcon={<ArrowForwardIcon />}>
          Apply Now
        </Button>
      </Container>

      {/* Cloud Bottom Edge */}
      <svg
        className={classes.cloudSvg}
        preserveAspectRatio="none"
        viewBox="0 0 1200 120">
        <path
          d="M 0 120
             Q 150 90, 300 100
             Q 450 110, 600 95
             Q 750 80, 900 100
             Q 1050 120, 1200 110
             L 1200 120
             L 0 120 Z"
          fill="#FFFFFF"
          stroke="none"
        />
      </svg>
    </Box>
  );
};

export default Ulap;