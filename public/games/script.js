let currentGame = null;
let score = 0;
const gameContainer = document.getElementById('gameContainer');
const gameModal = document.getElementById('gameModal');
const gameTitle = document.getElementById('gameTitle');
const gameScore = document.getElementById('gameScore');
const restartBtn = document.getElementById('restartBtn');
const backBtn = document.getElementById('backBtn');
const fullScreenBtn = document.getElementById('fullScreenBtn');
const modalContent = document.querySelector('.modal-content');

backBtn.onclick = () => {
    // Communicate back to the parent React app
    window.parent.postMessage({ type: 'CLOSE_GAMES' }, '*');
};

fullScreenBtn.onclick = () => {
    toggleFullScreen();
};

function toggleFullScreen() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        const elem = gameModal;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { /* Safari */
            elem.webkitRequestFullscreen();
        } else {
            // Fallback for older iOS
            modalContent.classList.add('is-fullscreen');
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else {
            modalContent.classList.remove('is-fullscreen');
        }
    }
}

// Listen for fullscreen changes to update UI or handle escape key
document.addEventListener('fullscreenchange', handleFullScreenChange);
document.addEventListener('webkitfullscreenchange', handleFullScreenChange);

function handleFullScreenChange() {
    const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement);
    if (!isFS) {
        modalContent.classList.remove('is-fullscreen');
    }
}

function startGame(gameType) {
    gameModal.style.display = 'flex';
    gameContainer.innerHTML = '';
    score = 0;
    gameScore.style.display = 'block';
    updateScore();
    
    if (gameType === 'snake') {
        initSnake();
    } else if (gameType === 'tictactoe') {
        initTicTacToe();
    } else if (gameType === 'escaperoad') {
        initEscapeRoad();
    }
}

function closeGame() {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
    gameModal.style.display = 'none';
    if (currentGame && currentGame.stop) currentGame.stop();
    currentGame = null;
    gameContainer.innerHTML = '';
    modalContent.classList.remove('is-fullscreen');
}

function updateScore() {
    gameScore.innerText = `SCORE: ${score}`;
}

// --- ESCAPE ROAD ---
function initEscapeRoad() {
    gameTitle.innerText = 'ESCAPE_ROAD';
    gameScore.style.display = 'none';
    
    const iframe = document.createElement('iframe');
    iframe.src = 'escape-road.html';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.background = '#000';
    iframe.allowFullscreen = true;
    gameContainer.appendChild(iframe);
    
    restartBtn.onclick = () => {
        iframe.src = iframe.src;
    };

    currentGame = {
        stop: () => {
            gameContainer.innerHTML = '';
        }
    };
}

// --- SNAKE GAME ---
function initSnake() {
    gameTitle.innerText = 'NEON_SNAKE';
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    gameContainer.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    
    let snake = [{x: 10, y: 10}];
    let food = {x: 15, y: 15};
    let dx = 0;
    let dy = 0;
    let nextDx = 0;
    let nextDy = 0;
    
    function draw() {
        // Background
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Food
        ctx.fillStyle = '#ff0041';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff0041';
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
        
        // Snake
        ctx.fillStyle = '#00ff41';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ff41';
        snake.forEach((part, index) => {
            ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
        });
        ctx.shadowBlur = 0;
    }
    
    function move() {
        dx = nextDx;
        dy = nextDy;
        
        const head = {x: snake[0].x + dx, y: snake[0].y + dy};
        
        // Wall collision
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            return gameOver();
        }
        
        // Self collision
        if (snake.some(part => part.x === head.x && part.y === head.y)) {
            return gameOver();
        }
        
        snake.unshift(head);
        
        // Food collision
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            updateScore();
            spawnFood();
        } else {
            if (dx !== 0 || dy !== 0) snake.pop();
        }
    }
    
    function spawnFood() {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        // Ensure food doesn't spawn on snake
        if (snake.some(part => part.x === food.x && part.y === food.y)) {
            spawnFood();
        }
    }
    
    function gameOver() {
        alert('GAME OVER! SCORE: ' + score);
        initSnake();
    }
    
    const interval = setInterval(() => {
        move();
        draw();
    }, 100);
    
    const handleKey = (e) => {
        if (e.key === 'ArrowUp' && dy === 0) { nextDx = 0; nextDy = -1; }
        if (e.key === 'ArrowDown' && dy === 0) { nextDx = 0; nextDy = 1; }
        if (e.key === 'ArrowLeft' && dx === 0) { nextDx = -1; nextDy = 0; }
        if (e.key === 'ArrowRight' && dx === 0) { nextDx = 1; nextDy = 0; }
    };
    
    window.addEventListener('keydown', handleKey);
    
    currentGame = {
        stop: () => {
            clearInterval(interval);
            window.removeEventListener('keydown', handleKey);
        }
    };
    
    restartBtn.onclick = () => {
        closeGame();
        startGame('snake');
    };
}

// --- TIC TAC TOE ---
function initTicTacToe() {
    gameTitle.innerText = 'VOID_TIC_TAC_TOE';
    const grid = document.createElement('div');
    grid.className = 'ttt-grid';
    gameContainer.appendChild(grid);
    
    let board = Array(9).fill(null);
    let gameActive = true;
    
    function createBoard() {
        grid.innerHTML = '';
        board.forEach((cell, i) => {
            const div = document.createElement('div');
            div.className = 'ttt-cell';
            div.innerText = cell || '';
            div.onclick = () => makeMove(i);
            grid.appendChild(div);
        });
    }
    
    function makeMove(i) {
        if (!gameActive || board[i]) return;
        
        board[i] = 'X';
        createBoard();
        
        if (checkWin('X')) return endGame('YOU_WIN');
        if (board.every(c => c)) return endGame('DRAW');
        
        setTimeout(aiMove, 500);
    }
    
    function aiMove() {
        const empty = board.map((c, i) => c === null ? i : null).filter(c => c !== null);
        if (empty.length === 0) return;
        
        const move = empty[Math.floor(Math.random() * empty.length)];
        board[move] = 'O';
        createBoard();
        
        if (checkWin('O')) return endGame('VOID_WINS');
        if (board.every(c => c)) return endGame('DRAW');
    }
    
    function checkWin(p) {
        const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        return wins.some(w => w.every(i => board[i] === p));
    }
    
    function endGame(msg) {
        gameActive = false;
        alert(msg);
        initTicTacToe();
    }
    
    createBoard();
    
    restartBtn.onclick = () => {
        closeGame();
        startGame('tictactoe');
    };
}
