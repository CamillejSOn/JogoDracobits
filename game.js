// Pega o elemento canvas do HTML
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Nosso Draco provisório (Placeholder)
const draco = {
    x: canvas.width / 2 - 25,  // Posição no meio da tela (eixo X)
    y: canvas.height / 2 - 25, // Posição no meio da tela (eixo Y)
    width: 50,
    height: 50,
    color: '#5FD3FF' // Azul Neon do DracoBits
};

// Função responsável por desenhar tudo na tela
function draw() {
    // 1. Limpa a tela inteira a cada frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Desenha o Draco (nosso quadrado neon)
    ctx.fillStyle = draco.color;
    ctx.fillRect(draco.x, draco.y, draco.width, draco.height);
}

// O Loop Central do Jogo (Roda a 60 frames por segundo)
function gameLoop() {
    draw();
    
    // Chama a função gameLoop novamente para o próximo frame
    requestAnimationFrame(gameLoop);
}

gameLoop();
console.log("Núcleo Arcadia iniciado: Draco está vivo na tela.");