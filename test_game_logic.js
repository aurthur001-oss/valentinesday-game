
const GAME_WIDTH = 100;
const GAME_HEIGHT = 80; // Usable height

function simulate() {
    let targets = [];
    const speedMult = 1.0;

    // Spawn 5 targets
    for (let i = 0; i < 5; i++) {
        targets.push({
            id: i,
            x: Math.random() * 60 + 20,
            y: Math.random() * 40 + 10,
            dx: (Math.random() > 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.3) * speedMult,
            dy: (Math.random() > 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.3) * speedMult,
        });
    }

    console.log("Starting simulation for 1000 frames...");

    for (let frame = 0; frame < 1000; frame++) {
        targets = targets.map(t => {
            let { x, y, dx, dy } = t;

            x += dx;
            y += dy;

            let hitWall = false;

            // Exact Logic from App.jsx
            if (x <= 2) { x = 2; dx = Math.abs(dx); hitWall = true; }
            if (x >= 98) { x = 98; dx = -Math.abs(dx); hitWall = true; }
            if (y <= 2) { y = 2; dy = Math.abs(dy); hitWall = true; }
            if (y >= 78) { y = 78; dy = -Math.abs(dy); hitWall = true; }

            if (hitWall) {
                dx *= (0.9 + Math.random() * 0.2);
                dy *= (0.9 + Math.random() * 0.2);
                // console.log(`Target ${t.id} hit wall at frame ${frame}: ${x.toFixed(2)}, ${y.toFixed(2)}`);
            }

            return { ...t, x, y, dx, dy };
        });

        // Check for stuck
        // (Simply check if any coordinate is constantly hitting boundaries or staying same place?)
    }

    console.log("Final Positions:");
    targets.forEach(t => {
        console.log(`ID: ${t.id}, X: ${t.x.toFixed(2)}, Y: ${t.y.toFixed(2)}, DX: ${t.dx.toFixed(4)}, DY: ${t.dy.toFixed(4)}`);
        if (t.x <= 2.1 || t.x >= 97.9 || t.y <= 2.1 || t.y >= 77.9) {
            console.error(`WARNING: Target ${t.id} is suspiciously close to wall!`);
        }
        if (Math.abs(t.dx) < 0.01 || Math.abs(t.dy) < 0.01) {
            console.error(`WARNING: Target ${t.id} has very low speed!`);
        }
    });
}

simulate();
