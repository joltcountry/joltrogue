const MAP_HEIGHT=24;
const MAP_WIDTH=40;
const MESSAGE_HEIGHT=5;
const TOTAL_HEIGHT = MAP_HEIGHT;
const TOTAL_WIDTH = MAP_WIDTH;

const COLOR_INFO = "#99f"
const COLOR_WARN = "#f66"
const COLOR_HAPPY = "#6f6"

var scheduler = null;

var Game = {
    display: null,
    init: function() {
        var tileSet = document.createElement("img");
        tileSet.src = "tiles.png";

        var options = {
            layout: "tile",
            bg: "transparent",
            tileWidth: 22,
            tileHeight: 24,
            tileSet: tileSet,
            tileMap: {
                "@": [0, 0],
                "%": [96, 0],
                "#": [72, 0],
                "+": [48, 0],
                ".": [24, 0]
            },
            width: MAP_WIDTH,
            height: MAP_HEIGHT
        }        
        console.log("Firin' up the game");
//        this.display = new ROT.Display({width: TOTAL_WIDTH,height: TOTAL_HEIGHT, fontSize: 16});
        tileSet.onload = function() {
            Game.display = new ROT.Display(options);
            Game.display2 = new ROT.Display({width: 80, height: 5, bg: "#032"});
            document.getElementById("thegame").appendChild(Game.display.getContainer());
            document.getElementById("thegame").appendChild(Game.display2.getContainer());
    		Game._generateMap();   
            new Message("Welcome to JOLTROGUE.  Please, enjoy the dungeon...", "#0f0");

            Game._refresh();
            scheduler = new ROT.Scheduler.Simple();
            scheduler.add(Game.player, true);
            Game.engine = new ROT.Engine(scheduler);
            Game.engine.start();
        }
    }
}

Game.prizes = {};
Game.map = {};
Game.messages = [];
Game.player = null;

Game.engine = null;

var Message = function(s, c) {
    this._str = s;
    this._color = c;
    Game.messages.push(this);
    Game._refresh();
}

var Player = function(x, y) {
    this._x = x;
    this._y = y;
    this._draw();
}

Game._refresh = function() {
    Game.display.clear();
    Game._drawWholeMap();
    Game._displayMessages();

    for (var key in this.prizes) {
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        this.display.draw(x, y, [".", this.prizes[key]])
    }
    
    for (var key in this._doors) {
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        if ((x != Game.player._x || y != Game.player._y)) {
            this.display.draw(x, y, ["+"]);        
        }
    }

    if (Game.player) {
        Game.player._draw();
    }

}

Player.prototype._draw = function() {
    Game.display.draw(this._x, this._y, [".", "@"], "#ff0");
}

Player.prototype.act = function() {
    Game.engine.lock();
    console.log("It is your turn, press any relevant key.");
    /* wait for user input; do stuff when user hits a key */
    window.addEventListener("keydown", this);
}

Player.prototype.handleEvent = function(e) {
    var keyMap = {};
    keyMap[38] = 0;
    keyMap[33] = 1;
    keyMap[39] = 2;
    keyMap[34] = 3;
    keyMap[40] = 4;
    keyMap[35] = 5;
    keyMap[37] = 6;
    keyMap[36] = 7;

    var code = e.keyCode;
 
    if (!(code in keyMap)) { return; }
 
    var diff = ROT.DIRS[8][keyMap[code]];
    var newX = this._x + diff[0];
    var newY = this._y + diff[1];
 
    var newKey = newX + "," + newY;

    if (newKey in Game.map) { 
        new Message("You can't go that way, cuz wall.", COLOR_WARN);
        return;
    } /* cannot move in this direction */

    Game.display.draw(this._x, this._y, ".");
    this._x = newX;
    this._y = newY;

    Game._refresh();

    if (Game._doors[newKey]) {
        new Message("You stumble clumsily through the door...", COLOR_INFO);
    }

    for (var key in Game.prizes) {
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        if (this._x == x && this._y == y) {
            delete Game.prizes[key];
            if (Object.keys(Game.prizes).length == 0) {
//                Game._showWin();
                new Message("**** YOU GOT ALL DA PRIZES AND WON DA GAME BREH!!?! ****", COLOR_HAPPY);
            } else {
                new Message("You got a prize!  Fuckin' A!", "#ff0");
            }
            break;
        }
    }

    window.removeEventListener("keydown", this);
    Game.engine.unlock();    
}

Game._digger = null;

Game._generateMap = function() {
    this._digger = new ROT.Map.Uniform(MAP_WIDTH,MAP_HEIGHT, { roomDugPercentage:.25, roomWidth:[3,8], roomHeight:[3,6]});
    var freecells = [];

    var digCallback = function(x, y, value) {
        var key = x+","+y;
        if (value) { 
	        this.map[key] = ROT.RNG.getPercentage() > 10 ? "." : ",";
        } /* do not store walls */ else {
            freecells.push(key);
        }
 
        //var key = x+","+y;
        //this.map[key] = ".";
    }
    this._digger.create(digCallback.bind(this));
    this._generatePrizes(freecells);
    this._createPlayer(freecells);

    var addDoor = function(x, y) {
        if (Math.floor(ROT.RNG.getUniform() * 10) > 6) {
            var key = x + "," + y;
            Game._doors[key] = true;
        }
    }

    var rooms = this._digger.getRooms();
    for (var i=0; i<rooms.length; i++) {
        var room = rooms[i];
        room.getDoors(addDoor);
    }


}

Game._doors = {};

Game._drawWholeMap = function() {
    for (y = 0; y < MAP_HEIGHT; y++) {
        for (x = 0; x < MAP_WIDTH; x++) {
            var nullNeighbors = this._findNeighbors(x, y, null);
            var key = x + "," + y;
            if (this.map[key] && nullNeighbors > 0) {
                this.display.draw(x, y, "#");
            } else if (!this.map[key]) {
                this.display.draw(x, y, ".")
//                if (this.map[key]) {
//                    this.display.draw(x, y, (Math.floor(ROT.RNG.getUniform() * 2)).toString(), "#030")
//              }
            }
        }
    }

}

Game._generatePrizes = function(freeCells) {
    for (var i=0;i<10;i++) {
        var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
        var key = freeCells.splice(index, 1)[0];
        //this.map[key] = "%";
        this.prizes[key] = "%";
    }
};

Game._drawAt = function(key, s, c) {
    var parts = key.split(",");
    var x = parseInt(parts[0]);
    var y = parseInt(parts[1]);
    this.display.draw(x, y, s, c)
}

Game._createPlayer = function(freeCells) {
    var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
    var key = freeCells.splice(index, 1)[0];
    var parts = key.split(",");
    var x = parseInt(parts[0]);
    var y = parseInt(parts[1]);
    this.player = new Player(x, y);
};

var keyMap = {};
keyMap[38] = 0;
keyMap[33] = 1;
keyMap[39] = 2;
keyMap[34] = 3;
keyMap[40] = 4;
keyMap[35] = 5;
keyMap[37] = 6;
keyMap[36] = 7;

Game._findNeighbors = function(x, y, val) {
    var neighbors = 0;
    for (j = y-1; j <= y+1; j++) {
        for (i = x-1; i <= x+1; i++) {
            if (j == y && i == x) continue;
            if (i >= 0 && i < MAP_WIDTH && j >= 0 && j < MAP_HEIGHT) {
                var key = i + "," + j;
                var thisval = this.map[key];
                if (val == thisval) {
                    neighbors++;
                }
            }
        }
    }
    if (neighbors > 0) {
//        alert("foundneihgbors");
    }
    return neighbors;
}

Game._displayMessages = function() {
    this.display2.clear();
    for (i = MESSAGE_HEIGHT - 1; i >= 0; i--) {
        var msgToDisplay = this.messages.length - i - 1;
        if (msgToDisplay >= 0) {
            var row = MESSAGE_HEIGHT - i - 1;
            this.display2.drawText(0, row, "%c{"+ this.messages[msgToDisplay]._color + "}" + this.messages[msgToDisplay]._str + "%c{}");
        }
    }
}

