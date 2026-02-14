import React from 'react';

const Target = ({ type, x, y, rotation }) => {
    // Determine if bad item
    const isBad = ['vacuum', 'spray', 'dog', 'dog_brown', 'dog_black', 'dog_spotted', 'cactus', 'bomb', 'cucumber', 'water', 'thunder', 'trap', 'ghost', 'bee', 'broom'].includes(type);
    const isHeart = type === 'heart' || type === 'heart_life';

    let size = '60px';
    if (['vacuum', 'dog', 'dog_brown', 'dog_black', 'dog_spotted', 'ghost', 'trap'].includes(type)) size = '70px';
    if (isHeart) size = '90px';

    // Determine path directly - no mapping needed as we have specific files now
    let src = '';
    if (isHeart) src = '/assets/items/good/heart.svg';
    else if (isBad) src = `/assets/items/bad/${type}.svg`;
    else src = `/assets/items/good/${type}.svg`;

    return (
        <div style={{
            position: 'absolute',
            left: x,
            top: y,
            width: size,
            height: size,
            transform: `translate(-50%, -50%) rotate(${rotation || 0}deg)`,
            pointerEvents: 'none',
            zIndex: isHeart ? 100 : 15,
            filter: isBad ? 'drop-shadow(0 0 8px rgba(255,0,0,0.5))' : (isHeart ? 'drop-shadow(0 0 15px gold)' : 'drop-shadow(0 5px 5px rgba(0,0,0,0.2))'),
        }}>
            <img src={src} alt={type} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            {isHeart && (
                <style>{`.pulse-heart { animation: beat 0.8s infinite alternate; } @keyframes beat { to { transform: scale(1.1); } }`}</style>
            )}
        </div>
    );
};

export default Target;
