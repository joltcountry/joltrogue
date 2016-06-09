var scheduler = null;

var Game = {
    tiles: true,
    display: null,
    top: null,
    left: null,
    tileSet: null,
    init: function() {
        console.log("Firin' up the game");
        Game.startGame();            
    }
}

Game._createDisplay = function() {
    DISPLAY_WIDTH = 97;
    DISPLAY_HEIGHT = 38;
    options = {
        bg: "#000",
        width: DISPLAY_WIDTH,
        height: DISPLAY_HEIGHT
    };

    if (this.player) {
        this.top = this.player._y - Math.floor(DISPLAY_HEIGHT / 2);
        this.left = this.player._x - Math.floor(DISPLAY_WIDTH / 2);
    }

    Game.display = new ROT.Display(options);
    document.getElementById("game").appendChild(Game.display.getContainer()); 

}

Game.prizes = {};
Game.map = {};
Game.messages = [];
Game.player = null;
Game.paul = null;
Game.prizesLeft = NUM_PRIZES;
Game.seen = {};
Game.engine = null;
Game.freecells = [];

var Message = function(s, c) {
    this._str = s;
    this._color = c;
    Game.messages.push(this);
    Game.refresh();
}

Game.refresh = function() {
    Game.display.clear();
    Game._drawMap();
    //Game._displayMessages();
    //Game._displayStats();

    for (var key in this.prizes) {
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        this._drawRel(x, y, [".", this.prizes[key]], "#0f0")
    }
    
    if (Game.player) {
        Game.player._draw();
    }

}

Game._digger = null;

Game._generateMap = function() {
    //this._digger = new ROT.Map.Uniform(MAP_WIDTH,MAP_HEIGHT, { roomDugPercentage:.2, roomWidth:[3,20], roomHeight:[3,20], corridorLength:[3, 20]});
    //this._digger = new ROT.Map.Arena(MAP_WIDTH,MAP_HEIGHT, { connected: true });

    this.level = new Level(MAP_WIDTH, MAP_HEIGHT);
    var offset = 4;
    var numGen = 5;
    var gen = new ROT.Map.Cellular(MAP_WIDTH, MAP_HEIGHT, { connected: true });
//    var gen = new ROT.Map.Cellular(MAP_WIDTH - offset*2, MAP_HEIGHT - offset*2, { connected: true });
    gen.randomize(0.5);
    for (var i = 0; i < numGen; ++i) {
        gen.create(null);
    }
    gen.create((function(x, y, wall) {
//        x += offset; y += offset;
        if (wall) {
            this.level.setLoc(x, y, new Location(x, y, TERRAIN_WALL, []));
        } else {
            this.level.setLoc(x, y, new Location(x, y, TERRAIN_FLOOR, []));
            var key = x + "," + y;            
            this.freecells.push(key);
        }
    }).bind(this))   

    for (var y = 0; y < MAP_HEIGHT; y++) {
        for (var x = 0; x < MAP_WIDTH; x++) {
            var noise = new ROT.Noise.Simplex();
            if (x == 0 || x == MAP_WIDTH - 1 || y == 0 || y == MAP_HEIGHT -1) {
                this.level.setLoc(x, y, new Location(x, y, TERRAIN_WALL, []));
            } else if ((x <= 1 || y <= 1 || x >= MAP_WIDTH-2 || y >= MAP_HEIGHT-2) && Math.random() < 0.667) {
                this.level.setLoc(x, y, new Location(x, y, TERRAIN_WALL, []));
            } else if ((x <= 2 || y <= 2 || x >= MAP_WIDTH-3 || y >= MAP_HEIGHT-3) && Math.random() < 0.333) {
                this.level.setLoc(x, y, new Location(x, y, TERRAIN_WALL, []));
//            } else {
//                this.level.setLoc(x, y, new Location(x, y, TERRAIN_FLOOR, []));
//                var key = x + "," + y;            
//                this.freecells.push(key);
//            }
            }
        }
    }

 


/* DOORS

    var addDoor = function(x, y) {
        if (Math.floor(ROT.RNG.getUniform() * 10) > 6) {
            Game.level.setLoc(x, y, new Location(x, y, TERRAIN_DOOR, []));
            delete Game.freecells[x + "," + y];
        }
    }

    var rooms = this._digger.getRooms();

    for (var i=0; i<rooms.length; i++) {
        var room = rooms[i];
        room.getDoors(addDoor);
    }
*/
//    this._generatePrizes(this.level, this.freecells);
    this._createPlayer(this.level, this.freecells);
//    this._generatePaul(this.level, this.freecells);    
//    this._generateMonsters(this.level, this.freecells, 100);    
    this._generateStairs(this.level, this.freecells);

    this.top = this.player._y - Math.floor(DISPLAY_HEIGHT / 2);
    this.left = this.player._x - Math.floor(DISPLAY_WIDTH / 2);


}

Game._drawMap = function() {

    var visible = {};
    if (Game.player) {
        var lightPasses = function(x, y) {
            return ((Game.player._x == x && Game.player._y == y) || Game.level.getLoc(x, y) && !Game.level.getLoc(x, y).getTerrain().blocksLOS());
        }
        var fov = new ROT.FOV.PreciseShadowcasting(lightPasses);

        fov.compute(Game.player._x, Game.player._y, 15, function(x, y, r, visibility) {
            visible[x+","+y]=true;
        });   
    }

    for (var y = 0; y < DISPLAY_HEIGHT; y++) {
        for (var x = 0; x < DISPLAY_WIDTH; x++) {
            var i = this.left + x;
            var j = this.top + y;
            var key = i + "," + j;
            if (j >= 0 && j < MAP_HEIGHT && i >=0 && i < MAP_WIDTH) {
                var loc = this.level.getLoc(i,j);
                var items = loc.getItems();
                var monsters = loc.getMonsters();
                var color = loc.getTerrain().getDrawColor();
                var backColor = loc.getTerrain().getDrawBack();

                if (visible[key]) {
                    var dispChar = loc.getTerrain().getDrawChar();
                    this.seen[key] = true;
                    for (var item = 0; item < items.length; item++) {
                        dispChar = (items[item].getDrawChar());
                        color = items[item].getDrawColor();
                    }
                    if (monsters.length > 0) {
                        for (var monster = 0; monster < monsters.length; monster++) {
                            dispChar = monsters[monster].getDrawChar();
                            color = monsters[monster].getDrawColor();
                        }
                    }
                    this.display.draw(x, y, dispChar, color, backColor);
                } else if (this.seen[key]) {
                    var dispChar = loc.getTerrain().getDrawChar();
                    color = loc.getTerrain().getDarkColor();
                    backColor = loc.getTerrain().getDarkBack();                    
                    for (var item = 0; item < items.length; item++) {
                        dispChar = items[item].getDrawChar();
                        color = items[item].getDarkColor();
                    }
                    this.display.draw(x, y, dispChar, color, backColor);
                }
            }
        }
    }

    if (Game.paul) {

    }

}

Game._generatePrizes = function(level, freeCells) {
    for (var i=0;i<NUM_PRIZES;i++) {
        var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
        var key = freeCells.splice(index, 1)[0];
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);

        this.level.getLoc(x, y).addItem(ITEM_PRIZE);
    }
};

Game._drawRel = function(i, j, ch, c, b) {
    var x = i - this.left;
    var y = j - this.top;
    if (x >= 0 && x < DISPLAY_WIDTH && y >= 0 && y < DISPLAY_HEIGHT) {
        this.display.draw(x, y, ch, c, b);
    }
}

Game._drawAt = function(key, s, c) {
    var parts = key.split(",");
    var x = parseInt(parts[0]);
    var y = parseInt(parts[1]);
    this.display.draw(x, y, s, c)
}

Game._createPlayer = function(level,freeCells) {
    var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
    var key = freeCells.splice(index, 1)[0];
    var parts = key.split(",");
    var x = parseInt(parts[0]);
    var y = parseInt(parts[1]);
    this.player = new Player(x, y);
};

Game._generateMonsters = function(level,freeCells,numMonsters) {
    for (var i = 0; i < numMonsters; i++) {
        var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
        var key = freeCells.splice(index, 1)[0];
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        level.getLoc(x,y).addMonster(new Monster("Alien Robot Dude #" + (Math.floor(ROT.RNG.getUniform() * 10000) + 1), x, y, "r", "#f6f"));
    }
};

Game._generatePaul = function(level,freeCells) {
    var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
    var key = freeCells[index];
    var parts = key.split(",");
    var x = parseInt(parts[0]);
    var y = parseInt(parts[1]);
    var diffx = Math.abs(Game.player._x - x);
    var diffy = Math.abs(Game.player._y - y);

    while (diffx < 10 || diffy < 10) {
        index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
        key = freeCells[index];
        parts = key.split(",");
        x = parseInt(parts[0]);
        y = parseInt(parts[1]);
        diffx = Math.abs(Game.player._x - x);
        diffy = Math.abs(Game.player._y - y);
    }

    freeCells.splice(index, 1)[0];
    this.paul = new Paul(x, y);
};

Game._generateStairs = function(level,freeCells) {
    var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
    var key = freeCells[index];
    var parts = key.split(",");
    var x = parseInt(parts[0]);
    var y = parseInt(parts[1]);

    freeCells.splice(index, 1)[0];
    level.setLoc(x, y, new Location(x, y, TERRAIN_DOWNSTAIRS, []));

/*
    var diffx = Math.abs(Game.player._x - x);
    var diffy = Math.abs(Game.player._y - y);

    while (diffx < 10 || diffy < 10) {
        index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
        key = freeCells[index];
        parts = key.split(",");
        x = parseInt(parts[0]);
        y = parseInt(parts[1]);
        diffx = Math.abs(Game.player._x - x);
        diffy = Math.abs(Game.player._y - y);
    }

    freeCells.splice(index, 1)[0];
    this.paul = new Paul(x, y);
    }
    */
};

Game._findNeighbors = function(level, x, y, terrain) {
    var neighbors = 0;
    for (j = y-1; j <= y+1; j++) {
        for (i = x-1; i <= x+1; i++) {
            if (j == y && i == x) continue;
            if (i >= 0 && i < MAP_WIDTH && j >= 0 && j < MAP_HEIGHT) {
                var thisTerrain = level.getLoc(i, j).getTerrain();
                if (thisTerrain == terrain) {
                    neighbors++;
                }
            }
        }
    }

    return neighbors;
}

Game._displayMessages = function() {
    this.messageDisplay.clear();
    for (i = MESSAGE_HEIGHT - 1; i >= 0; i--) {
        var msgToDisplay = this.messages.length - i - 1;
        if (msgToDisplay >= 0) {
            var row = MESSAGE_HEIGHT - i - 1;
            this.messageDisplay.drawText(1, row, "%c{"+ this.messages[msgToDisplay]._color + "}" + this.messages[msgToDisplay]._str + "%c{}");
        }
    }
}

Game._displayStats = function() {
    this.statsDisplay.clear();
    this.statsDisplay.drawText(2,1,"%c{#0f0}Moves: %c{}" + this.player._moves);
    this.statsDisplay.drawText(2,2,"%c{#0f0}Prizes collected: %c{}" + this.player._items.length);
    this.statsDisplay.drawText(2,3,"%c{#0f0}Prizes remaining: %c{}" + this.prizesLeft);
    this.statsDisplay.drawText(2,4,"%c{#0f0}PaulFinder  : %c{}" + Math.floor(paulRange));
    this.statsDisplay.draw(12,4,String.fromCharCode(0x2122), "#0f0");
}

