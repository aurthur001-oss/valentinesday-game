import React from 'react';

// USER UPLOADED IMAGE
const USER_IMAGE = '/cheer_user.png';

// ORIGINAL ASSETS (cheerleader1.png to cheerleader7.png)
const NUM_ORIGINAL_CHEERS = 7;

export const getCheerleaderImage = () => {
    // 20% chance for user upload
    if (Math.random() < 0.2) return 'user-upload';

    // Otherwise pick one of the 7 original assets (1-7)
    return Math.floor(Math.random() * NUM_ORIGINAL_CHEERS) + 1;
};

const CheerleaderSystem = ({ cheers }) => {
    return (
        <>
            {cheers.map(c => {
                let src = '';
                if (c.img === 'user-upload') src = USER_IMAGE;
                else src = `/assets/cheerleaders/cheerleader${c.img}.png`;

                return (
                    <div key={c.id} style={{
                        position: 'absolute',
                        left: `${c.x}%`,
                        top: `${c.y}%`,
                        transform: 'translate(-50%, -50%)',
                        width: '120px',
                        height: '120px',
                        pointerEvents: 'none',
                        zIndex: 100,
                        animation: 'pop-in-out 4s forwards',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <img
                                src={src}
                                alt="Cheer"
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                        <div style={{
                            position: 'absolute',
                            bottom: '-10px',
                            background: 'rgba(255,255,255,0.9)',
                            padding: '5px 10px',
                            borderRadius: '10px',
                            fontWeight: 'bold',
                            color: '#E91E63',
                            fontSize: '1rem',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                        }}>
                            {c.text}
                        </div>
                    </div>
                );
            })}
            <style>{`
        @keyframes pop-in-out {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
            10% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
            20% { transform: translate(-50%, -50%) scale(1); }
            80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -100%) scale(0.8); }
        }
      `}</style>
        </>
    );
};

export default CheerleaderSystem;
