// Main Game Controller
window.addEventListener('load', () => {
    // --- CANVAS SETUP ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // --- UI ELEMENTS ---
    const startScreen = document.getElementById('startScreen');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const victoryScreen = document.getElementById('victoryScreen');
    const pauseScreen = document.getElementById('pauseScreen');
    
    const startButton = document.getElementById('startButton');
    const restartButton = document.getElementById('restartButton');
    const nextLevelButton = document.getElementById('nextLevelButton');
    const resumeButton = document.getElementById('resumeButton');
    const muteButton = document.getElementById('muteButton');
    
    const scoreVal = document.getElementById('score');
    const coinsVal = document.getElementById('coins');
    const timeVal = document.getElementById('time');
    
    const finalScore = document.getElementById('finalScore');
    const victoryScore = document.getElementById('victoryScore');
    const timeBonus = document.getElementById('timeBonus');

    // --- GAME CONSTANTS & STATE VARIABLES ---
    let gameState = 'MENU'; // MENU, PLAYING, PAUSED, GAMEOVER, LEVELCLEAR
    let score = 0;
    let coins = 0;
    let gameTimer = 360;
    let timerTick = 0;
    let globalTick = 0;

    let levelGrid = []; // Dynamic copy of level map
    let enemiesList = [];
    let itemsList = [];
    let particlesList = [];
    let camera = { x: 0 };
    
    let flagpoleX = 0;
    let castleDoorX = 0;

    // --- MARIO OBJECT ---
    const mario = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        width: 12,
        height: 16,
        isBig: false,
        onGround: false,
        facingLeft: false,
        state: 'idle', // idle, walk, jump, dead, slide, walk-to-castle, enter-castle
        invulnFrames: 0,
        jumpTimer: 0,
        deathTimer: 0,
        victoryTimer: 0,
        isDucking: false,
        visible: true
    };

    // --- CONTROLS INPUT STATE ---
    const keys = {
        Left: false,
        Right: false,
        Jump: false,
        Run: false
    };

    // Keyboard bindings mapping
    const keyMap = {
        'ArrowLeft': 'Left', 'KeyA': 'Left',
        'ArrowRight': 'Right', 'KeyD': 'Right',
        'ArrowUp': 'Jump', 'KeyW': 'Jump', 'Space': 'Jump',
        'ShiftLeft': 'Run', 'ShiftRight': 'Run'
    };

    // --- SETUP CONTROLS ---

    // Keyboard handlers
    window.addEventListener('keydown', (e) => {
        if (gameState === 'PLAYING') {
            if (e.code === 'Escape') {
                togglePause();
                return;
            }
            if (keyMap[e.code]) {
                keys[keyMap[e.code]] = true;
                // Initialize audio context on first key press
                audio.init();
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        if (keyMap[e.code]) {
            keys[keyMap[e.code]] = false;
        }
    });

    // Touch Controls (Mobile)
    const touchButtons = {
        btnLeft: document.getElementById('btnLeft'),
        btnRight: document.getElementById('btnRight'),
        btnJump: document.getElementById('btnJump'),
        btnRun: document.getElementById('btnRun')
    };

    function hookTouchButton(btn, keyName) {
        if (!btn) return;
        
        const startHandler = (e) => {
            e.preventDefault();
            keys[keyName] = true;
            audio.init();
        };
        const endHandler = (e) => {
            e.preventDefault();
            keys[keyName] = false;
        };

        btn.addEventListener('touchstart', startHandler, { passive: false });
        btn.addEventListener('touchend', endHandler, { passive: false });
        btn.addEventListener('touchcancel', endHandler, { passive: false });

        // Add mouse support for virtual controls
        btn.addEventListener('mousedown', () => { keys[keyName] = true; audio.init(); });
        btn.addEventListener('mouseup', () => { keys[keyName] = false; });
        btn.addEventListener('mouseleave', () => { keys[keyName] = false; });
    }

    hookTouchButton(touchButtons.btnLeft, 'Left');
    hookTouchButton(touchButtons.btnRight, 'Right');
    hookTouchButton(touchButtons.btnJump, 'Jump');
    hookTouchButton(touchButtons.btnRun, 'Run');

    // UI Buttons
    startButton.addEventListener('click', () => {
        audio.init();
        startGame();
    });
    restartButton.addEventListener('click', startGame);
    nextLevelButton.addEventListener('click', startGame);
    resumeButton.addEventListener('click', togglePause);
    
    muteButton.addEventListener('click', () => {
        const isMuted = audio.toggleMute();
        muteButton.innerText = isMuted ? '🔇 Sound Off' : '🔊 Sound On';
    });

    // --- GAME ENGINE FUNCTIONS ---

    function startGame() {
        score = 0;
        coins = 0;
        gameTimer = 360;
        timerTick = 0;
        globalTick = 0;
        camera.x = 0;

        // Reset Mario
        mario.x = 60;
        mario.y = 150;
        mario.vx = 0;
        mario.vy = 0;
        mario.isBig = false;
        mario.height = 16;
        mario.onGround = false;
        mario.facingLeft = false;
        mario.state = 'idle';
        mario.invulnFrames = 0;
        mario.jumpTimer = 0;
        mario.deathTimer = 0;
        mario.victoryTimer = 0;
        mario.isDucking = false;
        mario.visible = true;

        // Load Level Map Data
        const rawMap = level.getMapData();
        levelGrid = rawMap.map(row => row.split(''));

        // Scan level grid for flagpole, castle door, and initialize coordinates
        flagpoleX = 0;
        castleDoorX = 0;
        for (let r = 0; r < level.GRID_HEIGHT; r++) {
            for (let c = 0; c < level.MAP_COLS; c++) {
                const char = levelGrid[r][c];
                if (char === 'f' || char === 'F') {
                    if (flagpoleX === 0) flagpoleX = c * level.TILE_SIZE + 8; // Align flag
                }
                if (char === 'c') {
                    castleDoorX = c * level.TILE_SIZE + 8;
                }
            }
        }

        // Spawn Enemies
        enemiesList = level.enemies.map(spawn => ({
            x: spawn.x,
            y: spawn.y,
            vx: -0.5,
            vy: 0,
            width: 16,
            height: 16,
            type: spawn.type,
            state: 'walk', // walk, flat
            flatTimer: 0,
            onGround: false
        }));

        // Reset Lists
        itemsList = [];
        particlesList = [];

        // Hide menus
        startScreen.classList.add('hidden');
        startScreen.classList.remove('active');
        gameOverScreen.classList.add('hidden');
        victoryScreen.classList.add('hidden');
        pauseScreen.classList.add('hidden');

        // Check if user is on mobile to show virtual controls
        const touchControls = document.getElementById('touchControls');
        if (window.innerWidth <= 600 || ('ontouchstart' in window)) {
            touchControls.classList.remove('hidden');
        }

        gameState = 'PLAYING';
    }

    function togglePause() {
        if (gameState === 'PLAYING') {
            gameState = 'PAUSED';
            pauseScreen.classList.remove('hidden');
        } else if (gameState === 'PAUSED') {
            gameState = 'PLAYING';
            pauseScreen.classList.add('hidden');
        }
    }

    function spawnDebris(x, y) {
        // Spawn 4 brick shrapnels flying off
        const offsets = [
            { vx: -1.5, vy: -3.5 },
            { vx: 1.5, vy: -3.5 },
            { vx: -1.0, vy: -2.0 },
            { vx: 1.0, vy: -2.0 }
        ];
        offsets.forEach(off => {
            particlesList.push({
                x: x + 8,
                y: y + 8,
                vx: off.vx,
                vy: off.vy,
                type: 'brick-debris',
                life: 60
            });
        });
    }

    function spawnScoreText(text, x, y) {
        particlesList.push({
            x: x,
            y: y,
            text: text,
            type: 'text',
            life: 45
        });
    }

    function handleBlockHit(c, r, side) {
        if (side !== 'bottom') return; // Must hit from below
        const tile = levelGrid[r][c];

        if (tile === 'Q' || tile === 'M') {
            // Transform block to used state
            levelGrid[r][c] = 'X';
            
            // Push brick block bump effect particle
            particlesList.push({
                x: c * level.TILE_SIZE,
                y: r * level.TILE_SIZE,
                vx: 0,
                vy: -2,
                type: 'block-bump',
                origY: r * level.TILE_SIZE,
                life: 10
            });

            if (tile === 'Q') {
                // Spawn bouncing Coin
                coins++;
                score += 200;
                audio.playCoin();
                
                // Spawn coin particle
                particlesList.push({
                    x: c * level.TILE_SIZE + 4,
                    y: r * level.TILE_SIZE - 12,
                    vx: 0,
                    vy: -4,
                    type: 'coin-bounce',
                    life: 25
                });
                spawnScoreText("+200", c * level.TILE_SIZE, r * level.TILE_SIZE - 8);
            } else if (tile === 'M') {
                // Spawn Mushroom
                audio.playPowerUp(); // Spawn sound or powerup tone
                itemsList.push({
                    x: c * level.TILE_SIZE,
                    y: r * level.TILE_SIZE, // Spawns inside block, slides up
                    targetY: (r - 1) * level.TILE_SIZE,
                    vx: 0,
                    vy: -0.5,
                    width: 16,
                    height: 16,
                    type: 'mushroom',
                    state: 'spawning',
                    onGround: false
                });
            }
        } else if (tile === 'B') {
            if (mario.isBig) {
                // Shatter brick
                levelGrid[r][c] = '.';
                audio.playStomp();
                spawnDebris(c * level.TILE_SIZE, r * level.TILE_SIZE);
                score += 50;
            } else {
                // Bump effect but do not break (small Mario)
                particlesList.push({
                    x: c * level.TILE_SIZE,
                    y: r * level.TILE_SIZE,
                    vx: 0,
                    vy: -1.5,
                    type: 'block-bump',
                    origY: r * level.TILE_SIZE,
                    life: 10
                });
                audio.playStomp();
            }
        }
    }

    function killMario() {
        if (mario.state === 'dead') return;
        mario.state = 'dead';
        mario.vx = 0;
        mario.vy = -5.0; // Fly up
        mario.deathTimer = 150; // Death animation duration
        audio.playDeath();
    }

    function checkMarioEnemiesCollisions() {
        if (mario.state === 'dead' || mario.state === 'slide' || mario.state === 'walk-to-castle') return;

        const marioBox = {
            x: mario.x,
            y: mario.y,
            width: mario.width,
            height: mario.height
        };

        enemiesList.forEach(enemy => {
            if (enemy.state === 'flat') return;

            const enemyBox = {
                x: enemy.x,
                y: enemy.y,
                width: enemy.width,
                height: enemy.height
            };

            if (physics.checkCollision(marioBox, enemyBox)) {
                // Stomp check: Mario is falling down onto Goomba top
                const stompHeight = enemy.y - mario.height + 6;
                if (mario.vy > 0 && mario.y <= stompHeight) {
                    // Stomp!
                    enemy.state = 'flat';
                    enemy.flatTimer = 30; // 30 frames flattened
                    enemy.vx = 0;
                    
                    mario.vy = -3.8; // Bounce Mario up
                    score += 100;
                    audio.playStomp();
                    spawnScoreText("+100", enemy.x, enemy.y - 8);
                } else {
                    // Normal hit
                    if (mario.invulnFrames > 0) return; // Invulnerable

                    if (mario.isBig) {
                        mario.isBig = false;
                        mario.height = 16;
                        mario.y += 16; // Shift down
                        mario.invulnFrames = 60; // 1 second flashing
                        audio.playPowerDown();
                    } else {
                        killMario();
                    }
                }
            }
        });
    }

    function checkMarioItemsCollisions() {
        if (mario.state === 'dead') return;

        const marioBox = {
            x: mario.x,
            y: mario.y,
            width: mario.width,
            height: mario.height
        };

        for (let i = itemsList.length - 1; i >= 0; i--) {
            const item = itemsList[i];
            if (item.state === 'spawning') continue;

            const itemBox = {
                x: item.x,
                y: item.y,
                width: item.width,
                height: item.height
            };

            if (physics.checkCollision(marioBox, itemBox)) {
                if (item.type === 'mushroom') {
                    // Collect Mushroom
                    audio.playPowerUp();
                    score += 1000;
                    spawnScoreText("+1000", item.x, item.y - 12);
                    
                    if (!mario.isBig) {
                        mario.isBig = true;
                        mario.height = 32;
                        mario.y -= 16; // Shift up so Mario doesn't clip
                    }
                    itemsList.splice(i, 1);
                }
            }
        }
    }

    // --- GAME UPDATE STATE MACHINE ---

    function update() {
        globalTick++;

        if (gameState === 'PLAYING') {
            // Update HUD text
            scoreVal.innerText = String(score).padStart(6, '0');
            coinsVal.innerText = String(coins).padStart(2, '0');
            timeVal.innerText = String(gameTimer).padStart(3, '0');

            // Handle timer count down
            timerTick++;
            if (timerTick >= 60) { // 60 frames = 1 second
                timerTick = 0;
                gameTimer--;
                if (gameTimer <= 0) {
                    killMario();
                }
            }

            updateMario();
            updateEnemies();
            updateItems();
            updateParticles();
            checkMarioEnemiesCollisions();
            checkMarioItemsCollisions();
            updateCamera();
        } else if (gameState === 'LEVELCLEAR') {
            updateLevelClear();
            updateParticles();
        } else if (gameState === 'GAMEOVER') {
            // Static/Paused state, menu waits for click
        }
    }

    function updateMario() {
        // Invuln frames flicker
        if (mario.invulnFrames > 0) {
            mario.invulnFrames--;
            mario.visible = (Math.floor(globalTick / 4) % 2 === 0);
        } else {
            mario.visible = true;
        }

        if (mario.state === 'dead') {
            mario.vy += physics.GRAVITY * 0.8;
            mario.y += mario.vy;
            mario.deathTimer--;
            if (mario.deathTimer <= 0) {
                gameState = 'GAMEOVER';
                finalScore.innerText = String(score).padStart(6, '0');
                gameOverScreen.classList.remove('hidden');
            }
            return;
        }

        // --- Controls Input -> Physics Acceleration ---
        const acc = keys.Run ? 0.22 : 0.13;
        const maxSpeed = keys.Run ? 2.5 : 1.6;

        if (keys.Left) {
            mario.vx -= acc;
            mario.facingLeft = true;
            if (mario.vx < -maxSpeed) mario.vx = -maxSpeed;
            mario.state = 'walk';
        } else if (keys.Right) {
            mario.vx += acc;
            mario.facingLeft = false;
            if (mario.vx > maxSpeed) mario.vx = maxSpeed;
            mario.state = 'walk';
        } else {
            // Apply inertia deceleration
            mario.vx *= physics.FRICTION;
            if (Math.abs(mario.vx) < 0.1) {
                mario.vx = 0;
                mario.state = 'idle';
            }
        }

        // Jump Handling
        if (keys.Jump) {
            if (mario.onGround) {
                audio.playJump();
                mario.vy = -4.5;
                mario.onGround = false;
                mario.jumpTimer = 14; // Force duration
            } else if (mario.jumpTimer > 0) {
                // Dynamic higher jump by holding key
                mario.vy -= 0.14;
                mario.jumpTimer--;
            }
        } else {
            mario.jumpTimer = 0;
        }

        // Fall off level boundary death
        if (mario.y > canvas.height) {
            killMario();
            return;
        }

        // Apply gravity
        mario.vy += physics.GRAVITY;
        if (mario.vy > physics.TERMINAL_VELOCITY) {
            mario.vy = physics.TERMINAL_VELOCITY;
        }

        // Check if jumping
        if (!mario.onGround) {
            mario.state = 'jump';
        }

        // Apply custom movement and resolve tilemap collisions
        physics.resolveTileCollisions(mario, level, handleBlockHit);

        // Clamp Mario's position to left edge of screen
        if (mario.x < camera.x) {
            mario.x = camera.x;
            mario.vx = 0;
        }

        // --- Trigger Flagpole Slide victory ---
        if (flagpoleX > 0 && mario.x >= flagpoleX - 6 && mario.state !== 'slide') {
            mario.state = 'slide';
            mario.vx = 0;
            mario.vy = 1.2; // Slide down slowly
            mario.x = flagpoleX - 4; // Align center
            audio.playStageClear();
            gameState = 'LEVELCLEAR';
            mario.victoryTimer = 0;
        }
    }

    function updateLevelClear() {
        mario.victoryTimer++;

        if (mario.state === 'slide') {
            mario.y += mario.vy;
            // Scan for ground contact
            const col = Math.floor(mario.x / level.TILE_SIZE);
            const row = Math.floor((mario.y + mario.height) / level.TILE_SIZE);
            const tile = level.getTileAt(col, row);
            
            // Check if Mario hit the ground
            if (physics.isTileSolid(tile) || mario.y >= 192) {
                mario.state = 'walk-to-castle';
                mario.vx = 1.0;
                mario.vy = 0;
                if (mario.y > 192) mario.y = 192; // Clamp
            }
        } else if (mario.state === 'walk-to-castle') {
            mario.x += mario.vx;
            mario.state = 'walk';
            
            // Apply standard gravity & collisions so Mario lands/walks properly
            mario.vy += physics.GRAVITY;
            physics.resolveTileCollisions(mario, level);

            // Reached castle entry door
            if (castleDoorX > 0 && mario.x >= castleDoorX) {
                mario.state = 'enter-castle';
                mario.visible = false;
                mario.vx = 0;
            }
        } else if (mario.state === 'enter-castle') {
            // Wait brief pause, then run satisfying timer countdown score count
            if (mario.victoryTimer > 180) { // ~3 seconds after landing
                if (gameTimer > 0) {
                    gameTimer -= 2;
                    if (gameTimer < 0) gameTimer = 0;
                    score += 20; // 10 points per timer tick (or 20 for double decrease speed)
                    audio.playCoin();
                    
                    scoreVal.innerText = String(score).padStart(6, '0');
                    timeVal.innerText = String(gameTimer).padStart(3, '0');
                } else {
                    // Show victory panel
                    gameState = 'GAMEOVER';
                    victoryScore.innerText = String(score).padStart(6, '0');
                    timeBonus.innerText = String(score);
                    victoryScreen.classList.remove('hidden');
                }
            }
        }
    }

    function updateEnemies() {
        enemiesList.forEach((enemy, idx) => {
            if (enemy.state === 'flat') {
                enemy.flatTimer--;
                if (enemy.flatTimer <= 0) {
                    // Remove from list
                    enemiesList.splice(idx, 1);
                }
                return;
            }

            // Normal patrolling logic
            enemy.vy += physics.GRAVITY;

            // Apply movement and resolve collisions
            physics.resolveTileCollisions(enemy, level, (c, r, side) => {
                if (side === 'left' || side === 'right') {
                    enemy.vx = (side === 'left') ? -0.5 : 0.5;
                }
            });
        });
    }

    function updateItems() {
        itemsList.forEach((item, idx) => {
            if (item.state === 'spawning') {
                item.y += item.vy; // Rise up
                if (item.y <= item.targetY) {
                    item.y = item.targetY;
                    item.state = 'active';
                    item.vx = 1.0; // Start sliding
                    item.vy = 0;
                }
                return;
            }

            // Apply gravity
            item.vy += physics.GRAVITY;

            // Apply movement and resolve collisions
            physics.resolveTileCollisions(item, level, (c, r, side) => {
                if (side === 'left' || side === 'right') {
                    item.vx = (side === 'left') ? -1.0 : 1.0;
                }
            });
        });
    }

    function updateParticles() {
        for (let i = particlesList.length - 1; i >= 0; i--) {
            const part = particlesList[i];
            part.life--;
            
            if (part.life <= 0) {
                particlesList.splice(i, 1);
                continue;
            }

            if (part.type === 'brick-debris') {
                part.vy += physics.GRAVITY * 0.7; // fall
                part.x += part.vx;
                part.y += part.vy;
            } else if (part.type === 'coin-bounce') {
                part.vy += physics.GRAVITY * 0.8;
                part.y += part.vy;
            } else if (part.type === 'block-bump') {
                // Moves up then down back to origin
                if (part.life > 5) {
                    part.y += part.vy;
                } else {
                    part.y -= part.vy;
                }
            } else if (part.type === 'text') {
                part.y -= 0.4; // float upwards
            }
        }
    }

    function updateCamera() {
        // Camera scrolls dynamically to follow Mario
        const targetCamX = mario.x - 180;
        if (targetCamX > camera.x) {
            camera.x = targetCamX;
        }

        // Clamp camera to Level width
        if (camera.x > level.LEVEL_WIDTH - canvas.width) {
            camera.x = level.LEVEL_WIDTH - canvas.width;
        }
        if (camera.x < 0) camera.x = 0;
    }

    // --- RENDER GAME CANVAS ---

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Draw Sky background
        ctx.fillStyle = '#5c94fc'; // Retro NES Sky Blue
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Draw static/parallax scenery
        level.scenery.forEach(scene => {
            // Basic parallax logic
            let sceneX = scene.x - camera.x;
            if (scene.type === 'cloud') {
                sceneX = scene.x - camera.x * 0.3; // slower cloud scroll
            }
            sprites.drawScenery(ctx, scene.type, sceneX, scene.y, scene.w, scene.h);
        });

        // 3. Draw Level Tiles
        const startCol = Math.floor(camera.x / level.TILE_SIZE);
        const endCol = Math.ceil((camera.x + canvas.width) / level.TILE_SIZE) + 1;

        for (let r = 0; r < level.GRID_HEIGHT; r++) {
            for (let c = startCol; c < endCol; c++) {
                const tile = level.getTileAt(c, r);
                if (tile && tile !== '.' && tile !== ' ' && tile !== 'f' && tile !== 'F' && tile !== 'C' && tile !== 'c') {
                    const tileX = c * level.TILE_SIZE - camera.x;
                    const tileY = r * level.TILE_SIZE;
                    
                    let drawType = 'solid';
                    if (tile === 'G') drawType = 'ground';
                    else if (tile === 'B') drawType = 'brick';
                    else if (tile === 'Q' || tile === 'M') drawType = 'question';
                    else if (tile === 'X') drawType = 'solid';
                    else if (tile === '[') drawType = 'pipe-top'; // pipe top lip left/right handled
                    else if (tile === ']') drawType = 'pipe-top';
                    else if (tile === 'I' || tile === 'J') drawType = 'pipe';

                    // Top pipe lip has coordinate offset handled
                    if (tile === '[') {
                        sprites.drawScenery(ctx, 'pipe-top', tileX, tileY, level.TILE_SIZE * 2, level.TILE_SIZE);
                    } else if (tile === 'I') {
                        sprites.drawScenery(ctx, 'pipe', tileX + 2, tileY, level.TILE_SIZE * 2 - 4, level.TILE_SIZE);
                    } else if (tile === ']') {
                        // Skip since drawn by '['
                    } else if (tile === 'J') {
                        // Skip since drawn by 'I'
                    } else {
                        sprites.drawTile(ctx, drawType, tileX, tileY, level.TILE_SIZE, level.TILE_SIZE, globalTick);
                    }
                }
                
                // Draw background flag/pole/castle tiles that overlap scenery
                if (tile === 'F' || tile === 'f') {
                    const tileX = c * level.TILE_SIZE - camera.x;
                    const tileY = r * level.TILE_SIZE;
                    sprites.drawScenery(ctx, 'flagpole', tileX, tileY, level.TILE_SIZE, level.TILE_SIZE);
                    
                    // Draw sliding flag if this is the flagpole top or midpoint
                    if (tile === 'f') {
                        // Estimate flag sliding position
                        let flagY = tileY + 12;
                        if (gameState === 'LEVELCLEAR') {
                            const slidePct = Math.min(1.0, mario.victoryTimer / 60);
                            flagY = tileY + 12 + (slidePct * 112); // slides down
                        }
                        sprites.drawScenery(ctx, 'flag', tileX - 12, flagY, 14, 10);
                    }
                }
            }
        }

        // 4. Draw Items
        itemsList.forEach(item => {
            const itemX = item.x - camera.x;
            sprites.drawItem(ctx, item.type, itemX, item.y, item.width, item.height, globalTick);
        });

        // 5. Draw Enemies
        enemiesList.forEach(enemy => {
            const enemyX = enemy.x - camera.x;
            sprites.drawEnemy(ctx, enemy.type, enemy.state, enemyX, enemy.y, enemy.width, enemy.height, globalTick);
        });

        // 6. Draw Particles (bricks, coin bounce, block bump, floating score text)
        particlesList.forEach(part => {
            const partX = part.x - camera.x;
            if (part.type === 'brick-debris') {
                ctx.fillStyle = '#b87800'; // brick brown
                ctx.fillRect(partX, part.y, 4, 4);
            } else if (part.type === 'coin-bounce') {
                sprites.drawItem(ctx, 'coin', partX, part.y, 8, 14, globalTick);
            } else if (part.type === 'block-bump') {
                // Redraw bumped block character at particle location
                sprites.drawTile(ctx, 'solid', partX, part.y, level.TILE_SIZE, level.TILE_SIZE);
            } else if (part.type === 'text') {
                ctx.font = '7px "Press Start 2P"';
                ctx.fillStyle = '#ffffff';
                ctx.fillText(part.text, partX, part.y);
            }
        });

        // 7. Draw Mario
        if (mario.visible) {
            const marioX = mario.x - camera.x;
            let drawState = mario.state;
            if (mario.state === 'walk-to-castle') drawState = 'walk';
            sprites.drawMario(ctx, mario.isBig, drawState, marioX, mario.y, mario.width, mario.height, mario.facingLeft, globalTick, mario.isDucking);
        }
    }

    // --- GAME LOOP ---
    function loop() {
        if (gameState !== 'PAUSED') {
            update();
            draw();
        }
        requestAnimationFrame(loop);
    }

    // Start loop immediately
    requestAnimationFrame(loop);
});
