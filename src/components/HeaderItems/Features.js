import React from 'react';

const Features = () => {

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
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      }}>
      <h1
        style={{
          color: '#FFFFFF',
          fontSize: '72px',
          fontWeight: 'bold',
          marginBottom: '20px',
        }}>
        Features
      </h1>
      <p
        style={{
          color: '#E0E0E0',
          fontSize: '20px',
          textAlign: 'center',
          maxWidth: '600px',
        }}>
        Powerful tools at your fingertips
      </p>
    </div>
  );
};

export default Features;
