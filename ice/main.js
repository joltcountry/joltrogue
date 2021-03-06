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
        bg: "#012",
        tileWidth: 23,
        tileHeight: 24,
        tileSet: this.tileSet,
        tileMap: {
            "@": [0, 0],
            "%": [96, 0],
            "#": [72, 0],
            "+": [48, 0],
            ".": [24, 0]
        },
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

var Paul = function(x, y) {
    this._x = x;
    this._y = y;
    this._draw();
}

Paul.prototype._draw = function() {
    //Game.display.draw(this._x, this._y, String.fromCharCode("1F464"), "#f00");
    Game._drawRel(this._x, this._y, [".", "P"], "#f00");    
}

Paul.prototype.act = function() {

    Game.engine.lock();

    var paulTest = ROT.RNG.getPercentage();

    if (paulTest > 40) {
        var x = Game.player._x;
        var y = Game.player._y;
        var passableCallback = function(x, y) {
            return (Game.level.getLoc(x, y).getTerrain() && !Game.level.getLoc(x, y).getTerrain().blocksMovement());
        }
        var astar = new ROT.Path.AStar(x, y, passableCallback);
     
        var path = [];
        var pathCallback = function(x, y) {
            path.push([x, y]);
        }
        astar.compute(this._x, this._y, pathCallback);
        path.shift(); /* remove Pedro's position */

        if (path.length == 1) {
            Game._showLose();
        } else {
            x = path[0][0];
            y = path[0][1];
            this._x = x;
            this._y = y;
            Game.refresh();
        }
    } else if (paulTest > 20) {
        var diff = ROT.DIRS[8][Math.floor(ROT.RNG.getUniform() * 8)];
        var newX = this._x + diff[0];
        var newY = this._y + diff[1];
        var newKey = newX + "," + newY;

        while (Game.level.getLoc(newX, newY).getTerrain().blocksMovement()) { 
            if (Math.floor(ROT.RNG.getUniform()*3) == 1) {
                Game.engine.unlock();                
                return;
            }
            diff = ROT.DIRS[8][Math.floor(ROT.RNG.getUniform() * 8)];
            newX = this._x + diff[0];
            newY = this._y + diff[1];
        }

        this._x = newX;
        this._y = newY;        
        Game.refresh();

    }

    Game.engine.unlock();

}

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
    this._digger = new ROT.Map.Uniform(MAP_WIDTH,MAP_HEIGHT, { roomDugPercentage:.2, roomWidth:[3,20], roomHeight:[3,20], corridorLength:[3, 20]});

    this.level = new Level(MAP_WIDTH, MAP_HEIGHT);

    var digCallback = function(x, y, value) {
        var key = x + "," + y;
        if (value) { 
            this.level.setLoc(x, y, new Location(x, y, TERRAIN_OUTSIDE, []));
        } else {
            this.level.setLoc(x, y, new Location(x, y, TERRAIN_FLOOR, []));
            this.freecells.push(key);
        }
 
    }

    this._digger.create(digCallback.bind(this));

    // determine walls

    for (var y = 0; y < this.level.getHeight(); y++) {
        for (var x = 0; x < this.level.getWidth(); x++) {
            if (this.level.getLoc(x, y).getTerrain() == TERRAIN_OUTSIDE) { 
                var floorNeighbors = this._findNeighbors(this.level, x, y, TERRAIN_FLOOR);
                if (floorNeighbors > 0) {
                    this.level.setLoc(x, y, new Location(x, y, TERRAIN_WALL, []));
                }
            }
        }
    }

    //////////////////


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

    this._generatePrizes(this.level, this.freecells);
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
                alert(loc);
                var items = loc.getItems();
                var monsters = loc.getMonsters();
                var color = loc.getTerrain().getDrawColor();
                if (visible[key]) {
                    var dispChars = [loc.getTerrain().getDrawChar()];
                    this.seen[key] = true;
                    for (var item = 0; item < items.length; item++) {
                        dispChars.push(items[item].getDrawChar());
                        color = items[item].getDrawColor();
                    }
                    if (monsters.length > 0) {
                        for (var monster = 0; monster < monsters.length; monster++) {
                            dispChars.push(monsters[monster].getDrawChar());
                            color = monsters[monster].getDrawColor();
                        }
                    }
                    this.display.draw(x, y, dispChars, color);
                    if (Game.paul && Game.paul._x == i && Game.paul._y == j) {
                        this.display.draw(x, y, "P", "#f00");
                    }
                } else if (this.seen[key]) {
                    var dispChars = [this.tiles ? loc.getTerrain().getDarkChar() : loc.getTerrain().getDrawChar()];
                    var color = loc.getTerrain().getDarkColor();
                    for (var item = 0; item < items.length; item++) {
                        dispChars.push(this.tiles ? items[item].getDarkChar() : items[item].getDrawChar());
                        color = items[item].getDarkColor();
                    }
                    this.display.draw(x, y, dispChars, color);
                } else {
                    this.display.draw(x, y, " ");
                }
            } else {
                    this.display.draw(x, y, " ");
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

Game._drawRel = function(i, j, ch, c) {
    var x = i - this.left;
    var y = j - this.top;
    if (x >= 0 && x < DISPLAY_WIDTH && y >= 0 && y < DISPLAY_HEIGHT) {
        this.display.draw(x, y, ch, c);
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
    level.getSpecial()["downstairs"] = [x,y];
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
    var paulRange = Math.sqrt(Math.pow(this.player._x - this.paul._x, 2) + Math.pow(this.player._y - this.paul._y, 2));
    this.statsDisplay.clear();
    this.statsDisplay.drawText(2,1,"%c{#0f0}Moves: %c{}" + this.player._moves);
    this.statsDisplay.drawText(2,2,"%c{#0f0}Prizes collected: %c{}" + this.player._items.length);
    this.statsDisplay.drawText(2,3,"%c{#0f0}Prizes remaining: %c{}" + this.prizesLeft);
    this.statsDisplay.drawText(2,4,"%c{#0f0}PaulFinder  : %c{}" + Math.floor(paulRange));
    this.statsDisplay.draw(12,4,String.fromCharCode(0x2122), "#0f0");
}

