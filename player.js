var Player = function(x, y) {
    this._x = x;
    this._y = y;
    this._draw();
}

Player.prototype._draw = function() {
    Game._drawRel(this._x, this._y, [".", "@"], "#ff0");
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
 
    if (code == 77) {
        Game.mode = (Game.mode == "tile" ? "ascii" : "tile");
        Game._createDisplays();
        Game._refresh();
    }

    if (code == 73) {

        var info = new ROT.Display({width: 40, height: 20});
        //style="border-style: solid; border-width: 3px; border-color:#99f";
        info.getContainer().style="position:relative; top: -400px; border-style: solid; border-width: 1; border-color: #ffffff; float:top;";

        document.getElementById("thegame").appendChild(info.getContainer());

        info.drawText(5,5, "This is an info tab.", "#fff");

    }

    if (!(code in keyMap)) { return; }
 
    var diff = ROT.DIRS[8][keyMap[code]];
    var newX = this._x + diff[0];
    var newY = this._y + diff[1];

    var newKey = newX + "," + newY;

    if (newKey in Game.map) { 
        new Message("You can't go that way, cuz wall.", COLOR_WARN);
        return;
    } /* cannot move in this direction */

    //Game.display.draw(this._x, this._y, ".");
    this._x = newX;
    this._y = newY;
    Game.top = Game.top + diff[1];
    Game.left = Game.left + diff[0];

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
//                new Message("**** YOU GOT ALL DA PRIZES AND WON DA GAME BREH!!?! ****", COLOR_HAPPY);
            } else {
                new Message("You got a prize!  Fuckin' A!", "#ff0");
            }
            break;
        }
    }

    window.removeEventListener("keydown", this);
    Game.engine.unlock();    
}

