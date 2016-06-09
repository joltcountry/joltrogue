var Player = function(x, y) {
    this._x = x;
    this._y = y;
    this._draw();
    this._items = [];
    this._moves = 0;
}

Player.prototype._draw = function() {
    Game._drawRel(this._x, this._y, "@", "#ff0", "#222");
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

    if (code == 12) {
        alert(this._x + "," + this._y);
        this._moves++;
        Game.refresh();
        window.removeEventListener("keydown", this);
        Game.engine.unlock();
        return;
    }

    if (code == ROT.VK_G && Game.level.getLoc(this._x, this._y).hasItem(ITEM_PRIZE)) {
        this._moves++;
        Game.level.getLoc(this._x, this._y).removeItem(ITEM_PRIZE);
        Game.prizesLeft--;
        if (Game.prizesLeft == 0) {
            Game._showWin();
        } else {
            new Message("You got a prize!  (" + Game.prizesLeft + " remaining)", COLOR_HAPPY);
            this._items.push(ITEM_PRIZE);
        }
    }

    if (!(code in keyMap)) { return; }
 
    var diff = ROT.DIRS[8][keyMap[code]];
    var newX = this._x + diff[0];
    var newY = this._y + diff[1];

    if (newX < 0 || newX >= MAP_WIDTH || newY < 0 || newY >= MAP_HEIGHT || Game.level.getLoc(newX, newY).getTerrain().blocksMovement()) {
        return;
    }

    this._moves++;

    //Game.display.draw(this._x, this._y, ".");
    this._x = newX;
    this._y = newY;
    Game.top = Game.top + diff[1];
    Game.left = Game.left + diff[0];

    Game.refresh();

    window.removeEventListener("keydown", this);
    Game.engine.unlock();    
}

