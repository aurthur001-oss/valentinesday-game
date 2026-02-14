import React, { useState } from 'react';

const RapidTapButton = ({ onTap }) => {
    const [scale, setScale] = useState(1);

    const handleClick = (e) => {
        // Prevent default to avoid double-tap zoom on some devices
        e.preventDefault();

        onTap();

        // Visual feedback
        setScale(0.9);
        setTimeout(() => setScale(1), 50);

        // Create floating "+1" or icon (simplified)
        // In a full implementation, we'd spawn a particle here.
    };

    return (
        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 50 }}>
            <button
                onPointerDown={handleClick} // Better response than onClick
                style={{
                    background: '#FFD93D', // Yellow/Gold for "Energy"
                    color: '#5D4037',
                    padding: '15px',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    border: '4px solid white',
                    boxShadow: '0 4px 0 #EFA07A',
                    transform: `scale(${scale})`,
                    transition: 'transform 0.05s',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    lineHeight: '1.2'
                }}
            >
                <span>TAP</span>
                <span style={{ fontSize: '0.8rem' }}>BOOST</span>
            </button>
        </div>
    );
};

export default RapidTapButton;
