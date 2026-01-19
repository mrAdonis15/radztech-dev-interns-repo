import React from 'react';
import { useTheme } from '@material-ui/core/styles';
import ulapImage from '../../images/ulapbiz.png';

const Ulap = () => {
  const theme = useTheme();

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
          marginTop: -150,
          color: theme.palette.primary.main,
          fontSize: '150px',
          fontWeight: 'bold',
          textAlign: 'center',
        }}>
        UlapBiz
      </h1>
    </div>
  );
};

export default Ulap;
