// Pega o elemento canvas do HTML
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Nosso Draco provisório
const draco = {
    x: canvas.width / 2 - 25,
    y: canvas.height / 2 - 25,
    width: 50,
    height: 50,
    color: '#5FD3FF' // Azul Neon[cite: 2]
};

// Variáveis de Sobrevivência
let dracoStats = {
    fome: 100,
    higiene: 100
};

// Sistema de degradação
setInterval(() => {
    if (dracoStats.fome > 0) dracoStats.fome -= 5;
    if (dracoStats.higiene > 0) dracoStats.higiene -= 2;
}, 1000);

// Input do Jogador: Detecta onde o mouse clicou
canvas.addEventListener('mousedown', (event) => {
    // Calcula a posição exata do clique dentro do canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Lógica do botão "Alimentar" (posição X: 150 a 300, Y: 500 a 540)
    if (mouseX >= 150 && mouseX <= 300 && mouseY >= 500 && mouseY <= 540) {
        dracoStats.fome = 100;
    }

    // Lógica do botão "Limpar" (posição X: 500 a 650, Y: 500 a 540)
    if (mouseX >= 500 && mouseX <= 650 && mouseY >= 500 && mouseY <= 540) {
        dracoStats.higiene = 100;
    }
});

// Função para desenhar a interface (Textos e Botões)
function drawHUD() {
    // Textos de Status
    ctx.fillStyle = '#EAF7FF'; // Branco Gelo[cite: 2]
    ctx.font = '20px "Courier New", Courier, monospace'; // Fonte estilo retrô/terminal
    ctx.fillText(`Fome: ${dracoStats.fome}%`, 20, 40);
    ctx.fillText(`Higiene: ${dracoStats.higiene}%`, 20, 70);

    // Botão Alimentar
    ctx.fillStyle = '#FF8E8E'; // Coral Claro[cite: 2]
    ctx.fillRect(150, 500, 150, 40);
    ctx.fillStyle = '#132238'; // Azul Escuro (cor do texto dentro do botão)[cite: 2]
    ctx.fillText('ALIMENTAR', 170, 525);

    // Botão Limpar
    ctx.fillStyle = '#FF8E8E'; // Coral Claro[cite: 2]
    ctx.fillRect(500, 500, 150, 40);
    ctx.fillStyle = '#132238'; // Azul Escuro[cite: 2]
    ctx.fillText('LIMPAR', 535, 525);
}

// Função principal de desenho
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = draco.color;
    ctx.fillRect(draco.x, draco.y, draco.width, draco.height);

    drawHUD();
}

function gameLoop() {
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();