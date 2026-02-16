import React from 'react';

const SignIn = () => {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #2d5016 0%, #558B2F 100%)',
      }}>
      <h1
        style={{
          color: '#FFFFFF',
          fontSize: '72px',
          fontWeight: 'bold',
          marginBottom: '20px',
        }}>
        Sign In
      </h1>
      <p
        style={{
          color: '#E0E0E0',
          fontSize: '20px',
          textAlign: 'center',
          maxWidth: '600px',
        }}>
        Welcome back to your account
      </p>
    </div>
  );
};

export default SignIn;
