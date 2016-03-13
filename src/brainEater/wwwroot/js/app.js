var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var canvas = document.getElementById('myCanvas');
var size = 50;
var width = parseInt(canvas.getAttribute('width'));
var height = parseInt(canvas.getAttribute('height'));
var playing = true;
var player;
var alternate = false;
if (width % size !== 0) {
    width += width % size;
}
if (height % size !== 0) {
    height += height % size;
}
canvas.setAttribute('width', width.toString());
canvas.setAttribute('height', height.toString());
width = width / size;
height = height / size;
width--;
height--;
var context = canvas.getContext("2d");
var enemies = [];
var walls = [];
var things = [];
var grid = [];
//interface position {
//    left: number;
//    top: number;
//}
var Thing = (function () {
    function Thing(type, img, left, top) {
        this.type = type;
        this.img = img;
        this.left = left;
        this.top = top;
    }
    return Thing;
}());
var Food = (function (_super) {
    __extends(Food, _super);
    function Food(left, top) {
        var img = new Image();
        img.src = 'images/food.png';
        _super.call(this, ' food', img, left, top);
        this.back = context.getImageData(this.left * size, this.top * size, size, size);
    }
    return Food;
}(Thing));
var Wall = (function (_super) {
    __extends(Wall, _super);
    function Wall(left, top) {
        var img = new Image();
        img.src = 'images/wall.png';
        _super.call(this, 'xwall', img, left, top);
    }
    return Wall;
}(Thing));
var Mover = (function (_super) {
    __extends(Mover, _super);
    function Mover(type, img, left, top) {
        _super.call(this, type, img, left, top);
        this.oldLeft = this.left;
        this.oldTop = this.top;
        this.getBack();
        this.moved = true;
    }
    Mover.prototype.moveUp = function () {
        this.top--;
    };
    Mover.prototype.moveDown = function () {
        this.top++;
    };
    Mover.prototype.moveLeft = function () {
        this.left--;
    };
    Mover.prototype.moveRight = function () {
        this.left++;
    };
    Mover.prototype.getBack = function () {
        this.back = context.getImageData(this.left * size, this.top * size, size, size);
    };
    return Mover;
}(Thing));
var Enemy = (function (_super) {
    __extends(Enemy, _super);
    function Enemy(left, top) {
        var img = new Image();
        img.src = 'images/enemy.png';
        _super.call(this, 'xenemy', img, left, top);
    }
    Enemy.prototype.getBack = function () {
        if (this.left === player.left && this.top === player.top) {
            this.back = player.back;
        }
        else {
            this.back = context.getImageData(this.left * size, this.top * size, size, size);
        }
    };
    Enemy.prototype.attack = function () {
    };
    return Enemy;
}(Mover));
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(left, top) {
        var img = new Image();
        img.src = 'images/player.png';
        _super.call(this, ' player', img, left, top);
    }
    return Player;
}(Mover));
var mainloop = function () {
    updateGame();
    drawGame();
};
var animFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    null;
if (animFrame !== null) {
    var canvas_1 = document.getElementById('canvas');
    var recursiveAnim_1 = function () {
        mainloop();
        animFrame(recursiveAnim_1, canvas_1);
    };
    initializeGame();
    // start the mainloop
    animFrame(recursiveAnim_1, canvas_1);
}
else {
    var ONE_FRAME_TIME = 1000.0 / 60.0;
    initializeGame();
    setInterval(mainloop, ONE_FRAME_TIME);
}
function initializeGame() {
    context.fillStyle = "#09a";
    context.fillRect(0, 0, width * size, height * size);
    createPlayer();
    defineEnemies();
    defineWalls();
    drawWalls();
    initializeGrid();
    window.addEventListener('keypress', playerMove);
}
function updateGame() {
    // see moveEnemies();
}
function drawGame() {
    if (player.moved) {
        context.putImageData(player.back, player.oldLeft * size, player.oldTop * size);
        context.drawImage(player.img, player.left * size, player.top * size);
        player.moved = false;
    }
    for (var i = 0; i < enemies.length; i++) {
        if (enemies[i].moved) {
            context.putImageData(enemies[i].back, enemies[i].oldLeft * size, enemies[i].oldTop * size);
            context.drawImage(enemies[i].img, enemies[i].left * size, enemies[i].top * size);
            enemies[i].moved = false;
        }
    }
}
function defineWalls() {
    for (var i = 0; i < width; i++) {
        walls.push(new Wall(i, 0));
    }
    for (var i = 0; i < height; i++) {
        walls.push(new Wall(width, i));
    }
    for (var i = width; i > 0; i--) {
        walls.push(new Wall(i, height));
    }
    for (var i = height; i > 0; i--) {
        walls.push(new Wall(0, i));
    }
    for (var i = 2; i < width; i += 2) {
        for (var j = 2; j < height; j += 2) {
            walls.push(new Wall(i, j));
        }
    }
    walls.pop();
    things = things.concat(walls);
}
function drawWalls() {
    var _loop_1 = function(i) {
        walls[i].img.onload = function () {
            context.drawImage(walls[i].img, walls[i].left * size, walls[i].top * size);
        };
    };
    for (var i = 0; i < walls.length; i++) {
        _loop_1(i);
    }
}
function defineEnemies() {
    enemies.push(new Enemy(1, height - 1));
    enemies.push(new Enemy(width - 1, height - 1));
    enemies.push(new Enemy(width - 1, 1));
    var _loop_2 = function(i) {
        enemies[i].img.onload = function () {
            context.drawImage(enemies[i].img, enemies[i].left * size, enemies[i].top * size);
        };
    };
    for (var i = 0; i < enemies.length; i++) {
        _loop_2(i);
    }
    things = things.concat(enemies);
}
function moveEnemies() {
    if (playing) {
        for (var i = 0; i < enemies.length; i++) {
            enemies[i].oldLeft = enemies[i].left;
            enemies[i].oldTop = enemies[i].top;
            var difx = player.left - enemies[i].left;
            var dify = player.top - enemies[i].top;
            //enemies[i].left = Math.floor((Math.random() * (width - 2)) + 1);
            //enemies[i].top = Math.floor((Math.random() * (height - 2)) + 1);
            var valid = validMoves(enemies[i]);
            if (valid.count > 0) {
                enemies[i].moved = true;
                if (Math.abs(difx) > Math.abs(dify)) {
                    if (difx > 0) {
                        if (valid.right) {
                            enemies[i].moveRight();
                        }
                        else {
                            if (dify > 0 && valid.down) {
                                enemies[i].moveDown();
                            }
                            else if (valid.up) {
                                enemies[i].moveUp();
                            }
                            else {
                                enemies[i].moveLeft();
                            }
                        }
                    }
                    else {
                        if (valid.left) {
                            enemies[i].moveLeft();
                        }
                        else {
                            if (dify < 0 && valid.up) {
                                enemies[i].moveUp();
                            }
                            else if (valid.down) {
                                enemies[i].moveDown();
                            }
                            else {
                                enemies[i].moveRight();
                            }
                        }
                    }
                }
                else {
                    if (dify > 0) {
                        if (valid.down) {
                            enemies[i].moveDown();
                        }
                        else {
                            if (difx > 0 && valid.left) {
                                enemies[i].moveLeft();
                            }
                            else if (valid.right) {
                                enemies[i].moveRight();
                            }
                            else {
                                enemies[i].moveUp();
                            }
                        }
                    }
                    else {
                        if (valid.up) {
                            enemies[i].moveUp();
                        }
                        else {
                            if (difx > 0 && valid.right) {
                                enemies[i].moveRight();
                            }
                            else if (valid.left) {
                                enemies[i].moveLeft();
                            }
                            else {
                                enemies[i].moveDown();
                            }
                        }
                    }
                }
                if (valid.walls = 3) {
                    grid[enemies[i].oldLeft][enemies[i].oldTop][0] = 'w';
                }
                else {
                    grid[enemies[i].oldLeft][enemies[i].oldTop][0] = ' ';
                }
                grid[enemies[i].oldLeft][enemies[i].oldTop][0] = ' ';
                grid[enemies[i].left][enemies[i].top] = enemies[i].type;
            }
            else {
                enemies[i].moved = false;
            }
            enemies[i].getBack();
            if (enemies[i].left === player.left && enemies[i].top === player.top) {
                playing = false;
            }
        }
    }
}
function validMoves(thing) {
    var valid = {
        left: true,
        up: true,
        right: true,
        down: true,
        count: 4,
        walls: 0
    };
    if (thing.type === ' player') {
        if (grid[thing.left - 1][thing.top][0] === 'x') {
            valid.left = false;
            valid.count--;
            if (grid[thing.left - 1][thing.top] === 'xwall') {
                valid.walls++;
            }
        }
        if (grid[thing.left][thing.top - 1][0] === 'x') {
            valid.up = false;
            valid.count--;
            if (grid[thing.left - 1][thing.top] === 'xwall') {
                valid.walls++;
            }
        }
        if (grid[thing.left + 1][thing.top][0] === 'x') {
            valid.right = false;
            valid.count--;
            if (grid[thing.left - 1][thing.top] === 'xwall') {
                valid.walls++;
            }
        }
        if (grid[thing.left][thing.top + 1][0] === 'x') {
            valid.down = false;
            valid.count--;
            if (grid[thing.left - 1][thing.top] === 'xwall') {
                valid.walls++;
            }
        }
    }
    else {
        if (grid[thing.left - 1][thing.top][0] === 'x' || grid[thing.left - 1][thing.top][0] === 'w') {
            valid.left = false;
            valid.count--;
            if (grid[thing.left - 1][thing.top] === 'xwall') {
                valid.walls++;
            }
        }
        if (grid[thing.left][thing.top - 1][0] === 'x' || grid[thing.left - 1][thing.top][0] === 'w') {
            valid.up = false;
            valid.count--;
            if (grid[thing.left - 1][thing.top] === 'xwall') {
                valid.walls++;
            }
        }
        if (grid[thing.left + 1][thing.top][0] === 'x' || grid[thing.left + 1][thing.top][0] === 'w') {
            valid.right = false;
            valid.count--;
            if (grid[thing.left - 1][thing.top] === 'xwall') {
                valid.walls++;
            }
        }
        if (grid[thing.left][thing.top + 1][0] === 'x' || grid[thing.left][thing.top + 1][0] === 'w') {
            valid.down = false;
            valid.count--;
            if (grid[thing.left - 1][thing.top] === 'xwall') {
                valid.walls++;
            }
        }
    }
    return valid;
}
function initializeGrid() {
    grid = Array(width);
    for (var i = 0; i < width + 1; i++) {
        grid[i] = Array(height);
        grid[i].fill(' ');
    }
    for (var i = 0; i < things.length; i++) {
        grid[things[i].left][things[i].top] = things[i].type;
    }
}
function updateGrid() {
}
function createPlayer() {
    player = new Player(1, 1);
    player.img.onload = function () {
        context.drawImage(player.img, player.left * size, player.top * size);
    };
    things = things.concat(player);
}
function playerMove(e) {
    console.log(e.keyCode);
    if (e.keyCode == 119 || e.keyCode == 115 || e.keyCode == 97 || e.keyCode == 100) {
        player.oldLeft = player.left;
        player.oldTop = player.top;
        var valid = validMoves(player);
        player.moved = false;
        if (e.keyCode == 119 && valid.up) {
            player.moved = true;
            player.moveUp();
        }
        if (e.keyCode == 115 && valid.down) {
            player.moved = true;
            player.moveDown();
        }
        if (e.keyCode == 100 && valid.right) {
            player.moved = true;
            player.moveRight();
        }
        if (e.keyCode == 97 && valid.left) {
            player.moved = true;
            player.moveLeft();
        }
        grid[player.oldLeft][player.oldTop][0] = ' ';
        grid[player.left][player.top] = player.type;
        if (alternate) {
            moveEnemies();
            alternate = false;
        }
        else {
            alternate = true;
        }
    }
}
