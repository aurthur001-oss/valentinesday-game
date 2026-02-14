import React from 'react';

const Cat = ({ type, position, state }) => {
    // state: 'idle', 'happy', 'hurt'
    // type: 'ginger', 'cream'

    // External Asset Path
    const src = `/assets/cats/${type}_${state}.svg`;

    return (
        <div
            className={`cat-container ${state}`}
            style={{
                position: 'relative',
                width: '120px',
                height: '120px',
                zIndex: 20
            }}
        >
            <img
                src={src}
                alt={`${type} cat`}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />

            <style>{`
        .cat-container { transform-origin: bottom center; }
        .happy { animation: jump 0.3s ease-out; }
        .hurt { animation: shake-cat 0.4s ease-in-out; }
        
        @keyframes jump {
            0% { transform: translateY(0) scale(1,1); }
            50% { transform: translateY(-20px) scale(0.9, 1.1); }
            100% { transform: translateY(0) scale(1,1); }
        }
        @keyframes shake-cat {
            0% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
            100% { transform: translateX(0); }
        }
      `}</style>
        </div>
    );
};

export default Cat;
