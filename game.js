const canvas = document.querySelector('#game');
const game = canvas.getContext('2d'); //context
const btnUp = document.querySelector('#up');
const btnDown = document.querySelector('#down');
const btnRight = document.querySelector('#right');
const btnLeft = document.querySelector('#left');
const spanLives = document.querySelector('#lives');
const spanTime = document.querySelector('#time')
const spanRecord = document.querySelector('#record')
const pResult = document.querySelector('#result')
let canvasSize;
let elementsSize;
let level = 0;
let lives = 3;
let timeStart;
let timePlayer;
let timeInterval;
let oldElementZise;

const playerPosition = {
  x: undefined,
  y: undefined,
};
const playerPositionLast = {
  x: undefined,
  y: undefined,
};

const giftPosition = {
  x: undefined,
  y: undefined,
};

let enemyPositions = [];
let flag = true;

window.addEventListener('load', setCanvasSize);
// window.addEventListener("resize", startGame);
window.onresize = setCanvasSize;

function setCanvasSize() {
  // let canvasSize = Math.min(window.innerHeight, window.innerWidth)*0.65;
  if (window.innerHeight > window.innerWidth) {
    canvasSize = window.innerWidth * 0.75;
  } else {
    canvasSize = window.innerHeight * 0.7;
  }
  // canvasSize = Number(canvasSize.toFixed(0));
  canvas.setAttribute("width", canvasSize);
  canvas.setAttribute("height", canvasSize);
  // oldElementZise = elementsSize;
  elementsSize = (canvasSize / 10);

  // if (playerPosition.x != undefined && playerPosition.y != undefined) {
  //   cambioTamañoJugador(elementsSize,oldElementZise);
  // }
  playerPosition.x = undefined;
  playerPosition.y = undefined;
  startGame();
}
// function cambioTamañoJugador(nuevaEscala, antiguaEscala) {
//   playerPosition.x = playerPosition.x * ((nuevaEscala / antiguaEscala));
//   playerPosition.y = playerPosition.y * ((nuevaEscala / antiguaEscala));
// }

function startGame() {
  // console.log({ canvasSize, elementsSize });
  game.font = (elementsSize-9) + 'px Verdana';  
  game.textAlign = 'end';

  const map = maps[level];

  if (!map) {
    gameWin();
    return;
  }

  if (!timeStart) {
    timeStart = Date.now();
    timeInterval = setInterval(showTime, 100);
    showRecord();
  }

  const mapRows = map.trim().split('\n');
  const mapRowsCol = mapRows.map(row => row.trim().split(''))
  // console.log({map, mapRows, mapRowsCol});
  showLives();

  enemyPositions = [];
  game.clearRect(0, 0, canvasSize, canvasSize);

  mapRowsCol.forEach((row, rowI) => {
    row.forEach((col, colI) => {
      const emoji = emojis[col];
      const posX = elementsSize * (colI + 1) ;
      const posY = elementsSize * (rowI + 1)-10;
      
      if (col == "O") {
        if (!playerPosition.x && !playerPosition.y) {
          playerPosition.x = posX;
          playerPosition.y = posY;
          // console.log({ playerPosition });
        }
      } else if (col == "I") {
        giftPosition.x = posX;
        giftPosition.y = posY;
        // console.log({ playerPosition, giftPosition }); 
      }
      else if (col == 'X' && flag) {
        enemyPositions.push({ x: posX, y: posY })
        // console.log({enemyPositions})
      }
      game.fillText(emoji, posX, posY);
      // console.log({row, rowI, col, colI});
    })
  });
  
  // for (let row = 1; row <= 10; row++) {
    //   for (let col = 0; col <= 10; col++) {
      //     game.fillText(emojis[mapRowsCol[row-1][col-1]], elementsSize*col, elementsSize*row-10);
      //   }
      // }
  movePlayer();
}
    // flag = false;
function movePlayer() {
  const giftCollisionX = playerPosition.x.toFixed(3) == giftPosition.x.toFixed(3);
  const giftCollisionY = playerPosition.y.toFixed(3) == giftPosition.y.toFixed(3);
  const giftCollision = giftCollisionX && giftCollisionY;

  const enemyCollision = enemyPositions.find(enemy => {
    const enemyCollisionX = enemy.x.toFixed(3) == playerPosition.x.toFixed(3);
    const enemyCollisionY = enemy.y.toFixed(3) == playerPosition.y.toFixed(3);
    return enemyCollisionX && enemyCollisionY;
  })

  if (giftCollision) {
    levelWin();
  }
  if (enemyCollision) {
    levelFail();
  }

  game.fillText(emojis['PLAYER'], playerPosition.x, playerPosition.y);
}

function levelWin() {
  console.log('Subiste de nivel');
  level++;
  startGame();
};

function levelFail() {
  console.log("Perdiste");
  lives--;

  console.log('lives: '+lives)
  if (lives <= 0) {
    level = 0;
    lives = 3;
    timeStart = undefined;
  }
  playerPosition.x = undefined;
  playerPosition.y = undefined;
  startGame();
}

function gameWin() {
  console.log('Terminaste el juego')
  clearInterval(timeInterval);
  setResult();
}

function setResult() {
  const recordTime = localStorage.getItem("record");
  const playerTime = (Date.now() - timeStart) / 1000;
  if (recordTime) {
    if (recordTime > playerTime) {
      localStorage.setItem("record", playerTime);
      pResult.innerHTML = "Superaste el record";
    } else {
      pResult.innerHTML = "No superaste el record";
    }
  } else {
    localStorage.setItem("record", playerTime);
    pResult.innerHTML = "primera vez";
  }
  console.log({ recordTime, playerTime });
}

function showLives() {
  const heartsArray = Array(lives).fill(emojis['HEART']) // [1,2,3]
  // console.log(heartsArray);
  // spanLives.innerHTML = heartsArray.join('');
  spanLives.innerHTML = emojis['HEART'].repeat(lives);
  // heartsArray.forEach(heart => spanLives.append(heart));
}

function showTime() {
  spanTime.innerHTML = (Date.now() - timeStart)/1000;
}

function showRecord() {
  spanRecord.innerHTML = localStorage.getItem('record')
}

window.addEventListener('keydown', moveKeys);
btnUp.addEventListener('click', moveUp);
btnRight.addEventListener('click', moveRight);
btnLeft.addEventListener('click', moveLeft);
btnDown.addEventListener('click', moveDown);

function moveKeys(event) {
  if (event.key == 'ArrowUp')moveUp();
   else if (event.key == 'ArrowRight')moveRight();
   else if (event.key == 'ArrowLeft')moveLeft();
   else if (event.key == 'ArrowDown')moveDown();
}

function moveUp() {
  if (playerPosition.y > elementsSize) {
    console.log('Arriba');
    playerPosition.y -= elementsSize;
    startGame();
  } else console.log('Out');
}
function moveRight() {
  if (playerPosition.x < canvasSize - 10) {
    console.log("dERECHA");
    playerPosition.x += elementsSize;
    // console.log(ele)
  } else console.log("Out");
  startGame();
}
function moveLeft() {
  if (playerPosition.x > elementsSize + 1) {
    console.log("Izquierda");
    playerPosition.x -= elementsSize;
  } else console.log("Out");
  startGame();
}
function moveDown() {
  if (playerPosition.y < canvasSize - elementsSize) {
    console.log("Abajo");
    playerPosition.y += elementsSize;
  } else console.log("Out");
  startGame();
}

  // game.fillRect(0, 0, 100, 100);
  // game.clearRect(0, 0, 50, 100);
  // // game.clearRect(0, 0, 0, 0);
  // game.font = '25px Verdana';
  // game.fillStyle = 'purple';
  // game.textAlign = 'start';
  // game.fillText('Platzi', 15, 25)