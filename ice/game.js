var scheduler = null;

var Game = {
    tiles: true,
    display: null,
    top: null,
    left: null,
    tileSet: null,
    displaySize: 3,
    init: function() {
        console.log("Firin' up the game");
        Game.startGame();            
    }
}

Game._createDisplay = function() {
    while (document.getElementById("game").hasChildNodes()) {
        document.getElementById("game").removeChild(document.getElementById("game").lastChild);
    }

    DISPLAY_WIDTH = 240;
    DISPLAY_HEIGHT = 120;
    FONT_SIZE = 6;
    for (var i = 1; i < Game.displaySize; i++) {
        DISPLAY_WIDTH /= 2;
        DISPLAY_HEIGHT /= 2;
        FONT_SIZE *= 2;
    }
    options = {
        bg: "#000",
        width: DISPLAY_WIDTH,
        height: DISPLAY_HEIGHT,
        fontSize: FONT_SIZE
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
Game.engine = null;

Game.level = [];

currentLevel = 0;


var Message = function(s, c) {
    this._str = s;
    this._color = c;
    Game.messages.push(this);
    Game.refresh();
}

Game.refresh = function() {
    Game.display.clear();
    Game.drawMap();
    Game.drawStats();
    //Game._displayMessages();
    //Game._displayStats();

    for (var key in this.prizes) {
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        this.drawRel(x, y, [".", this.prizes[key]], "#0f0")
    }
    
    if (Game.player) {
        Game.player.draw();
    }

}

Game._digger = null;

function keyExists(key, search) {
    if (!search || (search.constructor !== Array && search.constructor !== Object)) {
        return false;
    }
    for (var i = 0; i < search.length; i++) {
        if (search[i] === key) {
            return true;
        }
    }
    return key in search;
}

Game.drawStats = function() {
    Game.display.drawText(1, DISPLAY_HEIGHT - 1, "%c{#0f0}Level " + (currentLevel+1));
}

Game.drawMap = function() {

    var visible = {};
    if (Game.player) {
        var lightPasses = function(x, y) {
            return ((Game.player._x == x && Game.player._y == y) || Game.level[currentLevel].getLoc(x, y) && !Game.level[currentLevel].getLoc(x, y).getTerrain().blocksLOS());
        }
        var fov = new ROT.FOV.RecursiveShadowcasting(lightPasses);

        fov.compute(Game.player._x, Game.player._y, 10, function(x, y, r, visibility) {
            visible[x+","+y]=true;
        });   
    }
    var w = Game.level[currentLevel].getWidth();
    var h = Game.level[currentLevel].getHeight();

    for (var y = 0; y < DISPLAY_HEIGHT; y++) {
        for (var x = 0; x < DISPLAY_WIDTH; x++) {
            var i = this.left + x;
            var j = this.top + y;
            var key = i + "," + j;
            if (j >= 0 && j < h && i >=0 && i < w) {
                var loc = this.level[currentLevel].getLoc(i,j);
                var items = loc.getItems();
                var monsters = loc.getMonsters();
                var color = loc.getTerrain().getDrawColor();
                var backColor = loc.getTerrain().getDrawBack();

                if (visible[key]) {
                    var dispChar = loc.getTerrain().getDrawChar();
                    Game.level[currentLevel].seen[key] = true;
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
                } else if (Game.level[currentLevel].seen[key]) {
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

}

Game._generatePrizes = function(level, freeCells) {
    for (var i=0;i<NUM_PRIZES;i++) {
        var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
        var key = freeCells.splice(index, 1)[0];
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);

        this.level[currentLevel].getLoc(x, y).addItem(ITEM_PRIZE);
    }
};

Game.drawRel = function(i, j, ch, c, b) {
    var x = i - this.left;
    var y = j - this.top;
    if (x >= 0 && x < DISPLAY_WIDTH && y >= 0 && y < DISPLAY_HEIGHT) {
        this.display.draw(x, y, ch, c, b);
    }
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

Game._generateStairs = function(lev,freeCells) {
    var level = Game.level[lev];

    if (currentLevel < NUM_LEVELS - 1) {
        var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
        var key = freeCells[index];
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);

        freeCells.splice(index, 1)[0];
        level.setLoc(x, y, new Location(x, y, TERRAIN_DOWNSTAIRS, []));
    }

    if (currentLevel > 0) {
        var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
        var key = freeCells[index];
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);

        freeCells.splice(index, 1)[0];
        level.setLoc(x, y, new Location(x, y, TERRAIN_UPSTAIRS, []));
    }

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
            if (i >= 0 && i < Game.level[currentLevel].getWidth() && j >= 0 && j < Game.level[currentLevel].height) {
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

