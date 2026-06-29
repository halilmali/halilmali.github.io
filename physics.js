// Physics Constants and Collision Detection
const physics = (() => {
    // Constants
    const GRAVITY = 0.28;
    const FRICTION = 0.85;
    const TERMINAL_VELOCITY = 6.0;

    // List of tile types that act as solid boundaries
    const SOLID_TILES = new Set(['G', 'B', 'Q', 'M', 'S', '[', ']', 'I', 'J', 'X', 'C']);

    function isTileSolid(tileChar) {
        return SOLID_TILES.has(tileChar);
    }

    // AABB Collision check between two rectangles
    function checkCollision(r1, r2) {
        return (
            r1.x < r2.x + r2.width &&
            r1.x + r1.width > r2.x &&
            r1.y < r2.y + r2.height &&
            r1.y + r1.height > r2.y
        );
    }

    // Resolves tiles collisions for a dynamic entity
    // Steps: 
    // 1. Move horizontally, check collisions, back out if solid.
    // 2. Move vertically, check collisions, back out if solid, handle landing/roof bumps.
    function resolveTileCollisions(entity, levelObj, onBlockHit) {
        const tileSize = levelObj.TILE_SIZE;
        entity.onGround = false;

        // --- 1. HORIZONTAL AXIS ---
        entity.x += entity.vx;
        
        // Calculate surrounding tile range
        let colStart = Math.floor(entity.x / tileSize);
        let colEnd = Math.floor((entity.x + entity.width - 0.1) / tileSize);
        let rowStart = Math.max(0, Math.floor(entity.y / tileSize));
        let rowEnd = Math.min(levelObj.GRID_HEIGHT - 1, Math.floor((entity.y + entity.height - 0.1) / tileSize));

        for (let r = rowStart; r <= rowEnd; r++) {
            for (let c = colStart; c <= colEnd; c++) {
                const tile = levelObj.getTileAt(c, r);
                if (isTileSolid(tile)) {
                    // Collision occurred! Resolve horizontal position
                    if (entity.vx > 0) {
                        // Moving right, push left
                        entity.x = c * tileSize - entity.width;
                        if (onBlockHit) onBlockHit(c, r, 'left');
                    } else if (entity.vx < 0) {
                        // Moving left, push right
                        entity.x = (c + 1) * tileSize;
                        if (onBlockHit) onBlockHit(c, r, 'right');
                    }
                    entity.vx = 0;
                    // Recalculate columns for horizontal bounds in case multiple collisions occur
                    colStart = Math.floor(entity.x / tileSize);
                    colEnd = Math.floor((entity.x + entity.width - 0.1) / tileSize);
                }
            }
        }

        // --- 2. VERTICAL AXIS ---
        entity.y += entity.vy;

        colStart = Math.floor(entity.x / tileSize);
        colEnd = Math.floor((entity.x + entity.width - 0.1) / tileSize);
        rowStart = Math.max(0, Math.floor(entity.y / tileSize));
        rowEnd = Math.min(levelObj.GRID_HEIGHT - 1, Math.floor((entity.y + entity.height - 0.1) / tileSize));

        for (let r = rowStart; r <= rowEnd; r++) {
            for (let c = colStart; c <= colEnd; c++) {
                const tile = levelObj.getTileAt(c, r);
                if (isTileSolid(tile)) {
                    if (entity.vy > 0) {
                        // Falling down, landing on top of block
                        entity.y = r * tileSize - entity.height;
                        entity.onGround = true;
                        entity.vy = 0;
                    } else if (entity.vy < 0) {
                        // Jumping up, hitting bottom of block
                        entity.y = (r + 1) * tileSize;
                        entity.vy = 0;
                        if (onBlockHit) onBlockHit(c, r, 'bottom');
                    }
                    // Recalculate rows for vertical bounds
                    rowStart = Math.max(0, Math.floor(entity.y / tileSize));
                    rowEnd = Math.min(levelObj.GRID_HEIGHT - 1, Math.floor((entity.y + entity.height - 0.1) / tileSize));
                }
            }
        }

        // Keep entity within level bounds
        if (entity.x < 0) {
            entity.x = 0;
            entity.vx = 0;
        }
        if (entity.x + entity.width > levelObj.LEVEL_WIDTH) {
            entity.x = levelObj.LEVEL_WIDTH - entity.width;
            entity.vx = 0;
        }
    }

    return {
        GRAVITY,
        FRICTION,
        TERMINAL_VELOCITY,
        isTileSolid,
        checkCollision,
        resolveTileCollisions
    };
})();
