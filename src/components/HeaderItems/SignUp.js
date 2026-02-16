import React from 'react';

const SignUp = () => {
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
        background: 'linear-gradient(135deg, #6A1B9A 0%, #AB47BC 100%)',
      }}>
      <h1
        style={{
          color: '#FFFFFF',
          fontSize: '72px',
          fontWeight: 'bold',
          marginBottom: '20px',
        }}>
        Sign Up
      </h1>
      <p
        style={{
          color: '#E0E0E0',
          fontSize: '20px',
          textAlign: 'center',
          maxWidth: '600px',
        }}>
        Create your account to get started
      </p>
    </div>
  );
};

export default SignUp;
