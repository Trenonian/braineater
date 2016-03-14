let canvas = <HTMLCanvasElement>document.getElementById('myCanvas');
let size = 50;
let width = parseInt(canvas.getAttribute('width'));
let height = parseInt(canvas.getAttribute('height'));
let playing = true;
let player;
let alternate = false;

if (width % size !== 0) {
    width += width % size;
}
if (height % size !==0) {
    height += height % size;
}
canvas.setAttribute('width', width.toString());
canvas.setAttribute('height', height.toString());
width = width / size;
height = height / size;
width--;
height--;
let context = canvas.getContext("2d");
let enemies = [];
let walls = [];
let things = [];
let grid = [];

//interface position {
//    left: number;
//    top: number;
//}


class Thing {
    constructor(public type: string, public img: HTMLImageElement, public left:number, public top:number) { }
}


class Food extends Thing {
    back: ImageData;
    constructor(left: number, top: number) {
        let img = new Image();
        img.src = 'images/food.png';
        super(' food', img, left, top);
        this.back = context.getImageData(this.left * size, this.top * size, size, size);
    }
}

class Wall extends Thing {
    constructor(left: number, top: number) {
        let img = new Image();
        img.src = 'images/wall.png';
        super('xwall', img, left, top);
    }
}

class Mover extends Thing {
    oldLeft:number;
    oldTop: number;
    back: ImageData;
    moved: boolean;
    constructor(type, img, left: number, top: number) {
        super(type, img, left, top);
        this.oldLeft = this.left;
        this.oldTop = this.top;
        this.getBack();
        this.moved = true;
    }
    moveUp() {
        this.top--;
    }
    moveDown() {
        this.top++;
    }
    moveLeft() {
        this.left--;
    }
    moveRight() {
        this.left++;
    }
    getBack() {
        this.back = context.getImageData(this.left * size, this.top * size, size, size);
    }
}

class Enemy extends Mover {
    constructor(left: number, top: number) {
        let img = new Image();
        img.src = 'images/enemy.png';
        super('xenemy', img, left, top);
    }
    getBack() {
        if (this.left === player.left && this.top === player.top) {
            this.back = player.back;
        } else {
            this.back = context.getImageData(this.left * size, this.top * size, size, size);
        }
    }
    attack() {
        
    }
}

class Player extends Mover {
    constructor(left: number, top: number) {
        let img = new Image();
        img.src = 'images/player.png';
        super(' player', img, left, top);
    }
}



let mainloop = function () {
    updateGame();
    drawGame();
};

let animFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    null;

if (animFrame !== null) {
    let canvas = document.getElementById('canvas');

    let recursiveAnim = function () {
        mainloop();
        animFrame(recursiveAnim, canvas);
    };
    initializeGame();
    // start the mainloop
    animFrame(recursiveAnim, canvas);
} else {
    let ONE_FRAME_TIME = 1000.0 / 60.0;
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
    for (let i = 0; i < enemies.length; i++) {
        if (enemies[i].moved) {
            context.putImageData(enemies[i].back, enemies[i].oldLeft * size, enemies[i].oldTop * size);
            context.drawImage(enemies[i].img, enemies[i].left * size, enemies[i].top * size);
            enemies[i].moved = false;
        }
    }
}

function defineWalls() {
    for (let i = 0; i < width; i++) {
        walls.push(new Wall(i,0));
    }
    for (let i = 0; i < height; i++) {
        walls.push(new Wall(width, i));
    }
    for (let i = width; i > 0; i--) {
        walls.push(new Wall(i, height));
    }
    for (let i = height; i > 0; i--) {
        walls.push(new Wall(0, i));
    }

    for (let i = 2; i < width; i += 2) {
        for (let j = 2; j < height; j += 2) {
            walls.push(new Wall(i, j));
        }
    }
    walls.pop();

    things = things.concat(walls);
}

function drawWalls() {
    for (let i = 0; i < walls.length; i++) {
        walls[i].img.onload = function () {
            context.drawImage(walls[i].img, walls[i].left * size, walls[i].top * size);
        }
    }
}

function defineEnemies() {

    //enemies.push(new Enemy(1, height - 1));
    //enemies.push(new Enemy(width-1, height - 1));
    enemies.push(new Enemy(width-1, 1));

    for (let i = 0; i < enemies.length; i++) {
        enemies[i].img.onload = function () {
            context.drawImage(enemies[i].img, enemies[i].left * size, enemies[i].top * size);
        }
    }
    things = things.concat(enemies);
}

function moveEnemies() {
    
    if (playing) {
        for (let i = 0; i < enemies.length; i++) {
            enemies[i].oldLeft = enemies[i].left;
            enemies[i].oldTop = enemies[i].top;
            let difx = player.left - enemies[i].left;
            let dify = player.top - enemies[i].top;

            

            
            //enemies[i].left = Math.floor((Math.random() * (width - 2)) + 1);
            //enemies[i].top = Math.floor((Math.random() * (height - 2)) + 1);

            let valid = validMoves(enemies[i]);
            if (valid.count > 0) {
                enemies[i].moved = true;

                if (Math.abs(difx) > Math.abs(dify)) {

                    if (difx > 0) {
                        if (valid.right) {
                            enemies[i].moveRight();
                        } else {
                            if (dify > 0 && valid.down) {
                                enemies[i].moveDown();
                            } else if (valid.up) {
                                enemies[i].moveUp()
                            } else {
                                enemies[i].moveLeft();
                            }
                        }
                    } else {
                        if (valid.left) {
                            enemies[i].moveLeft();
                        } else {
                            if (dify < 0 && valid.up) {
                                enemies[i].moveUp();
                            } else if (valid.down) {
                                enemies[i].moveDown()
                            } else {
                                enemies[i].moveRight();
                            }
                        }
                    }


                } else {

                    if (dify > 0) {
                        if (valid.down) {
                            enemies[i].moveDown();
                        } else {
                            if (difx > 0 && valid.left) {
                                enemies[i].moveLeft();
                            } else if (valid.right) {
                                enemies[i].moveRight()
                            } else {
                                enemies[i].moveUp();
                            }
                        }
                    } else {
                        if (valid.up) {
                            enemies[i].moveUp();
                        } else {
                            if (difx > 0 && valid.right) {
                                enemies[i].moveRight();
                            } else if (valid.left) {
                                enemies[i].moveLeft()
                            } else {
                                enemies[i].moveDown();
                            }
                        }

                    }

                }
                if (grid[enemies[i].oldLeft][enemies[i].oldTop][0] === ' ') {

                    if(valid.walls = 3) {
                        grid[enemies[i].oldLeft][enemies[i].oldTop] = 'w' + grid[enemies[i].oldLeft][enemies[i].oldTop].slice(1, grid[enemies[i].oldLeft][enemies[i].oldTop].length);
                    } else {
                        grid[enemies[i].oldLeft][enemies[i].oldTop] = ' ' + grid[enemies[i].oldLeft][enemies[i].oldTop].slice(1, grid[enemies[i].oldLeft][enemies[i].oldTop].length);
                    }
                } else {
                    if (valid.walls = 3) {
                        grid[enemies[i].oldLeft][enemies[i].oldTop] = 'w';
                    } else {
                        grid[enemies[i].oldLeft][enemies[i].oldTop] = ' ';
                    }
                }

                console.log(validMoves(enemies[i]));
                console.log(`left: ${player.left - enemies[i].left}, top: ${player.top - enemies[i].top}`);
                console.log(`${enemies[i].type}: |${grid[enemies[i].left][enemies[i].top]}|`);
                console.log(`left: |${grid[enemies[i].left - 1][enemies[i].top]}|`);
                console.log(`top: |${grid[enemies[i].left][enemies[i].top - 1]}|`);
                console.log(`right: |${grid[enemies[i].left + 1][enemies[i].top]}|`);
                console.log(`down: |${grid[enemies[i].left][enemies[i].top + 1]}|`);

                grid[enemies[i].oldLeft][enemies[i].oldTop][0] = ' ';
                grid[enemies[i].left][enemies[i].top] = enemies[i].type;
                enemies[i].getBack();


            } else {
                enemies[i].moved = false;
            }
            if (enemies[i].left === player.left && enemies[i].top === player.top) {
                playing = false;
            }
        }
        
    }
}

function validMoves(thing: Thing) {
    let valid = {
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
    } else {
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
    for (let i = 0; i < width+1; i++) {
        grid[i] = Array(height);
        grid[i].fill(' ');
    }
    for (let i = 0; i < things.length; i++) {
        grid[things[i].left][things[i].top] = things[i].type;
    }
}

function updateGrid() {
    
}

function createPlayer() {
    player = new Player(1, 1);
    player.img.onload = function () {
            context.drawImage(player.img, player.left * size, player.top * size);
        }
    things = things.concat(player);
}



function playerMove(e) {
    if (e.keyCode == 119 || e.keyCode == 115 || e.keyCode == 97 || e.keyCode == 100) {
        player.oldLeft = player.left;
        player.oldTop = player.top;
        let valid = validMoves(player);
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
        grid[player.oldLeft][player.oldTop] = ' ';
        grid[player.left][player.top] = player.type;

        if (alternate) {
            moveEnemies();
            alternate = false;
        } else {
            alternate = true;
        }
    }


    

}