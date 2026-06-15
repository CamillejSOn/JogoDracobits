const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const draco = {
    x: canvas.width / 2 - 25,
    y: canvas.height / 2 - 25,
    width: 50,
    height: 50,
    color: '#5FD3FF' 
};

let dracoStats = {
    fome: 100,
    higiene: 100
};

// Variável que controla se o jogo acabou
let isGameOver = false;

setInterval(() => {
    // Só diminui se o jogo não tiver acabado
    if (!isGameOver) {
        if (dracoStats.fome > 0) dracoStats.fome -= 5;
        if (dracoStats.higiene > 0) dracoStats.higiene -= 2;

        // Condição de Derrota[cite: 1, 3]
        if (dracoStats.fome <= 0 || dracoStats.higiene <= 0) {
            isGameOver = true;
        }
    }
}, 1000);

canvas.addEventListener('mousedown', (event) => {
    if (isGameOver) return; // Se perdeu, não deixa clicar mais

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (mouseX >= 150 && mouseX <= 300 && mouseY >= 500 && mouseY <= 540) {
        dracoStats.fome = 100;
    }

    if (mouseX >= 500 && mouseX <= 650 && mouseY >= 500 && mouseY <= 540) {
        dracoStats.higiene = 100;
    }
});

function drawHUD() {
    ctx.fillStyle = '#EAF7FF'; 
    ctx.font = '20px "Courier New", Courier, monospace'; 
    ctx.fillText(`Fome: ${dracoStats.fome}%`, 20, 40);
    ctx.fillText(`Higiene: ${dracoStats.higiene}%`, 20, 70);

    ctx.fillStyle = '#FF8E8E'; 
    ctx.fillRect(150, 500, 150, 40);
    ctx.fillStyle = '#132238'; 
    ctx.fillText('ALIMENTAR', 170, 525);

    ctx.fillStyle = '#FF8E8E'; 
    ctx.fillRect(500, 500, 150, 40);
    ctx.fillStyle = '#132238'; 
    ctx.fillText('LIMPAR', 535, 525);
}

// Função para desenhar a Tela de Derrota[cite: 1]
function drawGameOver() {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.8)'; // Fundo vermelho translúcido
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '40px "Courier New", Courier, monospace';
    ctx.fillText('COLAPSO DO SISTEMA', 200, 300);
    ctx.font = '20px "Courier New", Courier, monospace';
    ctx.fillText('Draco foi negligenciado. Aperte F5 para reiniciar.', 100, 350);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isGameOver) {
        drawGameOver();
    } else {
        ctx.fillStyle = draco.color;
        ctx.fillRect(draco.x, draco.y, draco.width, draco.height);
        drawHUD();
    }
}

function gameLoop() {
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();