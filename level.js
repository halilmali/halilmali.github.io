// Level Definitions and Map Layouts
const level = (() => {
    const TILE_SIZE = 16;
    const GRID_HEIGHT = 15; // 15 rows * 16px = 240px

    // Character Map Codes:
    // '.' = Empty Space
    // 'G' = Ground Brick
    // 'B' = Breakable Brick Block
    // 'Q' = Question Block (Coin)
    // 'M' = Question Block (Mushroom)
    // 'S' = Solid Metal Block
    // '[' = Pipe Top Left
    // ']' = Pipe Top Right
    // 'I' = Pipe Body Left
    // 'J' = Pipe Body Right
    // 'f' = Flagpole Top
    // 'F' = Flagpole Shaft
    // 'C' = Castle Block
    // 'c' = Castle Door
    // 'X' = Empty Block (used block state)

    const mapData = [
        "........................................................................................................................................................................................",
        "........................................................................................................................................................................................",
        "........................................................................................................................................................................................",
        "........................................................................................................................................................................................",
        "........................................................................................................................................................................................",
        "........................................................................................................................................................................................",
        "........................................................................................................................................................................................",
        "..................Q..B.M.B.Q....................................B.Q.B..................................B..B..................................................................................",
        ".....................................................................................................B..B..B................................................................................",
        "....................................................B.B.B...........................................B..B..B..B..................................f..........................................",
        "..................................[]..............[]......[]......[]..[]...........................B..B..B..B..B................................F..................................C.C.C.C.",
        "....................[]............IJ..............IJ......IJ......IJ..IJ..........................B..B..B..B..B..B..............................F.................................C.C.C.C.C",
        "....................IJ............IJ..............IJ......IJ......IJ..IJ.........................B..B..B..B..B..B..B............................F.................................C.C.c.C.C",
        "GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
        "GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG"
    ];

    const MAP_COLS = mapData[0].length;
    const LEVEL_WIDTH = MAP_COLS * TILE_SIZE;

    // Background scenery lists (Clouds, Hills, Bushes) to be drawn in parallax/static positions
    const scenery = [
        // Mountains / Hills (x, y, w, h)
        { type: 'mountain', x: 40, y: 160, w: 80, h: 48 },
        { type: 'mountain', x: 320, y: 160, w: 80, h: 48 },
        { type: 'mountain', x: 600, y: 160, w: 80, h: 48 },
        { type: 'mountain', x: 920, y: 160, w: 80, h: 48 },
        { type: 'mountain', x: 1240, y: 160, w: 80, h: 48 },
        { type: 'mountain', x: 1540, y: 160, w: 80, h: 48 },
        { type: 'mountain', x: 1840, y: 160, w: 80, h: 48 },

        // Clouds (x, y, w, h)
        { type: 'cloud', x: 100, y: 40, w: 64, h: 24 },
        { type: 'cloud', x: 240, y: 30, w: 96, h: 32 },
        { type: 'cloud', x: 460, y: 50, w: 64, h: 24 },
        { type: 'cloud', x: 700, y: 30, w: 96, h: 32 },
        { type: 'cloud', x: 980, y: 40, w: 64, h: 24 },
        { type: 'cloud', x: 1120, y: 30, w: 96, h: 32 },
        { type: 'cloud', x: 1380, y: 50, w: 64, h: 24 },
        { type: 'cloud', x: 1600, y: 30, w: 96, h: 32 },
        { type: 'cloud', x: 1900, y: 40, w: 64, h: 24 },

        // Bushes (x, y, w, h)
        { type: 'bush', x: 180, y: 180, w: 48, h: 28 },
        { type: 'bush', x: 480, y: 180, w: 64, h: 28 },
        { type: 'bush', x: 780, y: 180, w: 48, h: 28 },
        { type: 'bush', x: 1080, y: 180, w: 64, h: 28 },
        { type: 'bush', x: 1380, y: 180, w: 48, h: 28 },
        { type: 'bush', x: 1680, y: 180, w: 64, h: 28 },

        // Castle end point (x, y, w, h)
        { type: 'castle', x: 2600, y: 112, w: 80, h: 96 } // Placement near the castle tiles
    ];

    // Enemy Spawns: x coordinate, type
    const enemies = [
        { x: 350, y: 192, type: 'goomba' },
        { x: 550, y: 192, type: 'goomba' },
        { x: 720, y: 192, type: 'goomba' },
        { x: 760, y: 192, type: 'goomba' },
        { x: 980, y: 80, type: 'goomba' }, // spawning on blocks
        { x: 1040, y: 80, type: 'goomba' },
        { x: 1200, y: 192, type: 'goomba' },
        { x: 1240, y: 192, type: 'goomba' },
        { x: 1450, y: 192, type: 'goomba' },
        { x: 1650, y: 192, type: 'goomba' },
        { x: 1850, y: 192, type: 'goomba' },
        { x: 1890, y: 192, type: 'goomba' }
    ];

    // Parser helper: gives block types at coordinate
    function getTileAt(col, row) {
        if (col < 0 || row < 0 || row >= GRID_HEIGHT) {
            return null;
        }
        const rowStr = mapData[row];
        if (!rowStr || col >= rowStr.length) {
            return '.';
        }
        return rowStr[col];
    }

    return {
        TILE_SIZE,
        GRID_HEIGHT,
        MAP_COLS,
        LEVEL_WIDTH,
        scenery,
        enemies,
        getTileAt,
        getMapData: () => mapData
    };
})();
