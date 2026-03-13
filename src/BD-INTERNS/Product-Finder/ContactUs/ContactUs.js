import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  MenuItem,
  makeStyles,
} from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

const PLANS = [
  { id: 'starter', name: 'Starter' },
  { id: 'professional', name: 'Professional' },
  { id: 'enterprise', name: 'Enterprise' },
];

const useStyles = makeStyles((theme) => ({
  root: {
    fontFamily: theme.typography.body1.fontFamily,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(5),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    animation: '$pageEnter 0.4s ease-out',
    [theme.breakpoints.down('xs')]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
    [theme.breakpoints.down('sm')]: {
      paddingBottom: theme.spacing(4),
    },
  },
  '@keyframes pageEnter': {
    '0%': { opacity: 0, transform: 'translateY(12px)' },
    '100%': { opacity: 1, transform: 'translateY(0)' },
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: theme.spacing(3),
  },
  backBtn: {
    fontFamily: theme.typography.body1.fontFamily,
    textTransform: 'none',
    fontSize: '0.9rem',
    transition: 'color 0.2s ease, background-color 0.2s ease',
  },
  header: {
    textAlign: 'center',
    marginBottom: theme.spacing(3),
    paddingTop: theme.spacing(1),
  },
  title: {
    fontFamily: theme.typography.fontFamily,
    fontWeight: 700,
    fontSize: '2rem',
    color: '#1a1a1a',
    marginBottom: theme.spacing(0.5),
  },
  subtitle: {
    fontFamily: theme.typography.body1.fontFamily,
    color: '#666',
    fontSize: '0.95rem',
  },
  content: {
    maxWidth: 440,
    margin: '0 auto',
  },
  formSection: {
    marginTop: theme.spacing(1),
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
  },
  fieldWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
  },
  fieldLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#444',
  },
  input: {
    '& .MuiOutlinedInput-input': {
      fontFamily: theme.typography.body1.fontFamily,
      padding: theme.spacing(1.25),
      fontSize: '0.9rem',
      transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
    },
    '& .MuiOutlinedInput-root': {
      borderRadius: 4,
      transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
    },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
  },
  submitBtn: {
    fontFamily: theme.typography.body1.fontFamily,
    alignSelf: 'flex-start',
    padding: theme.spacing(1.25, 2.5),
    fontSize: '0.9rem',
    textTransform: 'none',
    marginTop: theme.spacing(0.5),
    transition: 'background-color 0.25s ease, transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': { transform: 'translateY(-1px)' },
  },
  intentGroup: {
    marginBottom: theme.spacing(1),
  },
  intentLabel: {
    fontFamily: theme.typography.fontFamily,
    fontWeight: 600,
    fontSize: '0.85rem',
    marginBottom: theme.spacing(0.75),
    color: '#444',
  },
  radioLabel: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: '0.9rem',
  },
}));

const INTENT_DEMO = 'demo';
const INTENT_INQUIRY = 'inquiry';

const ContactUs = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get('plan');

  const [intent, setIntent] = useState(INTENT_DEMO);
  const [plan, setPlan] = useState(planParam || '');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (planParam && PLANS.some((p) => p.id === planParam)) {
      setPlan(planParam);
    }
  }, [planParam]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (intent === INTENT_DEMO) {
      window.alert("Thank you! We'll reach out to schedule your demo. (Demo)");
    } else {
      window.alert('Thank you! We will get back to you soon. (Inquiry)');
    }
  };

  return (
    <Container maxWidth="lg" className={classes.root} disableGutters>
      <Box className={classes.topBar}>
        <Button
          component="button"
          onClick={() => navigate(-1)}
          startIcon={<ArrowBackIcon />}
          className={classes.backBtn}
          color="primary"
        >
          Back
        </Button>
      </Box>

      <Box className={classes.header} component="header">
        <Typography id="contact-heading" variant="h1" component="h1" className={classes.title}>
          Contact Us
        </Typography>
        <Typography variant="body1" className={classes.subtitle}>
          Book a demo or reach out—we&apos;re here to help.
        </Typography>
      </Box>

      <Box className={classes.content} component="section" aria-labelledby="contact-heading">
        <form onSubmit={handleSubmit} className={`${classes.form} ${classes.formSection}`}>
          <FormControl component="fieldset" className={classes.intentGroup}>
            <FormLabel className={classes.intentLabel}>What would you like to do?</FormLabel>
            <RadioGroup row value={intent} onChange={(e) => setIntent(e.target.value)}>
              <FormControlLabel
                value={INTENT_DEMO}
                control={<Radio color="primary" size="small" />}
                label={<span className={classes.radioLabel}>Book a demo</span>}
              />
              <FormControlLabel
                value={INTENT_INQUIRY}
                control={<Radio color="primary" size="small" />}
                label={<span className={classes.radioLabel}>General inquiry</span>}
              />
            </RadioGroup>
          </FormControl>

          {intent === INTENT_DEMO && (
            <Box className={classes.fieldWrap}>
              <Typography className={classes.fieldLabel}>Interested plan</Typography>
              <TextField
                select
                variant="outlined"
                fullWidth
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className={classes.input}
              >
                <MenuItem value="">Select a plan</MenuItem>
                {PLANS.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          )}

          <Box className={classes.fieldWrap}>
            <Typography className={classes.fieldLabel}>Name</Typography>
            <TextField variant="outlined" fullWidth required className={classes.input} placeholder="Enter your name" />
          </Box>
          <Box className={classes.fieldWrap}>
            <Typography className={classes.fieldLabel}>Email</Typography>
            <TextField type="email" variant="outlined" fullWidth required className={classes.input} placeholder="Enter your email" />
          </Box>
          <Box className={classes.fieldWrap}>
            <Typography className={classes.fieldLabel}>Company (optional)</Typography>
            <TextField variant="outlined" fullWidth className={classes.input} placeholder="Enter your company name" />
          </Box>
          <Box className={classes.fieldWrap}>
            <Typography className={classes.fieldLabel}>Message</Typography>
            <TextField
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              className={classes.input}
              placeholder={
                intent === INTENT_DEMO
                  ? 'Tell us about your payroll needs or preferred demo date...'
                  : 'How can we help?'
              }
            />
          </Box>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.submitBtn}
          >
            {intent === INTENT_DEMO ? 'Book a demo' : 'Send inquiry'}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default ContactUs;
