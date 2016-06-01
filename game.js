const MAP_HEIGHT=30;
const MAP_WIDTH=100;
const MESSAGE_HEIGHT=5;
const TOTAL_HEIGHT = MAP_HEIGHT + MESSAGE_HEIGHT  + 1;
const TOTAL_WIDTH = MAP_WIDTH;
const MESSAGE_TOP = MAP_HEIGHT+1;

const COLOR_INFO = "#99f"
const COLOR_WARN = "#f66"
const COLOR_HAPPY = "#6f6"

var Game = {
    display: null,
    init: function() {
        console.log("Firin' up the game");
        this.display = new ROT.Display({width: TOTAL_WIDTH,height: TOTAL_HEIGHT, fontSize: 16});
        document.getElementById("thegame").appendChild(this.display.getContainer());
		this._generateMap();        
        this._refresh();
        new Message("Welcome to JOLTROGUE.  Please, enjoy the dungeon...", "#0f0");
//        this.messages.push("4My second favorite random number is " + ROT.RNG.getUniform());
//        this.messages.push("5My second favorite random number is " + ROT.RNG.getUniform());

        var scheduler = new ROT.Scheduler.Simple();
        scheduler.add(this.player, true);
        this.engine = new ROT.Engine(scheduler);
        this.engine.start();
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
    if (Game.player) {
        Game.player._draw();
        var lightPasses = function(x, y) {
            var key = x+","+y;
            if (Game.map[key] || (Game._doors[key] && (x != Game.player._x || y != Game.player._y) )) return false;
            return true;
        }
        var fov = new ROT.FOV.PreciseShadowcasting(lightPasses);

        fov.compute(Game.player._x, Game.player._y, 15, function(x, y, r, visibility) {
            var ch = (r ? (!Game.map[x+","+y] ? "" : " ") : "@");
            var color = (!Game.map[x+","+y] ? "#113": "#336");
            Game.display.draw(x, y, ch, ch == "@" ? "#ff0" : "gray", color);
        });   
    }

    var line = Array(MAP_WIDTH).join(String.fromCharCode(0x2550));
    for (i = 0; i < MAP_WIDTH; i++ ) {
        this.display.draw(i, MAP_HEIGHT, String.fromCharCode(0x2550));
    }
    
    for (var key in this.prizes) {
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        this.display.draw(x, y, this.prizes[key], "#0f0")
    }
    
    for (var key in this._doors) {
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        if (x != Game.player._x || y != Game.player._y) {
            this.display.draw(x, y, "+", "red");        
        }
    }

}

Player.prototype._draw = function() {
    Game.display.draw(this._x, this._y, "@", "#ff0");
}

Player.prototype.act = function() {
    Game.engine.lock();
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
        new Message("You can't go that way!  Sorry about that.", COLOR_WARN);
        return;
    } /* cannot move in this direction */

//    Game.display.draw(this._x, this._y, "@", "black");
    this._x = newX;
    this._y = newY;

    Game._refresh();

    if (Game._doors[newKey]) {
        new Message("You walk clumsily through the door...", COLOR_INFO);
    }

    for (var key in Game.prizes) {
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        if (this._x == x && this._y == y) {
            delete Game.prizes[key];
            if (Object.keys(Game.prizes).length == 0) {
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
    this._digger = new ROT.Map.Uniform(MAP_WIDTH,MAP_HEIGHT, { roomDugPercentage:.2, roomWidth:[6,14], roomHeight:[4,10]});
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

Game._displayMessages = function() {
    for (i = MESSAGE_HEIGHT - 1; i >= 0; i--) {
        var msgToDisplay = this.messages.length - i - 1;
        if (msgToDisplay >= 0) {
            var row = MESSAGE_TOP + (MESSAGE_HEIGHT - i - 1);
            this.display.drawText(0, row, "%c{"+ this.messages[msgToDisplay]._color + "}" + this.messages[msgToDisplay]._str + "%c{}");
        }
    }
}

Game._drawWholeMap = function() {
    for (y = 0; y < MAP_HEIGHT; y++) {
        for (x = 0; x < MAP_WIDTH; x++) {
            var nullNeighbors = this._findNeighbors(x, y, null);
            var key = x + "," + y;
            if (this.map[key] && nullNeighbors > 0) {
                this.display.draw(x, y, "", "", "#332");
            } else {
                if (this.map[key]) {
                    this.display.draw(x, y, (Math.floor(ROT.RNG.getUniform() * 2)).toString(), "#030")
                }
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