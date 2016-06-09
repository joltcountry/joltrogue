const MAP_HEIGHT=60;
const MAP_WIDTH=120;
const MESSAGE_HEIGHT=10;
const TOTAL_HEIGHT = MAP_HEIGHT;
const TOTAL_WIDTH = MAP_WIDTH;

const COLOR_INFO = "#99f";
const COLOR_WARN = "#f66";
const COLOR_HAPPY = "#6f6";


//TERRAINS
const TERRAIN_FLOOR = new Terrain("floor", " ", "#666", "#222", "#222", "#112", null, false, false, "5");
const TERRAIN_WALL = new Terrain("wall", "^", "#fff", "#334", "#339", "#112", true, true, "3");
const TERRAIN_DOOR = new Terrain("door", "+", "#c93", "#333", "#000", "#000", true, false, "4");
const TERRAIN_OUTSIDE = new Terrain("outside", " ", "", "#333", "#00f", "#000", true, true, "7");
const TERRAIN_DOWNSTAIRS = new Terrain("downstairs", ">", "#6f6", "#242", "#222", "#112", false, false, "8");
const TERRAIN_UPSTAIRS = new Terrain("upstairs", "<", "#66f", "#224", "#222", "#112", false, false, "9");

const ITEM_PRIZE = new Item("prize", "%", "2", "#0f0", "#060");
const NUM_PRIZES = 20;