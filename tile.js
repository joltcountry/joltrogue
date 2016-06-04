//const MAP_HEIGHT=30;
//const MAP_WIDTH=30;
const MAP_HEIGHT=40;
const MAP_WIDTH=60;
var DISPLAY_HEIGHT=24;
var DISPLAY_WIDTH=40;
const MESSAGE_HEIGHT=5;
const TOTAL_HEIGHT = MAP_HEIGHT;
const TOTAL_WIDTH = MAP_WIDTH;

const COLOR_INFO = "#99f"
const COLOR_WARN = "#f66"
const COLOR_HAPPY = "#6f6"

const NUM_PRIZES = 10;

var scheduler = null;

var Game = {
    mode: "tile",
    display: null,
    top: null,
    left: null,
    tileSet: null,
    init: function() {
        this.tileSet = document.createElement("img");
        this.tileSet.src = "tiles.png";
    console.log("Firin' up the game");
//        this.display = new ROT.Display({width: TOTAL_WIDTH,height: TOTAL_HEIGHT, fontSize: 16});
        this.tileSet.onload = function() {
//            Game.renderStart();            
            Game.startGame();            
        }
    }
}

Game._createDisplays = function() {
    var options = null;
    if (this.mode == "tile") {
        DISPLAY_WIDTH = 40;
        DISPLAY_HEIGHT = 24;
        options = {
            layout: "tile",
            bg: "#012",
            tileWidth: 23,
            tileHeight: 24,
            tileSet: this.tileSet,
            tileMap: {
                "@": [0, 0],
                "%": [96, 0],
                "#": [72, 0],
                "+": [48, 0],
                ".": [24, 0],
                "P": [168, 0]
            },
            width: DISPLAY_WIDTH,
            height: DISPLAY_HEIGHT
        };
    } else {
        DISPLAY_WIDTH = 98;
        DISPLAY_HEIGHT = 38;
        options = {
            bg: "#012",
            tileWidth: 22,
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
    }

    if (this.player) {
        this.top = this.player._y - (DISPLAY_HEIGHT / 2);
        this.left = this.player._x - (DISPLAY_WIDTH / 2);
    }

    while (document.getElementById("thegame").hasChildNodes()) {
        document.getElementById("thegame").removeChild(document.getElementById("thegame").lastChild);
    }

    Game.display = new ROT.Display(options);
    Game.display2 = new ROT.Display({width: 98, height: 5});
    Game.display.getContainer().style="border-style: groove; border-width: 3px; border-color:#99f;";
    Game.display2.getContainer().style="border-style: solid; border-width: 1px; border-color:#0f0;";
    //style="border-style: solid; border-width: 3px; border-color:#99f";
    document.getElementById("thegame").appendChild(Game.display.getContainer());
    document.getElementById("thegame").appendChild(Game.display2.getContainer()); 
}

Game.prizes = {};
Game.map = {};
Game.messages = [];
Game.player = null;
Game.paul = null;

Game.engine = null;

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
    //Game.engine.lock();
    var paulTest = ROT.RNG.getPercentage();

    if (paulTest > 30) {
        var x = Game.player._x;
        var y = Game.player._y;
        var passableCallback = function(x, y) {
            return (!Game.map[x+","+y]);
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
            Game._refresh();
        }
    } else if (paulTest > 20) {
        var diff = ROT.DIRS[8][Math.floor(ROT.RNG.getUniform() * 8)];
        var newX = this._x + diff[0];
        var newY = this._y + diff[1];
     
        var newKey = newX + "," + newY;

        while (newKey in Game.map) { 
            if (Math.floor(ROT.RNG.getUniform()*3) == 1) {
                new Message("Paul slams his wheelchair into the wall, breaking an Android tablet.", COLOR_INFO);
                return;
            }
            var diff = ROT.DIRS[8][Math.floor(ROT.RNG.getUniform() * 8)];
            var newX = this._x + diff[0];
            var newY = this._y + diff[1];
         
            var newKey = newX + "," + newY;
        } /* cannot move in this direction */

        this._x = newX;
        this._y = newY;        
    }
}

var Message = function(s, c) {
    this._str = s;
    this._color = c;
    Game.messages.push(this);
    Game._refresh();
}

Game._refresh = function() {
    Game.display.clear();
    Game._drawWholeMap();
    Game._displayMessages();

    for (var key in this.prizes) {
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        this._drawRel(x, y, [".", this.prizes[key]], "#0f0")
    }
    
    for (var key in this._doors) {
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        if ((x != Game.player._x || y != Game.player._y)) {
            this._drawRel(x, y, ["+"], "#f96");        
        }
    }

    if (Game.paul) {
        Game.paul._draw();
    }

    if (Game.player) {
        Game.player._draw();
    }

}

Game._digger = null;

Game._generateMap = function() {
    this._digger = new ROT.Map.Uniform(MAP_WIDTH,MAP_HEIGHT, { roomDugPercentage:.2, roomWidth:[3,20], roomHeight:[3,20], corridorLength:[3, 20]});
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
    this._generatePaul(freecells);    

    this.top = this.player._y - (DISPLAY_HEIGHT / 2);
    this.left = this.player._x - (DISPLAY_WIDTH / 2);

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

    for (var y = 0; y < DISPLAY_HEIGHT; y++) {
        for (var x = 0; x < DISPLAY_WIDTH; x++) {
            var i = this.left + x;
            var j = this.top + y;
            if (j >= 0 && j < MAP_HEIGHT && i >=0 && i < MAP_WIDTH) {
                var nullNeighbors = this._findNeighbors(i, j, null);
                var key = i + "," + j;
                if (this.map[key] && nullNeighbors > 0) {
                  //  alert('huh');
                    this.display.draw(x, y, "#");
                } else if (!this.map[key]) {
                   // alert('huh2');
                    this.display.draw(x, y, ".", "#666")
    //                if (this.map[key]) {
    //                    this.display.draw(x, y, (Math.floor(ROT.RNG.getUniform() * 2)).toString(), "#030")
    //              }
                }
            }
        }
    }

}

Game._generatePrizes = function(freeCells) {
    for (var i=0;i<NUM_PRIZES;i++) {
        var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
        var key = freeCells.splice(index, 1)[0];
        //this.map[key] = "%";
        this.prizes[key] = "%";
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

Game._createPlayer = function(freeCells) {
    var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
    var key = freeCells.splice(index, 1)[0];
    var parts = key.split(",");
    var x = parseInt(parts[0]);
    var y = parseInt(parts[1]);
    this.player = new Player(x, y);
};

Game._generatePaul = function(freeCells) {
    var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
    var key = freeCells.splice(index, 1)[0];
    //this.map[key] = "%";
    var parts = key.split(",");
    var x = parseInt(parts[0]);
    var y = parseInt(parts[1]);
    this.paul = new Paul(x, y);
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

