var gameStarted = false;

Game.startGame = function(e) {

    Game._createDisplay();
    Game.level[currentLevel] = Maps.generateDungeon(currentLevel);   

    Game.refresh();
    scheduler = new ROT.Scheduler.Simple();
    scheduler.add(Game.player, true);
    Game.engine = new ROT.Engine(scheduler);
    Game.engine.start();  
    gameStarted = true;
}

