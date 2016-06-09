function extend(ChildClass, ParentClass) {
	ChildClass.prototype = new ParentClass();
	ChildClass.prototype.constructor = ChildClass;
}

// SpatialObject is anything with a map location
SpatialObject = function(x, y) {
	this._x = x;
	this._y = y;
}

SpatialObject.prototype = {
	getX: function() { return this._x; },
	getY: function() { return this._y; }
}

Monster = function(name, x, y, drawChar, drawColor, actFunction) {
	this._name = name;
	this._x = x;
	this._y = y;
	this._drawChar = drawChar;
	this._drawColor = drawColor;
	this._actFunction = actFunction;
}

extend(Monster, SpatialObject);

Monster.prototype.getName = function() { return this._name; }
Monster.prototype.getDrawChar = function() { return this._drawChar; }
Monster.prototype.getDrawColor = function() { return this._drawColor; }
Monster.prototype.getActFunction = function() { return this._actFunction; }

Item = function(type, drawChar, darkChar, drawColor, darkColor) {
	this._type = type;
	this._drawChar = drawChar;
	this._darkChar = darkChar;
	this._drawColor = drawColor;
	this._darkColor = darkColor;
}

Item.prototype.getType = function() { return this._type; }
Item.prototype.getDrawChar = function() { return this._drawChar; }
Item.prototype.getDarkChar = function() { return this._darkChar; }
Item.prototype.getDrawColor = function() { return this._drawColor; }
Item.prototype.getDarkColor = function() { return this._darkColor; }

// A map is made up of a bunch of locations with items up in there
Location = function(x, y, terrain, items) {
	this._x = x;
	this._y = y;
	this._terrain = terrain;
	this._items = items;
	this._monsters = [];
}

extend(Location, SpatialObject);

Location.prototype.getTerrain = function() { return this._terrain; }
Location.prototype.getItems = function() { return this._items; }
Location.prototype.getMonsters = function() { return this._monsters; }
Location.prototype.setTerrain = function(terrain) { this._terrain = terrain; }
Location.prototype.setItems = function(items) { this._items = items; }
Location.prototype.addItem = function(item) { this._items.push(item); }
Location.prototype.addMonster = function(monster) { this._monsters.push(monster); }
Location.prototype.hasItem = function(item) {
	if (!this._items) return false;
	for (var i = 0; i < this._items.length; i++) {
		if (this._items[i] == item) {
			return true;
		}
	}
	return false;
}
Location.prototype.removeItem = function(item) {
	if (!this._items) return false;
	for (var i = 0; i < this._items.length; i++) {
		if (this._items[i] == item) {
			this._items.splice(i, 1);
		}
	}
}

// A Terrain is a type of... terrain in the map.
Terrain = function(type, drawChar, drawColor, darkColor, drawBack, darkBack, blocksLOS, blocksMovement, darkChar) {
	this._type = type;
	this._drawChar = drawChar;
	this._darkChar = darkChar;
	this._drawColor = drawColor;
	this._darkColor = darkColor;
	this._drawBack = drawBack;
	this._darkBack = darkBack;
	this._blocksLOS = blocksLOS;
	this._blocksMovement = blocksMovement;
}

Terrain.prototype.getType = function() { return this._type; }
Terrain.prototype.getDrawChar = function() { return this._drawChar; }
Terrain.prototype.getDarkChar = function() { return this._darkChar; }
Terrain.prototype.getDrawColor = function() { return this._drawColor; }
Terrain.prototype.getDarkColor = function() { return this._darkColor; }
Terrain.prototype.getDrawBack = function() { return this._drawBack; }
Terrain.prototype.getDarkBack = function() { return this._darkBack; }
Terrain.prototype.blocksLOS = function() { return this._blocksLOS; }
Terrain.prototype.blocksMovement = function() { return this._blocksMovement; }

// One level of a dungeon
Level = function(width, height) {
	this._height = height;
	this._width = width;
	this._type = "standard";
	this._map = [];
	this._monsters = [];
	this._special = {};
	this.seen = [];
}

Level.prototype.getHeight = function() { return this._height; }
Level.prototype.getWidth = function() { return this._width; }
Level.prototype.getType = function() { return this._type; }
Level.prototype.getMap= function() { return this._map; }
Level.prototype.getSpecial = function() { return this._special; }
Level.prototype.getLoc = function(x, y) { return this._map[x] ? this._map[x][y] : null; }
Level.prototype.setLoc = function(x, y, loc) {
	if (!this._map[x]) {
		this._map[x] = [];
	}
	this._map[x][y] = loc;
}

test = function() {
}