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

    if (code == ROT.VK_SLASH && e.shiftKey) {

        window.removeEventListener("keydown", this);
        var info = new ROT.Display({width: 65, height: 25});
        //style="border-style: solid; border-width: 3px; border-color:#99f";
        document.getElementById("info").appendChild(info.getContainer());
        document.getElementById("info").style.border="4px double #00ff00";
        info.drawText(5,2, "Commands:", "#0f0");
        info.drawText(5,4, "g - get item", "#0f0");
        info.drawText(5,5, "m - switch between tiled and ASCII modes", "#0f0");
        info.drawText(5,6, "a - about JOLTROGUE");
        info.drawText(5,7, "? - this help screen");
        info.drawText(5,9, "Aaaand that's about it.", "#0f0");
        info.drawText(43,23, "(Hit ESC to go back)");
        window.addEventListener("keydown", function(e) {
            if (e.keyCode == ROT.VK_ESCAPE) {
                while (document.getElementById("info").hasChildNodes()) {
                    document.getElementById("info").removeChild(document.getElementById("info").lastChild);
                }
                document.getElementById("info").style.border="";
                window.removeEventListener("keydown", this);
                Game.engine.unlock();
            }
        });
        return;

    }

    if (code == ROT.VK_A) {

        window.removeEventListener("keydown", this);
        var info = new ROT.Display({width: 65, height: 25});
        //style="border-style: solid; border-width: 3px; border-color:#99f";
        document.getElementById("info").appendChild(info.getContainer());
        document.getElementById("info").style.border="4px double #00ff00";
        info.drawText(5,2, "%c{#0f0}JOLTROGUE is a JOLT COUNTRY GAMES production.");
        info.drawText(5,4, "%c{#0f0}Ben Parrish%c{#cc9} - Lead Developer");
        info.drawText(5,5, "%c{#0f0}Robb Sherwin%c{#cc9} - Tile Specialist");
        info.drawText(5,6, "%c{#0f0}Paul Robinson%c{#cc9} - The Man Who Made It All Possible");
        info.drawText(43,23, "(Hit ESC to go back)");
        window.addEventListener("keydown", function(e) {
            if (e.keyCode == ROT.VK_ESCAPE) {
                while (document.getElementById("info").hasChildNodes()) {
                    document.getElementById("info").removeChild(document.getElementById("info").lastChild);
                }
                document.getElementById("info").style.border="";
                window.removeEventListener("keydown", this);
                Game.engine.unlock();
            }
        });
        return;

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

