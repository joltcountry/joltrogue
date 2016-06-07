var gameStarted = false;

Game.startGame = function(e) {
    window.removeEventListener('keydown', Game.startGame);
    while (document.getElementById("thegame").hasChildNodes()) {
        document.getElementById("thegame").removeChild(document.getElementById("thegame").lastChild);
    }    
    Game._createDisplays();
    Game._generateMap();   
    new Message("Welcome to JOLTROGUE.  Please, enjoy the dungeon...", COLOR_HAPPY);
    new Message("(Press '?' for help.)", COLOR_INFO)
    Game._refresh();
    scheduler = new ROT.Scheduler.Simple();
    scheduler.add(Game.player, true);
    scheduler.add(Game.paul, true);
    Game.engine = new ROT.Engine(scheduler);
    Game.engine.start();  
    gameStarted = true;
}

Game.renderStart = function() {
test();
//Game.startGame();
//return;
    DISPLAY_HEIGHT = 40;
    DISPLAY_WIDTH = 98;
    Game.display = new ROT.Display({width: DISPLAY_WIDTH, height: DISPLAY_HEIGHT});
    //style="border-style: solid; border-width: 3px; border-color:#99f";
    document.getElementById("thegame").appendChild(Game.display.getContainer());

    this.display.clear();
    for (var i = 30; i >= 5; i--) {
        setTimeout(Game.drawMatrix, (30 - i) * 70, i);
    }

    var delay = 25*70;

    for (var row = 0; row < DISPLAY_HEIGHT; row++) {
//        setTimeout(Game.drawMatrixLine, delay + (row+1 * 500), row);
        setTimeout(Game.drawMatrixLine, delay + (row * 30), row);
    }

    delay += (DISPLAY_HEIGHT-5) * 30;
 
    setTimeout(window.addEventListener, delay+500, 'keydown', Game.startGame);

    setTimeout(Game.showStartText, delay);

}

Game.drawMatrixLine = function(row) {
    for (var i = 30; i >= 0; i--) {
        setTimeout(Game.drawSolidLine, (15-i) * 30, row, i);
    }
}

Game.drawSolidLine = function(row, intensity) {
    for (var col = 0; col < DISPLAY_WIDTH; col++) {
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
    for (var j = 0; j < DISPLAY_HEIGHT; j++) {
        for (var i = 0; i < DISPLAY_WIDTH; i++) {
            Game.display.draw(i, j, Math.floor(ROT.RNG.getUniform() * 2).toString(), ROT.Color.toRGB([0, intensity * 16, 0]), "");
        }
    }
}




Game._showWin = function() {

    window.removeEventListener('keydown', Game.player);
    Game.engine.lock();

    DISPLAY_HEIGHT = 18;
    DISPLAY_WIDTH = 33;

    while (document.getElementById("thegame").hasChildNodes()) {
        document.getElementById("thegame").removeChild(document.getElementById("thegame").lastChild);
    }  
    while (document.getElementById("messages").hasChildNodes()) {
        document.getElementById("messages").removeChild(document.getElementById("messages").lastChild);
    }  
    while (document.getElementById("thegame").hasChildNodes()) {
        document.getElementById("stats").removeChild(document.getElementById("stats").lastChild);
    }  

    Game.display = new ROT.Display({width: DISPLAY_WIDTH, height: DISPLAY_HEIGHT, fontSize: 48});
    //style="border-style: solid; border-width: 3px; border-color:#99f";
    document.getElementById("thegame").appendChild(Game.display.getContainer());

    this.display.clear();

    for (i = 0; i < 30; i++) {
        this.display.draw(Math.floor(ROT.RNG.getUniform() * DISPLAY_WIDTH),Math.floor(ROT.RNG.getUniform() * DISPLAY_HEIGHT),String.fromCharCode(0x263a), "#ff0");
    }

    this.display.drawText(10,5, "%c{#0f0}Yay, you won!");
    this.display.drawText(1,7, "%c{#0f0}Let's celebrate with some rye!!");
    scheduler.remove(this.player);
    scheduler.remove(this.paul);

}

Game._showLose = function() {

    window.removeEventListener('keydown', Game.player);
    Game.engine.lock();

    DISPLAY_HEIGHT = 18;
    DISPLAY_WIDTH = 33;

    while (document.getElementById("thegame").hasChildNodes()) {
        document.getElementById("thegame").removeChild(document.getElementById("thegame").lastChild);
    }  

    Game.display = new ROT.Display({width: DISPLAY_WIDTH, height: DISPLAY_HEIGHT, fontSize: 48});
    //style="border-style: solid; border-width: 3px; border-color:#99f";
    document.getElementById("thegame").appendChild(Game.display.getContainer());

    this.display.clear();

    for (i = 0; i < 30; i++) {
        this.display.draw(Math.floor(ROT.RNG.getUniform() * DISPLAY_WIDTH),Math.floor(ROT.RNG.getUniform() * DISPLAY_HEIGHT),String.fromCharCode(0x2620), "#f00");
    }

    this.display.drawText(1,5, "%c{#f99}Oh no, you been crushed by Paul");
    this.display.drawText(2,7, "%c{#f99}Welp, time to drink some rye!");
    scheduler.remove(this.player);
    scheduler.remove(this.paul);

}

