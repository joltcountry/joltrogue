const MAP_HEIGHT=30;
const MAP_WIDTH=100;
const MESSAGE_HEIGHT=5;
const TOTAL_HEIGHT = MAP_HEIGHT + MESSAGE_HEIGHT  + 1;
const TOTAL_WIDTH = MAP_WIDTH;
const MESSAGE_TOP = MAP_HEIGHT+1;

const COLOR_INFO = "#99f"
const COLOR_WARN = "#f66"
const COLOR_HAPPY = "#6f6"

var scheduler = null;

var Game = {
    display: null,
    init: function() {
        var tileSet = document.createElement("img");
        tileSet.src = "oryx_16bit_scifi_creatures.png";

        var options = {
            layout: "tile",
            bg: "transparent",
            tileWidth: 32,
            tileHeight: 32,
            tileSet: tileSet,
            tileMap: {
                "@": [3, 0]
            },
            width: 80,
            height: 20
        }        
        console.log("Firin' up the game");
        this.display = new ROT.Display({width: TOTAL_WIDTH,height: TOTAL_HEIGHT, fontSize: 16});
//        this.display = new ROT.Display(options);
        document.getElementById("thegame").appendChild(this.display.getContainer());
        this.renderStart();
		//this._generateMap();        
        //this._refresh();
        //new Message("Welcome to JOLTROGUE.  Please, enjoy the dungeon...", "#0f0");
//        this.messages.push("4My second favorite random number is " + ROT.RNG.getUniform());
//        this.messages.push("5My second favorite random number is " + ROT.RNG.getUniform());

        //scheduler = new ROT.Scheduler.Simple();
        //scheduler.add(this.player, true);
        //this.engine = new ROT.Engine(scheduler);
        //this.engine.start();
    }
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  while(true) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

var gameStarted = false;
Game.startGame = function(e) {
    window.removeEventListener('keydown', Game.startGame);
    gameStarted = true;
    Game._generateMap();        
    Game._refresh();
    new Message("Welcome to JOLTROGUE.  Please, enjoy the dungeon...", "#0f0");

    scheduler = new ROT.Scheduler.Simple();
    scheduler.add(Game.player, true);
    scheduler.add(Game.paul, true);
    Game.engine = new ROT.Engine(scheduler);
    Game.engine.start();
}

Game.renderStart = function() {
    this.display.clear();
    for (var i = 30; i >= 5; i--) {
        setTimeout(Game.drawMatrix, (30 - i) * 70, i);
    }

    var delay = 25*70;

    for (var row = 0; row < TOTAL_HEIGHT; row++) {
//        setTimeout(Game.drawMatrixLine, delay + (row+1 * 500), row);
        setTimeout(Game.drawMatrixLine, delay + (row * 30), row);
    }

    delay += (TOTAL_HEIGHT-5) * 30;
    setTimeout(window.addEventListener, delay+1000, 'keydown', Game.startGame);

    setTimeout(Game.showStartText, delay);
   //this.display.clear();
    //this.blinkingCursor(0, 0, "#0f0", 10, 100);
}

Game.drawMatrixLine = function(row) {
    for (var i = 30; i >= 0; i--) {
        setTimeout(Game.drawSolidLine, (15-i) * 30, row, i);
    }
}

Game.drawSolidLine = function(row, intensity) {
    for (var col = 0; col < TOTAL_WIDTH; col++) {
        Game.display.draw(col, row, Math.floor(ROT.RNG.getUniform() * 10).toString(), "#000", ROT.Color.toRGB([0, intensity*16, 0]));
    }
}

Game.showStartText = function() {

    var msgs = [
      ["Welcome to JOLTROGUE.", COLOR_HAPPY],
      [""],
      ["Explore the dungeon...", COLOR_HAPPY],
      ["Collect prizes...", COLOR_HAPPY],
      ["Drink rye...", COLOR_HAPPY],
      [""],
      [""],
      [""],
      ["AVOID PAUL.", COLOR_WARN],
      [""],
      [""],
      [""],
      [""],
      [""],
      [""],
      [""],
      [""],
      ["PRESS ANY KEY TO BEGIN.", COLOR_INFO]
    ];

    var ctr = 0;
    for (var row = 0; row < msgs.length; row++) {
        if (msgs[row][0] == "") continue;
        setTimeout(drawLine, 2200 * ctr++, 10, 5 + row, msgs[row][0], msgs[row][1], row == msgs.length - 1 ? false : true);
    }
 
}

drawLine = function(x, y, str, color, showCursor) {
    if (!gameStarted) {
        for (var i = 0; i < str.length; i++) {
            setTimeout(drawChar, i*30, x+i, y, str[i], color);
            setTimeout(drawChar, i*30, x+i+1, y, "", "", color);
        }
        if (showCursor) {
            totalDelay = str.length * 30;
            setTimeout(drawChar, totalDelay, x+str.length, y, "", "", color)
            setTimeout(drawChar, totalDelay+300, x+str.length, y, "", "", "")
            setTimeout(drawChar, totalDelay+600, x+str.length, y, "", "", color)
            setTimeout(drawChar, totalDelay+900, x+str.length, y, "", "", "")
            setTimeout(drawChar, totalDelay+1200, x+str.length, y, "", "", color)
            setTimeout(drawChar, totalDelay+1500, x+str.length, y, "", "", "")
        }
    }
}

drawChar = function(x, y, ch, color, back) {
    if (!gameStarted) {
        Game.display.draw(x, y, ch, color, back);
    }
}

Game.drawMatrix = function(intensity) {
    for (var j = 0; j < TOTAL_HEIGHT; j++) {
        for (var i = 0; i < TOTAL_WIDTH; i++) {
            Game.display.draw(i, j, Math.floor(ROT.RNG.getUniform() * 2).toString(), ROT.Color.toRGB([0, intensity * 16, 0]), "");
        }
    }
}


Game.prizes = {};
Game.map = {};
Game.messages = [];
Game.player = null;
Game.paul = null;

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

var Paul = function(x, y) {
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

    if (Game.paul) {
        Game.paul._draw();
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
        if ((x != Game.player._x || y != Game.player._y) && (x != Game.paul._x || y != Game.paul._y)) {
            this.display.draw(x, y, "+", "#cc9");        
        }
    }

}

Player.prototype._draw = function() {
    Game.display.draw(this._x, this._y, "@", "#ff0");
}

Player.prototype.act = function() {
    Game.engine.lock();
    console.log("It is your turn, press any relevant key.");
    /* wait for user input; do stuff when user hits a key */
    window.addEventListener("keydown", this);
}

Paul.prototype._draw = function() {
    //Game.display.draw(this._x, this._y, String.fromCharCode("1F464"), "#f00");
    Game.display.draw(this._x, this._y, String.fromCharCode("0x267f"), "#f00");
}

Paul.prototype.act = function() {
    //Game.engine.lock();
    console.log("Paul is IN DA HOUSE");
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
        new Message("You stumble clumsily through the door...", COLOR_INFO);
    }

    for (var key in Game.prizes) {
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        if (this._x == x && this._y == y) {
            delete Game.prizes[key];
            if (Object.keys(Game.prizes).length == 0) {
                Game._showWin();
                //new Message("**** YOU GOT ALL DA PRIZES AND WON DA GAME BREH!!?! ****", COLOR_HAPPY);
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

Game._showWin = function() {
    this.display.clear();

    for (j = 0; j < TOTAL_HEIGHT; j++) {
        for (i = 0; i < TOTAL_WIDTH; i++) {
            if (j < 16 || j > 18) this.display.draw(i,j,String.fromCharCode(0x263a), "#ff0");

        }
    }
    this.display.drawText(27,17, "%c{#0f0}You WIN, eh?  Why not enjoy a nice fifth of rye?");
    scheduler.remove(this.player);
    scheduler.remove(this.paul);

}
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
    this._generatePaul(freecells);

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

Game._generatePaul = function(freeCells) {
    var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
    var key = freeCells.splice(index, 1)[0];
    //this.map[key] = "%";
    var parts = key.split(",");
    var x = parseInt(parts[0]);
    var y = parseInt(parts[1]);
    this.paul = new Paul(x, y);
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