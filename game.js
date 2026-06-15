// Pega o elemento canvas do HTML
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Nosso Draco provisório (Placeholder)
const draco = {
    x: canvas.width / 2 - 25,
    y: canvas.height / 2 - 25,
    width: 50,
    height: 50,
    color: '#5FD3FF'
};

// 1. Variáveis de Sobrevivência (Status do Draco)
let dracoStats = {
    fome: 100,
    higiene: 100
};

// 2. Sistema de degradação: as necessidades caem com o tempo
// O setInterval roda o código repetidamente a cada X milissegundos (1000ms = 1 segundo)
setInterval(() => {
    // Impede que os valores fiquem abaixo de zero
    if (dracoStats.fome > 0) dracoStats.fome -= 5;
    if (dracoStats.higiene > 0) dracoStats.higiene -= 2;

    // Mostra no console os valores caindo
    console.clear();
    console.log(`Status do Draco -> Fome: ${dracoStats.fome} | Higiene: ${dracoStats.higiene}`);
    
    // Simulação rápida de Game Over no console
    if (dracoStats.fome === 0) {
        console.log("ALERTA: O Draco desmaiou de fome!");
    }
}, 1000); // Cai a cada 1 segundo

// 3. Input do Jogador: Ação de Alimentar
canvas.addEventListener('mousedown', (event) => {
    // Por enquanto, qualquer clique do mouse na tela alimenta o Draco
    dracoStats.fome = 100;
    console.log("Ação: Draco foi alimentado! Fome restaurada para 100.");
});

// Função responsável por desenhar tudo na tela
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = draco.color;
    ctx.fillRect(draco.x, draco.y, draco.width, draco.height);
}

// O Loop Central do Jogo
function gameLoop() {
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();