import React from 'react';

const Home = () => {

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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
      <h1
        style={{
          color: '#FFFFFF',
          fontSize: '72px',
          fontWeight: 'bold',
          marginBottom: '20px',
        }}>
        Home
      </h1>
      <p
        style={{
          color: '#E0E0E0',
          fontSize: '20px',
          textAlign: 'center',
          maxWidth: '600px',
        }}>
        Welcome to our platform
      </p>
    </div>
  );
};

export default Home;
