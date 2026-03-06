import React from 'react';
import { useNavigate, Navigate } from "react-router-dom";
import pic from '../assets/pic.jpg'; // ✅ correct relative path

const CloneUlap = () => {



    return (
          <div 
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',     
        minHeight: '100vh',    
      }}
    >
      <img 
        src={pic} 
        alt="Pic" 
        style={{ width: 300, height: 'auto' ,borderRadius: 22 }} 
      />

    </div>
    );      
}
export default CloneUlap;
