// Procedural Pixel Art Sprites and Renderer
const sprites = (() => {
    // Shared color palette
    const colorMap = {
        'R': '#d82800', // Mario Red
        'B': '#0020c8', // Mario Blue
        'S': '#f8b878', // Skin tone
        'O': '#b87800', // Brown (Hair, Goomba, Brick base)
        'K': '#000000', // Black
        'W': '#ffffff', // White
        'G': '#00a800', // Green
        'g': '#3cbcfc', // Sky light blue
        'Y': '#fcbc00', // Yellow / Gold
        'y': '#f8f8f8', // Off white / yellow
        'D': '#ac7c00', // Darker gold/brown
        'o': '#f87858', // Goomba flesh
        'w': '#f8f8f8', // Cloud white
        'b': '#a4e4fc', // Cloud shading blue
        'd': '#503000', // Dark brown / shadow
        'p': '#c84c0c', // Pipe dark shadow green or reddish ground
        'q': '#fc9c5c', // Brick light highlight
    };

    // --- SPRITE MATRICES ---

    // Small Mario Idle (12x16)
    const MARIO_SMALL_IDLE = [
        "....RRRRR...",
        "...RRRRRRRRR",
        "...OOOSSOK..",
        "..OSOSSSOSKK",
        "..OSOSSOSSOS",
        "..OOSSSSSOO.",
        "....SSSSSS..",
        "...RRBRRBRR.",
        "..RRRBRRBRRB",
        ".RRRRBBBBRRR",
        ".SSRRBBRBSSR",
        ".SSSRBBBRSSS",
        "..SSBBBBBBSS",
        "...BBBBBBBB.",
        "..OOO..OOO..",
        ".OOOO..OOOO."
    ];

    // Small Mario Walk 1
    const MARIO_SMALL_WALK1 = [
        "....RRRRR...",
        "...RRRRRRRRR",
        "...OOOSSOK..",
        "..OSOSSSOSKK",
        "..OSOSSOSSOS",
        "..OOSSSSSOO.",
        "....SSSSSS..",
        "...RBBBBR...",
        "..RRBBBBBR..",
        ".RRRBBBBBRR.",
        ".SSSRRRRRSSS",
        ".SSSRRRRRSSS",
        "..SSRRRRRRSS",
        "...OOOOOO...",
        "...OO..OO...",
        "..OOO..OOO.."
    ];

    // Small Mario Walk 2
    const MARIO_SMALL_WALK2 = [
        "....RRRRR...",
        "...RRRRRRRRR",
        "...OOOSSOK..",
        "..OSOSSSOSKK",
        "..OSOSSOSSOS",
        "..OOSSSSSOO.",
        "....SSSSSS..",
        "...RBBBRR...",
        "..RRBBBBRR..",
        ".RRRBBBBBBR.",
        ".SSSRRBRRSS.",
        ".SSSRRBRRSS.",
        "..SSRRBRRSS.",
        "...OOO.OO...",
        "....OO.OO...",
        ".....O..O..."
    ];

    // Small Mario Walk 3
    const MARIO_SMALL_WALK3 = [
        "....RRRRR...",
        "...RRRRRRRRR",
        "...OOOSSOK..",
        "..OSOSSSOSKK",
        "..OSOSSOSSOS",
        "..OOSSSSSOO.",
        "....SSSSSS..",
        "...RRBBBR...",
        "..RRRBBBBR..",
        ".RRRRBBBBBR.",
        ".SSSRRBRRSS.",
        ".SSSRRBRRSS.",
        "..SSRRBRRSS.",
        "...OOO.OO...",
        "...OOO.OO...",
        "..OOO...OO.."
    ];

    // Small Mario Jump
    const MARIO_SMALL_JUMP = [
        "....RRRRR...",
        "...RRRRRRRRR",
        "...OOOSSOK..",
        "..OSOSSSOSKK",
        "..OSOSSOSSOS",
        "..OOSSSSSOO.",
        "....SSSSSS..",
        "..RBBBBBBR..",
        ".RRBBBBBBRR.",
        "RRRBBBBBBRRR",
        "SSSRRBRRSSSS",
        "SSSRRBRRSSSS",
        ".SSRRBRRSS..",
        "..OOO..OO...",
        ".OOO....O...",
        "OOOO........"
    ];

    // Small Mario Die
    const MARIO_SMALL_DIE = [
        "....KKKK....",
        "...KKSSKK...",
        "..KKSSSSKK..",
        ".KKKSSKSSKKK",
        ".KKSSSSSSKKK",
        "..KKSSSSKK..",
        "...KKKKKK...",
        "....RRRR....",
        "..KKRRRRKK..",
        ".KKKRRRRKKK.",
        ".KKKBBBBRKK.",
        "..KKBBBBRK..",
        "...KBBBBK...",
        "....KBBK....",
        "....O..O....",
        "...OO..OO..."
    ];

    // Big Mario Idle (16x32)
    const MARIO_BIG_IDLE = [
        ".....RRRRRR.....",
        "....RRRRRRRRRR..",
        "....OOOSSSOK....",
        "...OOSOSSSOSKK..",
        "...OOSOSSOSSOS..",
        "...OOSOSSOSSOS..",
        "....OOSSSSSOO...",
        "......SSSSS.....",
        "....RRBRRBRR....",
        "...RRRBRRBRRBR..",
        "..RRRRBRRBRRBRR.",
        "..SSRRBBBBBRRSS.",
        "..SSSRRBBBRRSSS.",
        "..SSSRRBBBRRSSS.",
        "...SSRRBBBRRSS..",
        "....RBBBBBBBR...",
        "....RBBBBBBBR...",
        "....RBBBBBBBR...",
        "....RBBBBBBBR...",
        "....RBBBBBBBR...",
        "....RBBBBBBBR...",
        "....RBBBBBBBR...",
        "....RBBBBBBBR...",
        "....RBBBBBBBR...",
        "....BBBBBBBBB...",
        "....BBBBBBBBB...",
        "....BBBB.BBBB...",
        "...OOO.....OOO..",
        "..OOOO.....OOOO.",
        ".OOOOO.....OOOOO",
        ".OOOO.......OOOO",
        "..OO.........OO."
    ];

    // Big Mario Walk 1
    const MARIO_BIG_WALK1 = [
        ".....RRRRRR.....",
        "....RRRRRRRRRR..",
        "....OOOSSSOK....",
        "...OOSOSSSOSKK..",
        "...OOSOSSOSSOS..",
        "...OOSOSSOSSOS..",
        "....OOSSSSSOO...",
        "......SSSSS.....",
        "....RRBRRBRR....",
        "...RRRBRRBRRBR..",
        "..RRRRBRRBRRBRR.",
        "..SSRRBBBBBRRSS.",
        "..SSSRRBBBRRSSS.",
        "..SSSRRBBBRRSSS.",
        "...SSRRBBBRRSS..",
        "....RBBBBBBBR...",
        "....RBBBBBBBR...",
        "....RBBBBBBBR...",
        "....RBBBBBBBR...",
        "....RBBBBBBBR...",
        "....RBBBBBBBR...",
        "....RBBBBBBBR...",
        "....RBBBBBBBR...",
        "....RBBBBBBBR...",
        "....BBBBBBBBB...",
        "....BBBBBBBBB...",
        "....BBBB.BBBB...",
        "...OOO.....OOO..",
        "..OOOO.....OOOO.",
        ".OOOOO.....OOOOO",
        ".OOOO.......OOOO",
        "..OO.........OO."
    ]; // Note: For simplified rendering we can wobble/tilt the big sprite or define alternate legs. Let's define dynamic walking adjustments.

    // Big Mario Jump
    const MARIO_BIG_JUMP = [
        ".....RRRRRR.....",
        "....RRRRRRRRRR..",
        "....OOOSSSOK....",
        "...OOSOSSSOSKK..",
        "...OOSOSSOSSOS..",
        "...OOSOSSOSSOS..",
        "....OOSSSSSOO...",
        "......SSSSS.....",
        "....RRBRRBRR....",
        "...RRRBRRBRRBR..",
        "..RRRRBRRBRRBRR.",
        "..SSRRBBBBBRRSS.",
        "..SSSRRBBBRRSSS.",
        "..SSSRRBBBRRSSS.",
        "...SSRRBBBRRSS..",
        "....RBBBBBBBR...",
        "....RBBBBBBBR...",
        "....RBBBBBBBR...",
        "....RBBBBBBBR...",
        "....RBBBBBBBR...",
        "....RBBBBBBBR...",
        "....RBBBBBBBR...",
        "....RBBBBBBBR...",
        "....RBBBBBBBR...",
        "....BBBBBBBBB...",
        "....BBBBBBBBB...",
        "....BBBB.BBBB...",
        "...OOO.....OOO..",
        "..OOOO.....OOOO.",
        ".OOOOO.....OOOOO",
        ".OOOO.......OOOO",
        "..OO.........OO."
    ];

    // Big Mario Duck (16x22 approx)
    const MARIO_BIG_DUCK = [
        ".....RRRRRR.....",
        "....RRRRRRRRRR..",
        "....OOOSSSOK....",
        "...OOSOSSSOSKK..",
        "...OOSOSSOSSOS..",
        "...OOSOSSOSSOS..",
        "....OOSSSSSOO...",
        "......SSSSS.....",
        "....RRBRRBRR....",
        "...RRRBRRBRRBR..",
        "..RRRRBRRBRRBRR.",
        "..SSRRBBBBBRRSS.",
        "..SSSRRBBBRRSSS.",
        "..SSSRRBBBRRSSS.",
        "...SSRRBBBRRSS..",
        "....RBBBBBBBR...",
        "....BBBBBBBBB...",
        "....BBBBBBBBB...",
        "....BBBB.BBBB...",
        "...OOO.....OOO..",
        "..OOOO.....OOOO.",
        ".OOOO.......OOOO"
    ];

    // Goomba Walk 1 (16x16)
    const GOOMBA_WALK1 = [
        "......OOOO......",
        "....OOOOOOOO....",
        "...OOOOOOOOOO...",
        "..OOOOOOOOOOOO..",
        ".OOOOOOOOOOOOOO.",
        "OOOKKOOOOOOKKOOO",
        "OOOKKOOOOOOKKOOO",
        "OOOwwOOOOOOwwOOO",
        "OOOwwOOOOOOwwOOO",
        "OOOOOOOOOOOOOOOO",
        ".OOOooooooooOOO.",
        "..OOooooooooOO..",
        "...OooooooooO...",
        "....KKKK.KKKK...",
        "...KKKKK.KKKKK..",
        "...KKKK...KKKK.."
    ];

    // Goomba Walk 2 (16x16)
    const GOOMBA_WALK2 = [
        "......OOOO......",
        "....OOOOOOOO....",
        "...OOOOOOOOOO...",
        "..OOOOOOOOOOOO..",
        ".OOOOOOOOOOOOOO.",
        "OOOKKOOOOOOKKOOO",
        "OOOKKOOOOOOKKOOO",
        "OOOwwOOOOOOwwOOO",
        "OOOwwOOOOOOwwOOO",
        "OOOOOOOOOOOOOOOO",
        ".OOOooooooooOOO.",
        "..OOooooooooOO..",
        "...OooooooooO...",
        "....KKKK.KKKK...",
        "....KKKKK.KKKKK.",
        ".....KKKK..KKKK."
    ];

    // Goomba Squished (16x8)
    const GOOMBA_SQUISHED = [
        "................",
        "......OOOO......",
        "....OOOOOOOO....",
        "..OOOOOOOOOOOO..",
        "OOOOOOOOOOOOOOOO",
        "OOOKKOOOOOOKKOOO",
        "OOOwwOOOOOOwwOOO",
        "KKKKKKKKKKKKKKKK"
    ];

    // Brick Block Tile (16x16)
    const TILE_BRICK = [
        "qqqqqqqqqqqqqqqo",
        "qOOOOOOOOOOOOOqo",
        "qOOOOOOOOOOOOOqo",
        "qqqqqqdqqqqqqdqq",
        "OOOOOqoOOOOOOqod",
        "OOOOOqoOOOOOOqod",
        "dddddddddddddddd",
        "qqqqqqqqqqqqqqqo",
        "qOOOOOOOOOOOOOqo",
        "qOOOOOOOOOOOOOqo",
        "qqqqqqdqqqqqqqdQ",
        "OOOOOqoOOOOOOqod",
        "OOOOOqoOOOOOOqod",
        "OOOOOqoOOOOOOqod",
        "dddddddddddddddd",
        "dddddddddddddddd"
    ];

    // Question Block Active (16x16)
    const TILE_QUESTION = [
        "YYYYYYYYYYYYYYYD",
        "YyyyyyyyYyyyyyYD",
        "YyyYYYYYYYYYyyYD",
        "YyYYYDKKKKDYYyYD",
        "YyYYDKKKKKKDYyYD",
        "YyYDKKDYYDKKDYyD",
        "YyYDKKDYYDKKDYyD",
        "YyYYYDKYDKKDYYyD",
        "YyYYYYYDKKDYYYyD",
        "YyYYYYYDKKDYYYyD",
        "YyYYYYYYYYYYYyYD",
        "YyYYYYYDKKDYYyYD",
        "YyYYYYYDKKDYYyYD",
        "YyyYYYYYYYYYyyYD",
        "YyyyyyyyyyyyyyYD",
        "DDDDDDDDDDDDDDDD"
    ];

    // Solid Block / Used Question Block (16x16)
    const TILE_SOLID = [
        "dddddddddddddddd",
        "dOOOOOOOOOOOOOOd",
        "dOOOOOOOOOOOOOOd",
        "dOOOOOOOOOOOOOOd",
        "dOOOOOOOOOOOOOOd",
        "dOOOOOOOOOOOOOOd",
        "dOOOOOOOOOOOOOOd",
        "dOOOOOOOOOOOOOOd",
        "dOOOOOOOOOOOOOOd",
        "dOOOOOOOOOOOOOOd",
        "dOOOOOOOOOOOOOOd",
        "dOOOOOOOOOOOOOOd",
        "dOOOOOOOOOOOOOOd",
        "dOOOOOOOOOOOOOOd",
        "dOOOOOOOOOOOOOOd",
        "dddddddddddddddd"
    ];

    // Super Mushroom (16x16)
    const ITEM_MUSHROOM = [
        "......RRRR......",
        "....RRRWRWRR....",
        "...RRWWRWRWWRR..",
        "..RRWWRRWRRWWRR.",
        ".RRWWRRRRRRRWWRR",
        "RRRRRRRRRRRRRRRR",
        "RRRRRRRRRRRRRRRR",
        "RRRRRRRRRRRRRRRR",
        "....SSKKSSKKSS..",
        "....SSKKSSKKSS..",
        "....SSSSSSSSSS..",
        "....SSSSSSSSSS..",
        "....SSSSSSSSSS..",
        "....SSSSSSSSSS..",
        "....SSSSSSSSSS..",
        "......SSSSSS...."
    ];

    // Coin Frame 1 (8x14 approx scaled)
    const ITEM_COIN = [
        "..YYYY..",
        ".YYYYYY.",
        "YYYYYYYY",
        "YYYKKYYY",
        "YYYKKYYY",
        "YYYKKYYY",
        "YYYKKYYY",
        "YYYKKYYY",
        "YYYKKYYY",
        "YYYKKYYY",
        "YYYKKYYY",
        "YYYYYYYY",
        ".YYYYYY.",
        "..YYYY.."
    ];

    // Helper to draw a matrix to screen
    function drawMatrix(ctx, matrix, x, y, w, h, flipX = false) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const pixelW = w / cols;
        const pixelH = h / rows;

        for (let r = 0; r < rows; r++) {
            const rowStr = matrix[r];
            for (let c = 0; c < cols; c++) {
                const char = rowStr[c];
                if (char === '.' || char === ' ') continue;
                const color = colorMap[char];
                if (color) {
                    ctx.fillStyle = color;
                    const renderCol = flipX ? (cols - 1 - c) : c;
                    ctx.fillRect(
                        Math.floor(x + renderCol * pixelW),
                        Math.floor(y + r * pixelH),
                        Math.ceil(pixelW),
                        Math.ceil(pixelH)
                    );
                }
            }
        }
    }

    return {
        drawMario: (ctx, isBig, state, x, y, w, h, flipX, tick, isDucking) => {
            if (isBig) {
                if (isDucking) {
                    drawMatrix(ctx, MARIO_BIG_DUCK, x, y, w, h, flipX);
                } else if (state === 'jump') {
                    drawMatrix(ctx, MARIO_BIG_JUMP, x, y, w, h, flipX);
                } else if (state === 'walk') {
                    // Alternating walking frames
                    const frame = Math.floor(tick / 6) % 3;
                    // For big walking we reuse the base for now or offset slightly
                    drawMatrix(ctx, MARIO_BIG_IDLE, x, y, w, h, flipX);
                } else {
                    drawMatrix(ctx, MARIO_BIG_IDLE, x, y, w, h, flipX);
                }
            } else {
                if (state === 'dead') {
                    drawMatrix(ctx, MARIO_SMALL_DIE, x, y, w, h, flipX);
                } else if (state === 'jump') {
                    drawMatrix(ctx, MARIO_SMALL_JUMP, x, y, w, h, flipX);
                } else if (state === 'walk') {
                    const frame = Math.floor(tick / 5) % 3;
                    const walkFrames = [MARIO_SMALL_WALK1, MARIO_SMALL_WALK2, MARIO_SMALL_WALK3];
                    drawMatrix(ctx, walkFrames[frame], x, y, w, h, flipX);
                } else {
                    drawMatrix(ctx, MARIO_SMALL_IDLE, x, y, w, h, flipX);
                }
            }
        },

        drawEnemy: (ctx, type, state, x, y, w, h, tick) => {
            if (type === 'goomba') {
                if (state === 'flat') {
                    drawMatrix(ctx, GOOMBA_SQUISHED, x, y + h/2, w, h/2);
                } else {
                    const frame = Math.floor(tick / 10) % 2;
                    const walkFrames = [GOOMBA_WALK1, GOOMBA_WALK2];
                    drawMatrix(ctx, walkFrames[frame], x, y, w, h);
                }
            }
        },

        drawTile: (ctx, type, x, y, w, h, tick = 0) => {
            if (type === 'brick') {
                drawMatrix(ctx, TILE_BRICK, x, y, w, h);
            } else if (type === 'question') {
                drawMatrix(ctx, TILE_QUESTION, x, y, w, h);
            } else if (type === 'solid') {
                drawMatrix(ctx, TILE_SOLID, x, y, w, h);
            } else if (type === 'ground') {
                // Ground looks like brownish-red brick tile
                drawMatrix(ctx, TILE_BRICK, x, y, w, h);
            }
        },

        drawItem: (ctx, type, x, y, w, h, tick = 0) => {
            if (type === 'mushroom') {
                drawMatrix(ctx, ITEM_MUSHROOM, x, y, w, h);
            } else if (type === 'coin') {
                // Coin spins
                const aspect = Math.abs(Math.sin(tick * 0.15));
                const newW = w * aspect;
                const offset = (w - newW) / 2;
                drawMatrix(ctx, ITEM_COIN, x + offset, y, newW, h);
            }
        },

        drawScenery: (ctx, type, x, y, w, h) => {
            ctx.save();
            if (type === 'cloud') {
                // Drawing vector clouds for crispiness
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(x + w * 0.25, y + h * 0.6, h * 0.35, 0, Math.PI * 2);
                ctx.arc(x + w * 0.5, y + h * 0.45, h * 0.45, 0, Math.PI * 2);
                ctx.arc(x + w * 0.75, y + h * 0.6, h * 0.35, 0, Math.PI * 2);
                ctx.fillRect(x + w * 0.2, y + h * 0.5, w * 0.6, h * 0.45);
                ctx.fill();

                // Add slight cloud shadow line
                ctx.strokeStyle = '#a4e4fc';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x + w * 0.1, y + h * 0.95);
                ctx.lineTo(x + w * 0.9, y + h * 0.95);
                ctx.stroke();
            } else if (type === 'bush') {
                // Bush drawing
                ctx.fillStyle = '#00a800';
                ctx.beginPath();
                ctx.arc(x + w * 0.2, y + h * 0.7, h * 0.3, 0, Math.PI * 2);
                ctx.arc(x + w * 0.5, y + h * 0.5, h * 0.45, 0, Math.PI * 2);
                ctx.arc(x + w * 0.8, y + h * 0.7, h * 0.3, 0, Math.PI * 2);
                ctx.fillRect(x + w * 0.1, y + h * 0.6, w * 0.8, h * 0.4);
                ctx.fill();

                // Detail highlight
                ctx.fillStyle = '#3cbcfc'; // matches scenery highlights
                ctx.fillStyle = '#32c032';
                ctx.beginPath();
                ctx.arc(x + w * 0.45, y + h * 0.48, h * 0.2, 0, Math.PI * 2);
                ctx.fill();
            } else if (type === 'mountain') {
                // Retro polygonal mountain
                ctx.fillStyle = '#20c84c'; // Green hill
                ctx.beginPath();
                ctx.moveTo(x, y + h);
                ctx.lineTo(x + w / 2, y);
                ctx.lineTo(x + w, y + h);
                ctx.closePath();
                ctx.fill();

                // Highlight/shadow split
                ctx.fillStyle = '#00a800'; // Darker side
                ctx.beginPath();
                ctx.moveTo(x + w / 2, y);
                ctx.lineTo(x + w, y + h);
                ctx.lineTo(x + w / 2, y + h);
                ctx.closePath();
                ctx.fill();

                // Eyes on hill (classic Mario detail)
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x + w/2 - 6, y + h/2, 2, 8);
                ctx.fillRect(x + w/2 + 4, y + h/2, 2, 8);
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + w/2 - 6, y + h/2 + 3, 2, 3);
                ctx.fillRect(x + w/2 + 4, y + h/2 + 3, 2, 3);
            } else if (type === 'pipe') {
                // Classic Green Pipe
                // Pipe border
                ctx.fillStyle = '#000000';
                ctx.fillRect(x, y, w, h);
                // Body
                ctx.fillStyle = '#00a800';
                ctx.fillRect(x + 2, y + 2, w - 4, h - 2);
                // Lip
                ctx.fillStyle = '#00e600'; // brighter highlight
                ctx.fillRect(x + 2, y + 2, 4, h - 2);
                ctx.fillRect(x + 6, y + 2, w - 12, 4);
                // Draw dynamic lines down
                ctx.fillStyle = '#005000'; // dark shadow
                ctx.fillRect(x + w - 8, y + 2, 4, h - 2);
            } else if (type === 'pipe-top') {
                // Top lip of a pipe
                ctx.fillStyle = '#000000';
                ctx.fillRect(x - 2, y, w + 4, h);
                ctx.fillStyle = '#00a800';
                ctx.fillRect(x, y + 2, w, h - 4);
                ctx.fillStyle = '#00e600';
                ctx.fillRect(x, y + 2, 4, h - 4);
                ctx.fillRect(x + 4, y + 2, w - 8, 4);
                ctx.fillStyle = '#005000';
                ctx.fillRect(x + w - 6, y + 2, 4, h - 4);
            } else if (type === 'castle') {
                // Renders a beautiful retro-themed castle
                // Base structure
                ctx.fillStyle = '#9c4a00'; // Brick-red/brown
                ctx.fillRect(x, y + h/3, w, h * 2/3);
                // Battlements
                ctx.fillRect(x, y + h/6, w/6, h/6);
                ctx.fillRect(x + w * 2/6, y + h/6, w/6, h/6);
                ctx.fillRect(x + w * 4/6, y + h/6, w/6, h/6);
                ctx.fillRect(x + w * 5/6, y + h/6, w/6, h/6);
                // Center tower
                ctx.fillRect(x + w/4, y, w/2, h/3);
                // Tower battlements
                ctx.fillRect(x + w/4, y - h/12, w/8, h/12);
                ctx.fillRect(x + w/2 + w/8, y - h/12, w/8, h/12);
                
                // Doorway
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + w/2 - 8, y + h - 16, 16, 16);
                // Windows
                ctx.fillRect(x + w/4 + 4, y + h/3 + 4, 6, 8);
                ctx.fillRect(x + w*3/4 - 10, y + h/3 + 4, 6, 8);
                ctx.fillRect(x + w/2 - 3, y + h/12, 6, 8);
            } else if (type === 'flagpole') {
                // Flagpole line
                ctx.fillStyle = '#bbbbbb';
                ctx.fillRect(x + w/2 - 2, y, 4, h);
                // Green ball on top
                ctx.fillStyle = '#00a800';
                ctx.beginPath();
                ctx.arc(x + w/2, y, 6, 0, Math.PI * 2);
                ctx.fill();
            } else if (type === 'flag') {
                // Green flag with skull or shape
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x, y, w, h);
                ctx.strokeStyle = '#000000';
                ctx.strokeRect(x, y, w, h);
                
                // Draw simple retro green insignia inside
                ctx.fillStyle = '#00a800';
                ctx.fillRect(x + 4, y + 4, w - 8, h - 8);
            }
            ctx.restore();
        }
    };
})();
