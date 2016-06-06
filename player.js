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
//    if (code == ROT.VK_QUESTION_MARK) {
    if (code == ROT.VK_SLASH && e.shiftKey) {
        new Message("", COLOR_INFO);
        new Message("Commands:", COLOR_INFO);
        new Message("m - switch between tiles and ASCII", COLOR_INFO);
        new Message("g - get item", COLOR_INFO);
        new Message("", COLOR_INFO);
    }

    if (code == 12) {
        Game._refresh();
        window.removeEventListener("keydown", this);
        Game.engine.unlock();
        return;
    }

    if (code == 77) {
        Game.tiles = (!Game.tiles);
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

    if (code == ROT.VK_G && Game.level.getLoc(this._x, this._y).hasItem(ITEM_PRIZE)) {
        Game.level.getLoc(this._x, this._y).removeItem(ITEM_PRIZE);
        Game.prizesLeft--;
        if (Game.prizesLeft == 0) {
            Game._showWin();
        } else {
            new Message("You got a prize!  (" + Game.prizesLeft + " remaining)", COLOR_HAPPY);
        }
    }

    if (!(code in keyMap)) { return; }
 
    var diff = ROT.DIRS[8][keyMap[code]];
    var newX = this._x + diff[0];
    var newY = this._y + diff[1];

    if (Game.level.getLoc(newX, newY).getTerrain().blocksMovement()) { 
        return;
    } /* cannot move in this direction */

    //Game.display.draw(this._x, this._y, ".");
    this._x = newX;
    this._y = newY;
    Game.top = Game.top + diff[1];
    Game.left = Game.left + diff[0];

    if (this._x == Game.paul._x && this._y == Game.paul._y) {
        Game._showLose();
        return;
    }

    Game._refresh();

    if (Game.level.getLoc(newX, newY).getTerrain() == TERRAIN_DOOR) {
        new Message("You stumble clumsily through the door...", COLOR_INFO);
    }

    if (Game.level.getLoc(newX, newY).hasItem(ITEM_PRIZE)) {
        new Message("There's a prize here!  Oh boy!", COLOR_INFO);
    }

    window.removeEventListener("keydown", this);
    Game.engine.unlock();    
}

