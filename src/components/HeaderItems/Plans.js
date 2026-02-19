import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

const Plans = () => {

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 20px',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      }}>

      <h1
        style={{
          fontSize: '48px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '60px',
          color: '#FFFFFF',
        }}>
        Tara! Tell us what you need.
      </h1>

      <div
        style={{
          display: 'flex',
          gap: '30px',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          maxWidth: '1200px',
        }}>
        
        {/* Basic Plan */}
        <div
          style={{
            backgroundColor: '#0052CC',
            borderRadius: '20px',
            padding: '40px 30px',
            width: '280px',
            textAlign: 'center',
            color: 'white',
          }}>
          <p style={{ fontSize: '16px', margin: '0 0 10px 0' }}>UlapBiz</p>
          <h2 style={{ fontSize: '48px', fontWeight: 'bold', margin: '0 0 20px 0' }}>Basic</h2>
          <RouterLink to="/plans/basic" style={{ textDecoration: 'none' }}>
            <button
              style={{
                width: '100%',
                padding: '12px 20px',
                backgroundColor: 'white',
                color: '#0052CC',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                marginBottom: '15px',
              }}>
              AVAIL NOW
            </button>
          </RouterLink>
          <p style={{ fontSize: '12px', margin: '0', color: '#ddd' }}>FREE 30-DAY TRIAL FOR ANNUAL CONTRACT</p>
        </div>

        {/* Pro Plan */}
        <div
          style={{
            backgroundColor: '#000000',
            borderRadius: '20px',
            padding: '40px 30px',
            width: '280px',
            textAlign: 'center',
            color: 'white',
          }}>
          <p style={{ fontSize: '16px', margin: '0 0 10px 0' }}>UlapBiz</p>
          <h2 style={{ fontSize: '48px', fontWeight: 'bold', margin: '0 0 20px 0' }}>Pro</h2>
          <RouterLink to="/plans/pro" style={{ textDecoration: 'none' }}>
            <button
              style={{
                width: '100%',
                padding: '12px 20px',
                backgroundColor: 'white',
                color: '#000000',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                marginBottom: '15px',
              }}>
              AVAIL NOW
            </button>
          </RouterLink>
          <p style={{ fontSize: '12px', margin: '0', color: '#999' }}>FREE 30-DAY TRIAL FOR ANNUAL CONTRACT</p>
        </div>

        {/* ERP Plan */}
        <div
          style={{
            backgroundColor: '#4CAF50',
            borderRadius: '20px',
            padding: '40px 30px',
            width: '280px',
            textAlign: 'center',
            color: 'white',
          }}>
          <p style={{ fontSize: '16px', margin: '0 0 10px 0' }}>UlapBiz</p>
          <h2 style={{ fontSize: '48px', fontWeight: 'bold', margin: '0 0 20px 0' }}>ERP</h2>
          <RouterLink to="/plans/erp" style={{ textDecoration: 'none' }}>
            <button
              style={{
                width: '100%',
                padding: '12px 20px',
                backgroundColor: 'white',
                color: '#4CAF50',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                marginBottom: '15px',
              }}>
              AVAIL NOW
            </button>
          </RouterLink>
          <p style={{ fontSize: '12px', margin: '0', color: '#ddd' }}>FREE 30-DAY TRIAL FOR ANNUAL CONTRACT</p>
        </div>
      </div>
    </div>
  );
};

export default Plans;
