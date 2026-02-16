import React from 'react';

const SchedsnReps = () => {

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
        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      }}>
      <h1
        style={{
          color: '#FFFFFF',
          fontSize: '72px',
          fontWeight: 'bold',
          marginBottom: '20px',
        }}>
        Schedules & Reports
      </h1>
      <p
        style={{
          color: '#E0E0E0',
          fontSize: '20px',
          textAlign: 'center',
          maxWidth: '600px',
        }}>
        Track and manage your time efficiently
      </p>
    </div>
  );
};

export default SchedsnReps;
