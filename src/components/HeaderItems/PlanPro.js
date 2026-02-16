import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

const PlanPro = () => {
  return (
    <div style={{ width: '100vw', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h1>Pro Plan</h1>
        <p>This is a placeholder page for the Pro plan. Replace with real content.</p>

        <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
          <RouterLink to="/plans" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '8px 16px' }}>Back to Plans</button>
          </RouterLink>

          <RouterLink to="/plans/basic" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '8px 16px' }}>View Basic</button>
          </RouterLink>

          <RouterLink to="/plans/erp" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '8px 16px' }}>View ERP</button>
          </RouterLink>
        </div>
      </div>
    </div>
  );
};

export default PlanPro;
