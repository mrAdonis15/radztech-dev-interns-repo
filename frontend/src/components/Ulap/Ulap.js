import React from 'react';
import ulapImage from '../../images/3Dmascot.png';

const Ulap = () => {

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
        background: 'linear-gradient(135deg, #FF7504 0%, #FFB347 100%)',
      }}>
      <img
        src={ulapImage}
        alt="ulap"
        style={{
          maxWidth: '100%',
          maxHeight: '80vh',
          objectFit: 'contain',
        }}
      />

      <h1
        style={{
          marginTop: -50,
          color: '#000000ff  ',
          fontSize: '100px',
          fontWeight: 'bold',
          textAlign: 'center',
        }}>
        Hello Interns! Welcome to
      </h1>

      <h1
        style={{
          marginTop: -100,
          color: '#FF7504',
          fontSize: '100px',
          fontWeight: 'bold',
          textAlign: 'center',
        }}>
        UlapBiz
      </h1>
    </div>
  );
};

export default Ulap;
