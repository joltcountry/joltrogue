const MAP_HEIGHT=90;
const MAP_WIDTH=120;
const MIN_HEIGHT=30;
const MIN_WIDTH=40;
const MESSAGE_HEIGHT=10;
const TOTAL_HEIGHT = MAP_HEIGHT;
const TOTAL_WIDTH = MAP_WIDTH;

const COLOR_INFO = "#99f";
const COLOR_WARN = "#f66";
const COLOR_HAPPY = "#6f6";

const NUM_LEVELS = 100;

const DEFAULT_ICEFLOOR = "#122";
const DEFAULT_ICEDARK = "#011"
const DEFAULT_FLOOR = "#222";
const DEFAULT_DARK = "#000"
//TERRAINS
const TERRAIN_FLOOR = new Terrain("floor", ".", "#999", "#333", DEFAULT_FLOOR, null, null, false, false, "5");
const TERRAIN_WALL = new Terrain("wall", "#", "#ccc", "#666", DEFAULT_FLOOR, null, true, true, "3");
const TERRAIN_ICEFLOOR = new Terrain("floor", " ", "#666", DEFAULT_ICEFLOOR, DEFAULT_ICEFLOOR, DEFAULT_ICEDARK, null, false, false, "5");
const TERRAIN_ICEWALL = new Terrain("wall", "*", "#fff", "#334", "#337", "#112", true, true, "3");
const TERRAIN_DOOR = new Terrain("door", "+", "#c93", "#333", DEFAULT_FLOOR, "#000", true, false, "4");
const TERRAIN_OUTSIDE = new Terrain("outside", " ", "", "#333", "#00f", "#000", true, true, "7");
const TERRAIN_ICEDOWNSTAIRS = new Terrain("downstairs", ">", "#6f6", "#363", DEFAULT_ICEFLOOR, DEFAULT_ICEDARK, false, false, "8");
const TERRAIN_ICEUPSTAIRS = new Terrain("upstairs", "<", "#6f6", "#363", DEFAULT_ICEFLOOR, DEFAULT_ICEDARK, false, false, "9");
const TERRAIN_DOWNSTAIRS = new Terrain("downstairs", ">", "#6f6", "#363", DEFAULT_FLOOR, null, false, false, "8");
const TERRAIN_UPSTAIRS = new Terrain("upstairs", "<", "#6f6", "#363", DEFAULT_FLOOR, null, false, false, "9");

const ITEM_PRIZE = new Item("prize", "%", "2", "#0f0", "#060");
const NUM_PRIZES = 20;