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
    higiene: 100
};

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
        x: 120,
        y: 500,
        width: 180,
        height: 48,
        label: 'ALIMENTAR'
    },

    clean: {
        x: 500,
        y: 500,
        width: 180,
        height: 48,
        label: 'LIMPAR'
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

function resetGame() {
    dracoStats = {
        fome: 100,
        higiene: 100
    };

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

    dracoStats.fome = Math.max(0, dracoStats.fome - 5);
    dracoStats.higiene = Math.max(0, dracoStats.higiene - 2);

    if (dracoStats.fome <= 0 || dracoStats.higiene <= 0) {
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
        80,
        38,
        COLORS.neonBlue,
        'bold'
    );

    drawPanel(100, 125, 600, 350);

    drawCenteredText(
        'OBJETIVO',
        170,
        23,
        COLORS.coral,
        'bold'
    );

    drawCenteredText(
        'Mantenha Draco saudável e impeça o',
        210,
        18
    );

    drawCenteredText(
        'colapso do Núcleo Arcadia.',
        238,
        18
    );

    drawCenteredText(
        'CONTROLES',
        295,
        23,
        COLORS.coral,
        'bold'
    );

    drawCenteredText(
        'Use o mouse para clicar nos botões.',
        335,
        18
    );

    drawCenteredText(
        'ALIMENTAR restaura a fome de Draco.',
        370,
        18
    );

    drawCenteredText(
        'LIMPAR restaura a higiene de Draco.',
        405,
        18
    );

    drawCenteredText(
        'Se uma necessidade chegar a zero, você perde.',
        445,
        16,
        COLORS.iceWhite
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
    drawPanel(20, 20, 300, 130);

    ctx.fillStyle = COLORS.iceWhite;
    ctx.font = 'bold 18px "Courier New", Courier, monospace';

    ctx.fillText(`Fome: ${dracoStats.fome}%`, 40, 60);

    drawProgressBar(
        40,
        72,
        250,
        18,
        dracoStats.fome,
        getStatColor(dracoStats.fome)
    );

    ctx.fillText(`Higiene: ${dracoStats.higiene}%`, 40, 115);

    drawProgressBar(
        40,
        127,
        250,
        18,
        dracoStats.higiene,
        getStatColor(dracoStats.higiene)
    );

    drawCenteredText(
        'Mantenha as necessidades acima de zero.',
        175,
        16,
        COLORS.iceWhite
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

function drawGameplay() {
    drawHUD();
    drawDraco();

    drawCenteredText(
        'DRACO',
        390,
        22,
        COLORS.neonBlue,
        'bold'
    );

    drawButton(buttons.feed);

    drawButton(buttons.clean);
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
            dracoStats.fome = 100;
            return;
        }

        if (isPointInsideButton(mouseX, mouseY, buttons.clean)) {
            dracoStats.higiene = 100;
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