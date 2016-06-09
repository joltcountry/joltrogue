var gameStarted = false;

Game.startGame = function(e) {

    Game._createDisplay();
    Game.generateCave(currentLevel);   

    Game.refresh();
    scheduler = new ROT.Scheduler.Simple();
    scheduler.add(Game.player, true);
    Game.engine = new ROT.Engine(scheduler);
    Game.engine.start();  
    gameStarted = true;
}

Game._showWin = function() {

    window.removeEventListener('keydown', Game.player);
    Game.engine.lock();

    DISPLAY_HEIGHT = 13;
    DISPLAY_WIDTH = 33;

    while (document.getElementById("thegame").hasChildNodes()) {
        document.getElementById("thegame").removeChild(document.getElementById("thegame").lastChild);
    }  
    while (document.getElementById("messages").hasChildNodes()) {
        document.getElementById("messages").removeChild(document.getElementById("messages").lastChild);
        document.getElementById("messages").style.border="";
    }  
    while (document.getElementById("stats").hasChildNodes()) {
        document.getElementById("stats").removeChild(document.getElementById("stats").lastChild);
        document.getElementById("stats").style.border="";
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

    DISPLAY_HEIGHT = 13;
    DISPLAY_WIDTH = 33;

    while (document.getElementById("thegame").hasChildNodes()) {
        document.getElementById("thegame").removeChild(document.getElementById("thegame").lastChild);
    }  
    while (document.getElementById("messages").hasChildNodes()) {
        document.getElementById("messages").removeChild(document.getElementById("messages").lastChild);
        document.getElementById("messages").style.border="";
    }  
    while (document.getElementById("stats").hasChildNodes()) {
        document.getElementById("stats").removeChild(document.getElementById("stats").lastChild);
        document.getElementById("stats").style.border="";
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

