const MAP_HEIGHT=60;
const MAP_WIDTH=120;
const MESSAGE_HEIGHT=10;
const TOTAL_HEIGHT = MAP_HEIGHT;
const TOTAL_WIDTH = MAP_WIDTH;

const COLOR_INFO = "#99f";
const COLOR_WARN = "#f66";
const COLOR_HAPPY = "#6f6";


//TERRAINS
const TERRAIN_FLOOR = new Terrain("floor", ".", "5", "#333", false, false);
const TERRAIN_WALL = new Terrain("wall", "#", "3", "#333", true, true);
const TERRAIN_DOOR = new Terrain("door", "+", "4", "#333", true, false);
const TERRAIN_OUTSIDE = new Terrain("outside", " ", "7", "#333", true, true);

const ITEM_PRIZE = new Item("prize", "%", "2", "#0f0", "#060");
