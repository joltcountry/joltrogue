Maps = {};

Maps.generateDungeon = function(lev) {

    var freecells = [];
    var w = MIN_WIDTH + Math.floor(ROT.RNG.getUniform() * (MAP_WIDTH - MIN_WIDTH));
    var h = MIN_HEIGHT + Math.floor(ROT.RNG.getUniform() * (MAP_HEIGHT - MIN_HEIGHT));
    var gen = new ROT.Map.Uniform(w, h, { roomDugPercentage:.2, roomWidth:[3,20], roomHeight:[3,20], corridorLength:[3, 20]});

    var level = new Level(w, h);

    var genCallback = function(x, y, value) {
        var key = x + "," + y;
        
        if (value) { 
            level.setLoc(x, y, new Location(x, y, TERRAIN_WALL, []));
        } else {
            level.setLoc(x, y, new Location(x, y, TERRAIN_FLOOR, []));
            freecells.push(key);
        }

    }

    gen.create(genCallback.bind(this));

    var addDoor = function(x, y) {
        if (Math.floor(ROT.RNG.getUniform() * 10) > 7 &&
            ((level.getLoc(x-1, y).getTerrain() == TERRAIN_WALL &&
                 level.getLoc(x+1, y).getTerrain() == TERRAIN_WALL) ||
                (level.getLoc(x, y-1).getTerrain() == TERRAIN_WALL &&
                 level.getLoc(x, y+1).getTerrain() == TERRAIN_WALL))) {
            level.setLoc(x, y, new Location(x, y, TERRAIN_DOOR, []));
            delete freecells[x + "," + y];
        }
    }

    var rooms = gen.getRooms();

    for (var i=0; i<rooms.length; i++) {
        var room = rooms[i];
        room.getDoors(addDoor);
    }

    if (!Game.player) {
        var index = Math.floor(ROT.RNG.getUniform() * freecells.length);
        var key = freecells.splice(index, 1)[0];
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        Game.player = new Player(x, y);
        Game.top = Game.player._y - Math.floor(DISPLAY_HEIGHT / 2);
        Game.left = Game.player._x - Math.floor(DISPLAY_WIDTH / 2);        
    }

    if (lev < NUM_LEVELS - 1) {

        var index = Math.floor(ROT.RNG.getUniform() * freecells.length);
        var key = freecells[index];
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        freecells.splice(index, 1)[0];
        level.setLoc(x, y, new Location(x, y, TERRAIN_DOWNSTAIRS, []));
        level.getSpecial()["downstairs"] = [x,y];

    }

    if (lev > 0) {
        var index = Math.floor(ROT.RNG.getUniform() * freecells.length);
        var key = freecells[index];
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);

        freecells.splice(index, 1)[0];
        level.setLoc(x, y, new Location(x, y, TERRAIN_UPSTAIRS, []));
        level.getSpecial()["upstairs"] = [x,y];
    }

    return level;

}

Maps.generateCave = function(lev) {

    var freecells = [];
    var w = MIN_WIDTH + Math.floor(ROT.RNG.getUniform() * (MAP_WIDTH - MIN_WIDTH));
    var h = MIN_HEIGHT + Math.floor(ROT.RNG.getUniform() * (MAP_HEIGHT - MIN_HEIGHT));

    var level = new Level(w, h);
    var numGen = 5;
    var gen = new ROT.Map.Cellular(w-2, h-2, { connected: true });

    gen.randomize(0.5);
    for (var i = 0; i < numGen; ++i) {
        gen.create(null);
    }
    gen.create(null)   
    gen.connect((function(x, y, wall) {
        x += 1; y += 1;
        if (!wall) {
            level.setLoc(x, y, new Location(x, y, TERRAIN_ICEWALL, []));
        } else {
            level.setLoc(x, y, new Location(x, y, TERRAIN_ICEFLOOR, []));
            var key = x + "," + y;            
            freecells.push(key);
        }
    }).bind(this), 1, null);

    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            var key = x + "," + y;
            if (x == 0 || x == w - 1 || y == 0 || y == h -1) {
                level.setLoc(x, y, new Location(x, y, TERRAIN_ICEWALL, []));
                freecells.splice(key,1)[0];
            }
        }
    }

    // Create player
    if (!Game.player) {
        var index = Math.floor(ROT.RNG.getUniform() * freecells.length);
        var key = freecells.splice(index, 1)[0];
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        Game.player = new Player(x, y);
        Game.top = Game.player._y - Math.floor(DISPLAY_HEIGHT / 2);
        Game.left = Game.player._x - Math.floor(DISPLAY_WIDTH / 2);
    }

    // Create downstairs
    if (lev < NUM_LEVELS - 1) {

        var index = Math.floor(ROT.RNG.getUniform() * freecells.length);
        var key = freecells[index];
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        freecells.splice(index, 1)[0];
        level.setLoc(x, y, new Location(x, y, TERRAIN_ICEDOWNSTAIRS, []));
        level.getSpecial()["downstairs"] = [x,y];

    }

    // Create upstairs
    if (lev > 0) {
        var index = Math.floor(ROT.RNG.getUniform() * freecells.length);
        var key = freecells[index];
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);

        freecells.splice(index, 1)[0];
        level.setLoc(x, y, new Location(x, y, TERRAIN_ICEUPSTAIRS, []));
        level.getSpecial()["upstairs"] = [x,y];
    }

    return level;

}
