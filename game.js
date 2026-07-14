const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');


const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const COLORS = {
    background: '#132238',
    backgroundLight: '#1D3655',
    neonBlue: '#5FD3FF',
    softPurple: '#7B6DCC',
    iceWhite: '#EAF7FF',
    coral: '#FF8E8E',
    darkText: '#132238',
    danger: '#D64045',
    success: '#74E39A',
    black: '#05080D'
};

const GAME_STATES = {
    RATING: 'rating',
    MENU: 'menu',
    HELP: 'help',
    CREDITS: 'credits',
    TUTORIAL: 'tutorial',
    PLAYING: 'playing',
    GAME_OVER: 'gameover'
};

let currentState = GAME_STATES.RATING;
let tutorialPage = 0;

const tutorialMessages = [
    {
        title: 'ECHO // CONEXÃO INICIADA',
        lines: [
            'Bem-vindo ao Núcleo Arcadia.',
            'Este é Draco, uma das últimas criaturas digitais.',
            'Ele depende dos seus cuidados para sobreviver.'
        ]
    },
    {
        title: 'NECESSIDADES DE DRACO',
        lines: [
            'A fome e a higiene diminuem com o tempo.',
            'Use os botões para cuidar de Draco.',
            'Se uma necessidade chegar a zero, você perde.'
        ]
    },
    {
        title: 'SUA MISSÃO',
        lines: [
            'Mantenha Draco saudável.',
            'Proteja-o das falhas do sistema.',
            'Agora você está pronto para iniciar.'
        ]
    }
];

const draco = {
    x: WIDTH / 2 - 35,
    y: HEIGHT / 2 - 35,
    width: 70,
    height: 70,
    color: COLORS.neonBlue
};

let dracoStats = {
    fome: 100,
    higiene: 100, 
    felicidade: 100,
    energia: 100
};

let feedbackMessage = '';
let feedbackUntil = 0;

const buttons = {
    menuPlay: {
        x: 280,
        y: 300,
        width: 240,
        height: 52,
        label: 'NOVO JOGO'
    },

    menuHelp: {
        x: 280,
        y: 370,
        width: 240,
        height: 52,
        label: 'COMO JOGAR'
    },

    menuCredits: {
        x: 280,
        y: 440,
        width: 240,
        height: 52,
        label: 'CRÉDITOS'
    },

    back: {
        x: 300,
        y: 510,
        width: 200,
        height: 48,
        label: 'VOLTAR'
    },

    tutorialNext: {
        x: 300,
        y: 475,
        width: 200,
        height: 50,
        label: 'CONTINUAR'
    },

    feed: {
    x: 45,
    y: 505,
    width: 160,
    height: 48,
    label: 'ALIMENTAR'
},

clean: {
    x: 225,
    y: 505,
    width: 160,
    height: 48,
    label: 'LIMPAR'
},

play: {
    x: 405,
    y: 505,
    width: 160,
    height: 48,
    label: 'BRINCAR'
},

sleep: {
    x: 585,
    y: 505,
    width: 160,
    height: 48,
    label: 'DORMIR'
},

    restart: {
        x: 180,
        y: 440,
        width: 200,
        height: 50,
        label: 'TENTAR NOVAMENTE'
    },

    gameOverMenu: {
        x: 420,
        y: 440,
        width: 200,
        height: 50,
        label: 'MENU PRINCIPAL'
    }
};


const particles = [];

function createParticles() {
    particles.length = 0;

    for (let index = 0; index < 45; index++) {
        particles.push({
            x: Math.random() * WIDTH,
            y: Math.random() * HEIGHT,
            radius: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.3 + 0.1,
            opacity: Math.random() * 0.7 + 0.2
        });
    }
}

createParticles();


let ratingStartTime = performance.now();
const ratingDuration = 3500;

let lastStatsUpdate = performance.now();
const statsUpdateInterval = 1000;

function startTutorial() {
    tutorialPage = 0;
    currentState = GAME_STATES.TUTORIAL;
}

function clamp(value, min = 0, max = 100) {
    return Math.max(min, Math.min(max, value));
}

function showFeedback(message, duration = 1600) {
    feedbackMessage = message;
    feedbackUntil = performance.now() + duration;
}

function resetGame() {
    dracoStats = {
        fome: 100,
        higiene: 100,
        felicidade: 100,
        energia: 100
    };

    feedbackMessage = 'Mantenha Draco saudável!';
    feedbackUntil = performance.now() + 3000;

    lastStatsUpdate = performance.now();
    currentState = GAME_STATES.PLAYING;
}

function updateStats(currentTime) {
    if (currentState !== GAME_STATES.PLAYING) {
        return;
    }

    if (currentTime - lastStatsUpdate < statsUpdateInterval) {
        return;
    }

    lastStatsUpdate = currentTime;

    dracoStats.fome = clamp(dracoStats.fome - 3);
    dracoStats.higiene = clamp(dracoStats.higiene - 2);
    dracoStats.felicidade = clamp(dracoStats.felicidade - 2);
    dracoStats.energia = clamp(dracoStats.energia - 1);

    if (
        dracoStats.fome <= 0 ||
        dracoStats.higiene <= 0 ||
        dracoStats.felicidade <= 0 ||
        dracoStats.energia <= 0
    ) {
        currentState = GAME_STATES.GAME_OVER;
    }
}

function updateParticles() {
    particles.forEach((particle) => {
        particle.y -= particle.speed;

        if (particle.y < -5) {
            particle.y = HEIGHT + 5;
            particle.x = Math.random() * WIDTH;
        }
    });
}

function clearCanvas() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const backgroundGradient = ctx.createLinearGradient(
        0,
        0,
        0,
        HEIGHT
    );

    backgroundGradient.addColorStop(0, COLORS.backgroundLight);
    backgroundGradient.addColorStop(1, COLORS.background);

    ctx.fillStyle = backgroundGradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function drawParticles() {
    particles.forEach((particle) => {
        ctx.beginPath();

        ctx.fillStyle = `rgba(95, 211, 255, ${particle.opacity})`;

        ctx.arc(
            particle.x,
            particle.y,
            particle.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();
    });
}

function drawCenteredText(
    text,
    y,
    fontSize = 24,
    color = COLORS.iceWhite,
    fontWeight = 'normal'
) {
    ctx.fillStyle = color;

    ctx.font = `${fontWeight} ${fontSize}px "Courier New", Courier, monospace`;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText(text, WIDTH / 2, y);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
}

function drawButton(button, options = {}) {
    const {
        backgroundColor = COLORS.coral,
        textColor = COLORS.darkText,
        borderColor = COLORS.iceWhite
    } = options;

    ctx.save();

    ctx.fillStyle = backgroundColor;

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.roundRect(
        button.x,
        button.y,
        button.width,
        button.height,
        8
    );

    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = textColor;

    ctx.font = 'bold 18px "Courier New", Courier, monospace';

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText(
        button.label,
        button.x + button.width / 2,
        button.y + button.height / 2
    );

    ctx.restore();
}

function drawPanel(x, y, width, height) {
    ctx.save();

    ctx.fillStyle = 'rgba(5, 8, 13, 0.75)';
    ctx.strokeStyle = 'rgba(95, 211, 255, 0.75)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 12);

    ctx.fill();
    ctx.stroke();

    ctx.restore();
}

function isPointInsideButton(x, y, button) {
    return (
        x >= button.x &&
        x <= button.x + button.width &&
        y >= button.y &&
        y <= button.y + button.height
    );
}

function drawRatingScreen() {
    drawPanel(190, 100, 420, 400);

    ctx.fillStyle = '#4CAF50';

    ctx.beginPath();
    ctx.roundRect(325, 145, 150, 150, 18);
    ctx.fill();

    drawCenteredText('L', 220, 100, '#FFFFFF', 'bold');

    drawCenteredText(
        'CLASSIFICAÇÃO INDICATIVA',
        340,
        25,
        COLORS.iceWhite,
        'bold'
    );

    drawCenteredText(
        'LIVRE',
        385,
        35,
        '#74E39A',
        'bold'
    );

    drawCenteredText(
        'Não contém conteúdo impróprio.',
        435,
        18,
        COLORS.iceWhite
    );

    drawCenteredText(
        'Aguarde...',
        475,
        15,
        COLORS.neonBlue
    );
}

function drawMenu() {
    drawCenteredText(
        'DRACOBITS',
        115,
        64,
        COLORS.neonBlue,
        'bold'
    );

    drawCenteredText(
        'Cuide. Proteja. Evolua.',
        170,
        19,
        COLORS.iceWhite
    );

    drawPanel(240, 250, 320, 290);

    drawButton(buttons.menuPlay);

    drawButton(buttons.menuHelp, {
        backgroundColor: COLORS.softPurple,
        textColor: COLORS.iceWhite
    });

    drawButton(buttons.menuCredits, {
        backgroundColor: COLORS.backgroundLight,
        textColor: COLORS.iceWhite,
        borderColor: COLORS.neonBlue
    });

    drawCenteredText(
        'Núcleo Arcadia // Sistema instável',
        570,
        14,
        'rgba(234, 247, 255, 0.7)'
    );
}

function drawHelp() {
    drawCenteredText(
        'COMO JOGAR',
        65,
        36,
        COLORS.neonBlue,
        'bold'
    );

    drawPanel(75, 100, 650, 385);

    drawCenteredText(
        'OBJETIVO',
        140,
        22,
        COLORS.coral,
        'bold'
    );

    drawCenteredText(
        'Mantenha Draco saudável e proteja o Núcleo Arcadia.',
        175,
        16
    );

    drawCenteredText(
        'AÇÕES',
        225,
        22,
        COLORS.coral,
        'bold'
    );

    drawCenteredText(
        'ALIMENTAR — recupera fome.',
        260,
        16
    );

    drawCenteredText(
        'LIMPAR — recupera higiene.',
        292,
        16
    );

    drawCenteredText(
        'BRINCAR — recupera felicidade e gasta energia.',
        324,
        16
    );

    drawCenteredText(
        'DORMIR — recupera energia, mas aumenta a fome.',
        356,
        16
    );

    drawCenteredText(
        'Você perde se qualquer necessidade chegar a zero.',
        420,
        16,
        '#FFD166'
    );

    drawButton(buttons.back, {
        backgroundColor: COLORS.softPurple,
        textColor: COLORS.iceWhite
    });
}

function drawCredits() {
    drawCenteredText(
        'CRÉDITOS',
        80,
        38,
        COLORS.neonBlue,
        'bold'
    );

    drawPanel(120, 125, 560, 350);

    drawCenteredText(
        'DESIGN E DESENVOLVIMENTO',
        180,
        20,
        COLORS.coral,
        'bold'
    );

    drawCenteredText(
        'Camille Silva',
        220,
        22,
        COLORS.iceWhite
    );

    drawCenteredText(
        'Yuri Lima',
        252,
        22,
        COLORS.iceWhite
    );

    drawCenteredText(
        'PROJETO ACADÊMICO',
        320,
        20,
        COLORS.coral,
        'bold'
    );

    drawCenteredText(
        'Design e Desenvolvimento de Jogos',
        360,
        18,
        COLORS.iceWhite
    );

    drawCenteredText(
        'Universidade Federal de Ouro Preto',
        395,
        17,
        COLORS.iceWhite
    );

    drawCenteredText(
        '2026',
        435,
        17,
        COLORS.neonBlue
    );

    drawButton(buttons.back, {
        backgroundColor: COLORS.softPurple,
        textColor: COLORS.iceWhite
    });
}

function drawTutorial() {
    const message = tutorialMessages[tutorialPage];

    drawCenteredText(
        'TRANSMISSÃO DE ECHO',
        75,
        34,
        COLORS.neonBlue,
        'bold'
    );

    drawPanel(85, 125, 630, 330);

    // Representação visual simples da Echo
    ctx.save();

    ctx.strokeStyle = COLORS.softPurple;
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.arc(170, 285, 60, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(123, 109, 204, 0.25)';

    ctx.beginPath();
    ctx.arc(170, 285, 48, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = COLORS.neonBlue;

    ctx.fillRect(146, 270, 12, 12);
    ctx.fillRect(182, 270, 12, 12);

    ctx.restore();

    // Título da mensagem
    ctx.fillStyle = COLORS.coral;
    ctx.font = 'bold 20px "Courier New", Courier, monospace';

    ctx.fillText(
        message.title,
        270,
        205
    );

    // Conteúdo da mensagem
    message.lines.forEach((line, index) => {
        ctx.fillStyle = COLORS.iceWhite;
        ctx.font = '17px "Courier New", Courier, monospace';

        ctx.fillText(
            line,
            270,
            255 + index * 42
        );
    });

    // Na última página, muda o texto do botão
    if (tutorialPage === tutorialMessages.length - 1) {
        buttons.tutorialNext.label = 'INICIAR DEMO';
    } else {
        buttons.tutorialNext.label = 'CONTINUAR';
    }

    drawButton(buttons.tutorialNext, {
        backgroundColor: COLORS.softPurple,
        textColor: COLORS.iceWhite
    });

    drawCenteredText(
        `${tutorialPage + 1} / ${tutorialMessages.length}`,
        555,
        14,
        'rgba(234, 247, 255, 0.7)'
    );
}

function getStatColor(value) {
    if (value > 60) {
        return COLORS.success;
    }

    if (value > 30) {
        return '#FFD166';
    }

    return COLORS.danger;
}

function drawProgressBar(x, y, width, height, value, color) {
    ctx.fillStyle = 'rgba(5, 8, 13, 0.8)';
    ctx.fillRect(x, y, width, height);

    ctx.fillStyle = color;
    ctx.fillRect(x, y, width * (value / 100), height);

    ctx.strokeStyle = COLORS.iceWhite;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
}

function drawHUD() {
    drawPanel(20, 20, 300, 235);

    ctx.fillStyle = COLORS.iceWhite;
    ctx.font = 'bold 16px "Courier New", Courier, monospace';

    ctx.fillText(`Fome: ${dracoStats.fome}%`, 40, 50);

    drawProgressBar(
        40,
        60,
        250,
        15,
        dracoStats.fome,
        getStatColor(dracoStats.fome)
    );

    ctx.fillText(`Higiene: ${dracoStats.higiene}%`, 40, 100);

    drawProgressBar(
        40,
        110,
        250,
        15,
        dracoStats.higiene,
        getStatColor(dracoStats.higiene)
    );

    ctx.fillText(
        `Felicidade: ${dracoStats.felicidade}%`,
        40,
        150
    );

    drawProgressBar(
        40,
        160,
        250,
        15,
        dracoStats.felicidade,
        getStatColor(dracoStats.felicidade)
    );

    ctx.fillText(`Energia: ${dracoStats.energia}%`, 40, 200);

    drawProgressBar(
        40,
        210,
        250,
        15,
        dracoStats.energia,
        getStatColor(dracoStats.energia)
    );
}

function drawDraco() {
    ctx.save();

    ctx.shadowColor = COLORS.neonBlue;
    ctx.shadowBlur = 25;

    ctx.fillStyle = draco.color;

    ctx.beginPath();
    ctx.roundRect(
        draco.x,
        draco.y,
        draco.width,
        draco.height,
        18
    );

    ctx.fill();

    ctx.restore();

    ctx.fillStyle = COLORS.background;
    ctx.fillRect(draco.x + 17, draco.y + 20, 8, 8);
    ctx.fillRect(draco.x + 45, draco.y + 20, 8, 8);

    ctx.fillStyle = COLORS.coral;
    ctx.fillRect(draco.x + 28, draco.y + 47, 14, 5);
}

function drawFeedback() {
    if (
        !feedbackMessage ||
        performance.now() > feedbackUntil
    ) {
        return;
    }

    drawPanel(170, 430, 460, 45);

    drawCenteredText(
        feedbackMessage,
        452,
        15,
        COLORS.iceWhite,
        'bold'
    );
}

function drawGameplay() {
    drawHUD();
    drawDraco();
    drawFeedback();

    drawCenteredText(
        'DRACO',
        390,
        22,
        COLORS.neonBlue,
        'bold'
    );

    drawButton(buttons.feed);

    drawButton(buttons.clean);

    drawButton(buttons.play, {
        backgroundColor: COLORS.softPurple,
        textColor: COLORS.iceWhite
    });

    drawButton(buttons.sleep, {
        backgroundColor: COLORS.backgroundLight,
        textColor: COLORS.iceWhite,
        borderColor: COLORS.neonBlue
    });
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(90, 5, 15, 0.82)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    drawPanel(90, 95, 620, 420);

    drawCenteredText(
        'COLAPSO DO SISTEMA',
        180,
        38,
        COLORS.coral,
        'bold'
    );

    drawCenteredText(
        'Uma das necessidades de Draco chegou a zero.',
        245,
        18,
        COLORS.iceWhite
    );

    drawCenteredText(
        'O Núcleo Arcadia não resistiu à instabilidade.',
        280,
        18,
        COLORS.iceWhite
    );

    drawCenteredText(
        'Cuide dele e tente novamente.',
        340,
        21,
        COLORS.neonBlue,
        'bold'
    );

    drawButton(buttons.restart);

    drawButton(buttons.gameOverMenu, {
        backgroundColor: COLORS.backgroundLight,
        textColor: COLORS.iceWhite,
        borderColor: COLORS.neonBlue
    });
}

canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;

    if (currentState === GAME_STATES.MENU) {
        if (isPointInsideButton(mouseX, mouseY, buttons.menuPlay)) {
            startTutorial();
            return;
        }

        if (isPointInsideButton(mouseX, mouseY, buttons.menuHelp)) {
            currentState = GAME_STATES.HELP;
            return;
        }

        if (isPointInsideButton(mouseX, mouseY, buttons.menuCredits)) {
            currentState = GAME_STATES.CREDITS;
        }

        return;
    }

    if (
        currentState === GAME_STATES.HELP ||
        currentState === GAME_STATES.CREDITS
    ) {
        if (isPointInsideButton(mouseX, mouseY, buttons.back)) {
            currentState = GAME_STATES.MENU;
        }

        return;
    }

    if (currentState === GAME_STATES.TUTORIAL) {
    if (
        isPointInsideButton(
            mouseX,
            mouseY,
            buttons.tutorialNext
        )
    ) {
        const isLastPage =
            tutorialPage === tutorialMessages.length - 1;

        if (isLastPage) {
            resetGame();
        } else {
            tutorialPage++;
        }
    }

    return;
}

    if (currentState === GAME_STATES.PLAYING) {
    if (isPointInsideButton(mouseX, mouseY, buttons.feed)) {
        dracoStats.fome = clamp(dracoStats.fome + 30);

        showFeedback('Draco foi alimentado!');
        return;
    }

    if (isPointInsideButton(mouseX, mouseY, buttons.clean)) {
        dracoStats.higiene = clamp(dracoStats.higiene + 35);

        showFeedback('Draco está limpinho!');
        return;
    }

    if (isPointInsideButton(mouseX, mouseY, buttons.play)) {
        if (dracoStats.energia < 15) {
            showFeedback('Draco está cansado demais para brincar.');
            return;
        }

        dracoStats.felicidade = clamp(
            dracoStats.felicidade + 30
        );

        dracoStats.energia = clamp(
            dracoStats.energia - 10
        );

        showFeedback('Draco adorou brincar!');
        return;
    }

    if (isPointInsideButton(mouseX, mouseY, buttons.sleep)) {
        dracoStats.energia = clamp(
            dracoStats.energia + 40
        );

        dracoStats.fome = clamp(
            dracoStats.fome - 8
        );

        showFeedback('Draco descansou e recuperou energia.');
    }

    return;
}

    if (currentState === GAME_STATES.GAME_OVER) {
        if (isPointInsideButton(mouseX, mouseY, buttons.restart)) {
            resetGame();
            return;
        }

        if (isPointInsideButton(mouseX, mouseY, buttons.gameOverMenu)) {
            currentState = GAME_STATES.MENU;
        }
    }
});
function update(currentTime) {
    updateParticles();
    updateStats(currentTime);

    if (
        currentState === GAME_STATES.RATING &&
        currentTime - ratingStartTime >= ratingDuration
    ) {
        currentState = GAME_STATES.MENU;
    }
}

function draw() {
    clearCanvas();
    drawParticles();

    switch (currentState) {
        case GAME_STATES.RATING:
            drawRatingScreen();
            break;

        case GAME_STATES.MENU:
            drawMenu();
            break;

        case GAME_STATES.HELP:
            drawHelp();
            break;

        case GAME_STATES.CREDITS:
            drawCredits();
            break;

        case GAME_STATES.TUTORIAL:
            drawTutorial();
            break;

        case GAME_STATES.PLAYING:
            drawGameplay();
            break;

        case GAME_STATES.GAME_OVER:
            drawGameOver();
            break;

        default:
            drawMenu();
    }
}

function gameLoop(currentTime) {
    update(currentTime);
    draw();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);