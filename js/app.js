/**
 * Created by Hamzah on 11/20/2015.
 */


//Variables that keep track of the state of the game.
var canvas;
var stage;
var score;
var bg;
var txt;
var play;
var targetBmpList;
var targetBitmap;
var dangerBitmap;
var player;

//function to call when the game is loaded.
function init() {
    //Set the canvas to the id in the body tag.
    canvas = document.getElementById('game-canvas');

    //Set a stage to hold all of our objects for the game.
    stage = new createjs.Stage(canvas);
    score = 0;

    //Set a background for the game, pulls an image for the img folder.
    bg = new Image();
    bg.src = "img/bg.png";
    bg.onload = setBg;

    //Load all of the game images.
    var yarn = new Image();
    yarn.src = 'img/yarn.png';
    yarn.onload = createYarn;

    var vacuum = new Image();
    vacuum.src = 'img/vacuum.png';
    vacuum.onload = createVacuum;

    var kitty = new Image();
    kitty.src = 'img/kitty.png';
    kitty.onload = catPlayer;

    //Event listeners for moving the character.
    document.addEventListener("keydown", keyDownHandler, false);

    document.addEventListener("keyup", keyUpHandler, false);
}

//initialize the character the player controls.
function catPlayer() {
    var image = event.target;
    player = new createjs.Bitmap(image);
    stage.addChild(player);
    player.x = 375;
    player.y = 300;
    createjs.Ticker.addEventListener("tick", handleTick);
    play = true;
}

//handle events when the user presses a key
function keyDownHandler(evt) {
    var keyPressed = String.fromCharCode(evt.keyCode);

    //Uses WASD to move left and right, since the player can only move left and right, only A and D are used.
    if (keyPressed == "A") {
        player.x -= 15;
    } else if (keyPressed == "D") {
        player.x += 15;
    }
}

//handle events when the user lifts from pressing a key.
function keyUpHandler(evt) {
    var keyPressed = String.fromCharCode(evt.keyCode);
    if (keyPressed == "A" || keyPressed == "D") {

    }
}

function distance(tx, ty, px, py) {
    return Math.sqrt(((px  - tx) * (px - tx)) + ((py - ty) * (py - ty)));
}

function collision(target, player) {
    return distance(target.x, target.y, player.x, player.y) <= 50;
}
//Create the dangers in a random place for the player to avoid.
function createVacuum(event) {
    var image = event.target;
    dangerBitmap = new createjs.Bitmap(image);
    stage.addChild(dangerBitmap);
    dangerBitmap.name = "vacuum";
    resetVacuum(dangerBitmap)
}

//Create the targets in random places for the player to score points.
function createYarn(event) {
    //event.target is called by .src when we made our images.
    var image = event.target;
    var container = new createjs.Container();
    stage.addChild(container);
    var l = 3;
    targetBmpList = [];
    for (var i = 0; i < l; i++) {
        //a bitmap is required to put images onto the stage.
        targetBitmap = new createjs.Bitmap(image);
        container.addChild(targetBitmap);
        targetBitmap.name = 'yarn' + i;
        resetYarn(targetBitmap);
        targetBmpList.push(targetBitmap);
    }
    txt = new createjs.Text("Score: 0", "24px Helvetica Neue", "#000");
    txt.textBaseline = 'top';
    txt.x = 600;
    stage.addChild(txt);

    createjs.Ticker.addEventListener("tick", handleTick);
    play = true;
}

//Reset the dangers randomly the player needs to avoid to not lose the game.
function resetVacuum(vacuum) {
    vacuum.x = canvas.width * Math.random();
    vacuum.y = Math.random() - 50;
    vacuum.speed = Math.random();
}

//Reset the targets randomly the player needs to score points.
function resetYarn(yarn) {
    yarn.x = canvas.width * Math.random();
    yarn.y = Math.random() - canvas.height;
    yarn.speed = Math.random();
}

//Similar to step. Called on each tick or frame. Updates the stage every frame.
function handleTick(event) {
    if (!event.paused && play) {
        var l = targetBmpList.length;
        for (var i = 0; i < l; i++) {
            var bmp = targetBmpList[i];
            //Handle collisions between the player and the target/danger.
            if (collision(player, targetBmpList[i])) {
                score += 10;
                resetYarn(targetBmpList[i]);
            } else if (collision(player, dangerBitmap)) {
                gameOver(); //Gameover if the player collides with the vacuum.
            } else if (bmp.y < 450) {
                bmp.y += 5 + bmp.speed * 20; //Code to make yarn fall
            } else if (bmp.y >= 450) {
                resetYarn(targetBmpList[i]); //Continually reset yarns to keep falling once they reach the bottom of the screen.
            }
        }
        //Continually reset vacuums to keep falling once they reach the bottom of the screen.
        if (dangerBitmap.y < 450) {
            dangerBitmap.y += 5 + dangerBitmap.speed * 15;
        } else if (dangerBitmap.y > 450) {
            resetVacuum(dangerBitmap);
        }
    }
    txt.text = "Score: " + score;
    stage.addChild(txt);
    stage.update();
}

//function that sets the background
function setBg(event) {
    var background = new createjs.Bitmap(bg);
    //addChild adds objects to the stage.
    stage.addChild(background);
    //must update the stage for objects to show up.
    stage.update();
}

//When the user loses displays game over message and play again message.
function gameOver() {
    //remove all images except background when the game is over.
    stage.removeAllChildren();
    setBg();
    var gameOver = new createjs.Text("Game Over", "36px Helvetica", "#000");
    gameOver.x = canvas.width / 2 - 50;
    gameOver.y = canvas.height / 2 - 50;
    var playAgain = new createjs.Text("Click to play again", "24px Helvetica", "#000");
    playAgain.x = canvas.width / 2 - 50;
    playAgain.y = canvas.height / 2;
    stage.addChild(gameOver);
    stage.addChild(playAgain);
    play = false;
    //User can click to play again.
    canvas.addEventListener('click', function() {
        canvas.onclick = null;
        play = true;
        stage.removeChild(gameOver);
        stage.removeChild(playAgain);
        init();
    });
}


