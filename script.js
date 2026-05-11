const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;

let playerPaddle = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

let computerPaddle = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 5
};

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 5,
    dy: 5,
    radius: ballSize,
    speed: 5,
    maxSpeed: 8
};

let scores = {
    player: 0,
    computer: 0
};

let gameRunning = false;
let mouseY = canvas.height / 2;

// Event listeners
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);
document.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('click', startGame);

function handleKeyDown(e) {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        playerPaddle.dy = -playerPaddle.speed;
    }
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        playerPaddle.dy = playerPaddle.speed;
    }
}

function handleKeyUp(e) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'w' || e.key === 'W' || e.key === 's' || e.key === 'S') {
        playerPaddle.dy = 0;
    }
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
}

function startGame() {
    gameRunning = true;
}

function updatePlayerPaddle() {
    // Mouse control - smooth following
    const paddleCenter = playerPaddle.y + playerPaddle.height / 2;
    const diff = mouseY - paddleCenter;
    
    if (Math.abs(diff) > 5) {
        playerPaddle.dy = diff > 0 ? playerPaddle.speed : -playerPaddle.speed;
    } else {
        playerPaddle.dy = 0;
    }

    playerPaddle.y += playerPaddle.dy;

    // Collision with walls
    if (playerPaddle.y < 0) {
        playerPaddle.y = 0;
    }
    if (playerPaddle.y + playerPaddle.height > canvas.height) {
        playerPaddle.y = canvas.height - playerPaddle.height;
    }
}

function updateComputerPaddle() {
    const computerCenter = computerPaddle.y + computerPaddle.height / 2;
    const diff = ball.y - computerCenter;

    if (Math.abs(diff) > 10) {
        computerPaddle.dy = diff > 0 ? computerPaddle.speed : -computerPaddle.speed;
    } else {
        computerPaddle.dy = 0;
    }

    computerPaddle.y += computerPaddle.dy;

    // Collision with walls
    if (computerPaddle.y < 0) {
        computerPaddle.y = 0;
    }
    if (computerPaddle.y + computerPaddle.height > canvas.height) {
        computerPaddle.y = canvas.height - computerPaddle.height;
    }
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision (top and bottom)
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }

    // Paddle collision - Player
    if (
        ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y &&
        ball.y < playerPaddle.y + playerPaddle.height
    ) {
        ball.dx = -ball.dx;
        ball.x = playerPaddle.x + playerPaddle.width + ball.radius;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - playerPaddle.y) / playerPaddle.height;
        ball.dy = (hitPos - 0.5) * ball.speed * 2;
        
        // Increase speed slightly
        ball.speed = Math.min(ball.speed + 0.5, ball.maxSpeed);
        ball.dx = Math.sign(ball.dx) * ball.speed;
    }

    // Paddle collision - Computer
    if (
        ball.x + ball.radius > computerPaddle.x &&
        ball.y > computerPaddle.y &&
        ball.y < computerPaddle.y + computerPaddle.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computerPaddle.x - ball.radius;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - computerPaddle.y) / computerPaddle.height;
        ball.dy = (hitPos - 0.5) * ball.speed * 2;
        
        // Increase speed slightly
        ball.speed = Math.min(ball.speed + 0.5, ball.maxSpeed);
        ball.dx = Math.sign(ball.dx) * ball.speed;
    }

    // Score points
    if (ball.x - ball.radius < 0) {
        scores.computer++;
        updateScore();
        resetBall();
    }
    if (ball.x + ball.radius > canvas.width) {
        scores.player++;
        updateScore();
        resetBall();
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 5;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() - 0.5) * ball.speed;
    gameRunning = false;
}

function updateScore() {
    document.getElementById('playerScore').textContent = scores.player;
    document.getElementById('computerScore').textContent = scores.computer;
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw player paddle
    ctx.fillStyle = '#00ffff';
    ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
    ctx.shadowBlur = 10;
    ctx.fillRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);

    // Draw computer paddle
    ctx.fillStyle = '#ff0080';
    ctx.shadowColor = 'rgba(255, 0, 128, 0.8)';
    ctx.shadowBlur = 10;
    ctx.fillRect(computerPaddle.x, computerPaddle.y, computerPaddle.width, computerPaddle.height);

    // Draw ball
    ctx.fillStyle = '#ffff00';
    ctx.shadowColor = 'rgba(255, 255, 0, 0.8)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowColor = 'transparent';

    // Draw start message
    if (!gameRunning) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
        ctx.shadowBlur = 10;
        ctx.fillText('Click to Start', canvas.width / 2, canvas.height / 2);
        ctx.shadowColor = 'transparent';
    }
}

function gameLoop() {
    if (gameRunning) {
        updatePlayerPaddle();
        updateComputerPaddle();
        updateBall();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
