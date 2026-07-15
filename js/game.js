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
    GAME_OVER: 'gameover',
    VICTORY: 'victory'
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
        title: 'NECESSIDADES E FALHAS',
        lines: [
            'As necessidades de Draco diminuem com o tempo.',
            'Fragmentos corrompidos surgirão pelo cenário.',
            'Clique neles antes que a falha se espalhe.'
        ]
    },
    {
        title: 'SUA MISSÃO',
        lines: [
            'Mantenha Draco saudável para restaurar o núcleo.',
            'A estabilidade aumenta quando as necessidades estão altas.',
            'Alcance 100% de estabilidade para vencer.'
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
let coreStability = 0;
let dracoAction = 'idle';
let dracoActionUntil = 0;
let dracoBlinkUntil = 0;
let nextBlinkTime = performance.now() + 2500;
let criticalSince = null;
let corruptedFragment = null;
let nextFragmentTime = performance.now() + 5000;

const criticalGraceTime = 3000;
const fragmentDuration = 3500;
const fragmentMinInterval = 4500;
const fragmentMaxInterval = 7500;

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
    label: '🍖 ALIMENTAR'
},

clean: {
    x: 225,
    y: 505,
    width: 160,
    height: 48,
    label: '🫧 LIMPAR'
},

play: {
    x: 405,
    y: 505,
    width: 160,
    height: 48,
    label: '★ BRINCAR'
},

sleep: {
    x: 585,
    y: 505,
    width: 160,
    height: 48,
    label: '🌙 DORMIR'
},

    restart: {
        x: 180,
        y: 440,
        width: 200,
        height: 50,
        label: 'TENTAR NOVAMENTE'
    },

    endMenu: {
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

function setDracoAction(action, duration = 1000) {
    dracoAction = action;
    dracoActionUntil = performance.now() + duration;
}

function updateDracoAnimation(currentTime) {
    if (currentState !== GAME_STATES.PLAYING) {
        return;
    }

    if (currentTime >= nextBlinkTime) {
        dracoBlinkUntil = currentTime + 160;
        nextBlinkTime = currentTime + randomBetween(2200, 4800);
    }

    if (
        dracoAction !== 'idle' &&
        currentTime >= dracoActionUntil
    ) {
        dracoAction = 'idle';
    }
}

function getDracoMood() {
    const average = getAverageStats();

    if (dracoAction === 'sleeping') {
        return 'sleeping';
    }

    if (dracoStats.energia <= 25) {
        return 'tired';
    }

    if (average <= 35) {
        return 'sad';
    }

    if (average >= 75) {
        return 'happy';
    }

    return 'neutral';
}

function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function scheduleNextFragment(currentTime) {
    nextFragmentTime =
        currentTime +
        randomBetween(fragmentMinInterval, fragmentMaxInterval);
}

function createCorruptedFragment(currentTime) {
    const size = randomBetween(42, 62);

    corruptedFragment = {
        x: randomBetween(330, WIDTH - size - 35),
        y: randomBetween(145, 410),
        size,
        createdAt: currentTime,
        expiresAt: currentTime + fragmentDuration,
        rotation: Math.random() * Math.PI,
        pulse: 0
    };

    showFeedback(
        'Echo: fragmento corrompido detectado!',
        2200
    );
}

function resetGame() {
    dracoStats = {
        fome: 100,
        higiene: 100,
        felicidade: 100,
        energia: 100
    };

    coreStability = 0;
    dracoAction = 'idle';
    dracoActionUntil = 0;
    dracoBlinkUntil = 0;
    nextBlinkTime = performance.now() + 2500;
    corruptedFragment = null;
    criticalSince = null;
    scheduleNextFragment(performance.now());

    feedbackMessage = 'Mantenha Draco saudável!';
    feedbackUntil = performance.now() + 3000;

    lastStatsUpdate = performance.now();
    currentState = GAME_STATES.PLAYING;
}

function getAverageStats() {
    return (
        dracoStats.fome +
        dracoStats.higiene +
        dracoStats.felicidade +
        dracoStats.energia
    ) / 4;
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

    const lowestStat = Math.min(
        dracoStats.fome,
        dracoStats.higiene,
        dracoStats.felicidade,
        dracoStats.energia
    );

    if (lowestStat <= 0) {
        if (criticalSince === null) {
            criticalSince = currentTime;

            showFeedback(
                'PERIGO! Você tem 3 segundos para salvar Draco!',
                3000
            );

            return;
        }

        if (currentTime - criticalSince >= criticalGraceTime) {
            currentState = GAME_STATES.GAME_OVER;
            return;
        }
    } else {
        criticalSince = null;
    }

    const averageStats = getAverageStats();

    if (lowestStat >= 70) {
        coreStability = clamp(coreStability + 2);
    } else if (lowestStat >= 40) {
        coreStability = clamp(coreStability + 1);
    } else if (averageStats < 45) {
        coreStability = clamp(coreStability - 2);
    }

    if (coreStability >= 100) {
        currentState = GAME_STATES.VICTORY;
    }
}

function updateCorruptedFragment(currentTime) {
    if (currentState !== GAME_STATES.PLAYING) {
        return;
    }

    if (
        !corruptedFragment &&
        currentTime >= nextFragmentTime
    ) {
        createCorruptedFragment(currentTime);
        return;
    }

    if (
        corruptedFragment &&
        currentTime >= corruptedFragment.expiresAt
    ) {
        corruptedFragment = null;

        dracoStats.energia = clamp(
            dracoStats.energia - 15
        );

        coreStability = clamp(
            coreStability - 8
        );

        showFeedback(
            'A falha se espalhou! Draco perdeu energia.',
            2400
        );

        scheduleNextFragment(currentTime);
    }

    if (corruptedFragment) {
        corruptedFragment.pulse += 0.08;
        corruptedFragment.rotation += 0.01;
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
        'Mantenha Draco saudável e restaure o núcleo até 100%.',
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

function drawGameplayBackground() {
    const currentTime = performance.now();

    // Brilho central do Núcleo Arcadia
    const coreGradient = ctx.createRadialGradient(
        WIDTH / 2,
        330,
        20,
        WIDTH / 2,
        330,
        280
    );

    coreGradient.addColorStop(
        0,
        'rgba(95, 211, 255, 0.14)'
    );

    coreGradient.addColorStop(
        1,
        'rgba(19, 34, 56, 0)'
    );

    ctx.fillStyle = coreGradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Linhas de circuito no chão
    ctx.save();

    ctx.strokeStyle = 'rgba(95, 211, 255, 0.15)';
    ctx.lineWidth = 2;

    for (let index = 0; index < 7; index++) {
        const y = 300 + index * 25;

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WIDTH, y);
        ctx.stroke();
    }

    for (let index = 0; index < 10; index++) {
        const x = index * 90;

        ctx.beginPath();
        ctx.moveTo(x, 300);
        ctx.lineTo(x + 40, 475);
        ctx.stroke();
    }

    ctx.restore();

    // Cristais decorativos
    drawDigitalCrystal(
        350,
        400,
        22,
        COLORS.softPurple,
        currentTime
    );

    drawDigitalCrystal(
        730,
        345,
        16,
        COLORS.neonBlue,
        currentTime + 700
    );

    drawDigitalCrystal(
        330,
        270,
        12,
        COLORS.coral,
        currentTime + 1300
    );

    // Plataforma onde Draco fica
    ctx.save();

    ctx.shadowColor = COLORS.neonBlue;
    ctx.shadowBlur = 25;

    ctx.fillStyle = 'rgba(5, 8, 13, 0.85)';
    ctx.strokeStyle = 'rgba(95, 211, 255, 0.8)';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.ellipse(
        WIDTH / 2,
        420,
        115,
        30,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // Núcleo ao fundo
    drawArcadiaCore(currentTime);
}

function drawArcadiaCore(currentTime) {
    const pulse =
        1 + Math.sin(currentTime * 0.003) * 0.08;

    const x = 650;
    const y = 205;

    ctx.save();

    ctx.translate(x, y);
    ctx.scale(pulse, pulse);

    ctx.shadowColor = COLORS.neonBlue;
    ctx.shadowBlur = 30;

    ctx.strokeStyle = COLORS.neonBlue;
    ctx.lineWidth = 3;

    ctx.fillStyle = 'rgba(95, 211, 255, 0.12)';

    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.rotate(currentTime * 0.0006);

    ctx.beginPath();

    for (let index = 0; index < 6; index++) {
        const angle =
            index * (Math.PI * 2 / 6);

        const outerX =
            Math.cos(angle) * 66;

        const outerY =
            Math.sin(angle) * 66;

        const innerX =
            Math.cos(angle) * 48;

        const innerY =
            Math.sin(angle) * 48;

        ctx.moveTo(innerX, innerY);
        ctx.lineTo(outerX, outerY);
    }

    ctx.stroke();

    ctx.restore();

    ctx.fillStyle = COLORS.iceWhite;
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.textAlign = 'center';

    ctx.fillText(
        'NÚCLEO',
        x,
        y + 90
    );

    ctx.textAlign = 'left';
}

function drawDigitalCrystal(
    x,
    y,
    size,
    color,
    currentTime
) {
    const floating =
        Math.sin(currentTime * 0.003) * 5;

    ctx.save();

    ctx.translate(x, y + floating);

    ctx.shadowColor = color;
    ctx.shadowBlur = 18;

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.65;

    ctx.beginPath();

    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.65, 0);
    ctx.lineTo(0, size);
    ctx.lineTo(-size * 0.65, 0);

    ctx.closePath();
    ctx.fill();

    ctx.restore();
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

    drawPanel(500, 20, 280, 90);

ctx.fillStyle = COLORS.iceWhite;
ctx.font = 'bold 15px "Courier New", Courier, monospace';

ctx.fillText(
    `Estabilidade do Núcleo: ${coreStability}%`,
    520,
    52
);

drawProgressBar(
    520,
    68,
    235,
    18,
    coreStability,
    COLORS.neonBlue
);
}

function drawDraco() {
    const currentTime = performance.now();
    const mood = getDracoMood();

    const breathing =
        Math.sin(currentTime * 0.004) * 3;

    let jumpOffset = 0;
    let rotation = 0;
    let scaleX = 1;
    let scaleY = 1;

    if (dracoAction === 'playing') {
        jumpOffset =
            -Math.abs(Math.sin(currentTime * 0.012)) * 28;

        rotation =
            Math.sin(currentTime * 0.014) * 0.12;
    }

    if (dracoAction === 'eating') {
        scaleX =
            1 + Math.sin(currentTime * 0.025) * 0.08;

        scaleY =
            1 - Math.sin(currentTime * 0.025) * 0.05;
    }

    if (dracoAction === 'cleaning') {
        rotation =
            Math.sin(currentTime * 0.025) * 0.08;
    }

    if (dracoAction === 'sleeping') {
        scaleY = 0.78;
        jumpOffset = 15;
    }

   const centerX = draco.x + draco.width / 2;

const centerY =
    draco.y +
    draco.height / 2 +
    breathing +
    jumpOffset;

// Desenha a sombra sem alterar o restante do Canvas
ctx.save();

ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';

ctx.beginPath();

ctx.ellipse(
    centerX,
    draco.y + draco.height + 45,
    48,
    13,
    0,
    0,
    Math.PI * 2
);

ctx.fill();
ctx.restore();


// Salva o contexto usado para desenhar o Draco
ctx.save();

ctx.translate(centerX, centerY);
ctx.rotate(rotation);
ctx.scale(scaleX, scaleY);

ctx.shadowColor =
    mood === 'sad'
        ? COLORS.softPurple
        : COLORS.neonBlue;

ctx.shadowBlur = 28;

    // Cauda
    ctx.fillStyle = '#459BC4';

    ctx.beginPath();
    ctx.moveTo(-28, 20);
    ctx.quadraticCurveTo(-70, 20, -62, -15);
    ctx.quadraticCurveTo(-45, 2, -25, 0);
    ctx.closePath();
    ctx.fill();

    // Asas
    ctx.fillStyle = COLORS.softPurple;

    ctx.beginPath();
    ctx.moveTo(-25, -5);
    ctx.lineTo(-58, -30);
    ctx.lineTo(-47, 10);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(25, -5);
    ctx.lineTo(58, -30);
    ctx.lineTo(47, 10);
    ctx.closePath();
    ctx.fill();

    // Corpo
    ctx.fillStyle =
        mood === 'sad'
            ? '#6684B5'
            : draco.color;

    ctx.beginPath();
    ctx.ellipse(
        0,
        8,
        39,
        35,
        0,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Cabeça
    ctx.beginPath();
    ctx.ellipse(
        0,
        -23,
        35,
        30,
        0,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Chifres
    ctx.fillStyle = COLORS.iceWhite;

    ctx.beginPath();
    ctx.moveTo(-21, -46);
    ctx.lineTo(-15, -66);
    ctx.lineTo(-6, -45);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(21, -46);
    ctx.lineTo(15, -66);
    ctx.lineTo(6, -45);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    drawDracoFace(mood, currentTime);

    function drawDracoFace(mood, currentTime) {
    const blinking = currentTime < dracoBlinkUntil;

    ctx.strokeStyle = COLORS.background;
    ctx.fillStyle = COLORS.background;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    if (mood === 'sleeping') {
        // Olhos fechados
        ctx.beginPath();

        ctx.moveTo(-20, -25);
        ctx.lineTo(-8, -25);

        ctx.moveTo(8, -25);
        ctx.lineTo(20, -25);

        ctx.stroke();

        // Boca tranquila
        ctx.beginPath();
        ctx.arc(0, -8, 7, 0, Math.PI);
        ctx.stroke();

        return;
    }

    if (blinking) {
        ctx.beginPath();

        ctx.moveTo(-21, -25);
        ctx.lineTo(-8, -25);

        ctx.moveTo(8, -25);
        ctx.lineTo(21, -25);

        ctx.stroke();
    } else if (mood === 'tired') {
        ctx.beginPath();

        ctx.moveTo(-21, -22);
        ctx.lineTo(-8, -25);

        ctx.moveTo(8, -25);
        ctx.lineTo(21, -22);

        ctx.stroke();
    } else {
        // Olhos
        ctx.beginPath();
        ctx.arc(-14, -25, 5, 0, Math.PI * 2);
        ctx.arc(14, -25, 5, 0, Math.PI * 2);
        ctx.fill();

        // Brilho dos olhos
        ctx.fillStyle = COLORS.iceWhite;

        ctx.beginPath();
        ctx.arc(-12, -27, 1.8, 0, Math.PI * 2);
        ctx.arc(16, -27, 1.8, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.strokeStyle = COLORS.coral;
    ctx.lineWidth = 4;

    if (mood === 'happy') {
        ctx.beginPath();
        ctx.arc(
            0,
            -10,
            11,
            0.1,
            Math.PI - 0.1
        );
        ctx.stroke();
    } else if (mood === 'sad') {
        ctx.beginPath();
        ctx.arc(
            0,
            1,
            10,
            Math.PI + 0.15,
            Math.PI * 2 - 0.15
        );
        ctx.stroke();
    } else if (mood === 'tired') {
        ctx.beginPath();
        ctx.arc(
            0,
            -8,
            6,
            0,
            Math.PI * 2
        );
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.moveTo(-7, -9);
        ctx.lineTo(7, -9);
        ctx.stroke();
    }
}

    function drawDracoReaction(currentTime) {
    const centerX = draco.x + draco.width / 2;
    const centerY = draco.y - 20;

    if (dracoAction === 'playing') {
        const heartY =
            centerY -
            25 -
            Math.abs(Math.sin(currentTime * 0.008)) * 15;

        drawHeart(centerX + 45, heartY, 10);
        drawHeart(centerX - 45, heartY + 12, 7);
    }

    if (dracoAction === 'eating') {
        ctx.save();

        ctx.fillStyle = COLORS.coral;
        ctx.font = 'bold 26px "Courier New", monospace';
        ctx.textAlign = 'center';

        ctx.fillText(
            '♥',
            centerX,
            centerY - 30
        );

        ctx.restore();
    }

    if (dracoAction === 'cleaning') {
        for (let index = 0; index < 5; index++) {
            const angle =
                currentTime * 0.003 +
                index * 1.25;

            const bubbleX =
                centerX + Math.cos(angle) * 55;

            const bubbleY =
                centerY + 35 + Math.sin(angle) * 35;

            ctx.strokeStyle =
                'rgba(234, 247, 255, 0.75)';

            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.arc(
                bubbleX,
                bubbleY,
                4 + index,
                0,
                Math.PI * 2
            );
            ctx.stroke();
        }
    }

    if (dracoAction === 'sleeping') {
        ctx.save();

        ctx.fillStyle = COLORS.iceWhite;
        ctx.font = 'bold 18px "Courier New", monospace';

        const floating =
            Math.sin(currentTime * 0.004) * 5;

        ctx.fillText(
            'Z',
            centerX + 40,
            centerY - 20 + floating
        );

        ctx.font = 'bold 25px "Courier New", monospace';

        ctx.fillText(
            'Z',
            centerX + 58,
            centerY - 43 + floating
        );

        ctx.restore();
    }
}

function drawHeart(x, y, size) {
    ctx.save();

    ctx.fillStyle = COLORS.coral;
    ctx.shadowColor = COLORS.coral;
    ctx.shadowBlur = 10;

    ctx.beginPath();

    ctx.moveTo(x, y + size / 3);

    ctx.bezierCurveTo(
        x - size,
        y - size / 2,
        x - size * 1.4,
        y + size / 2,
        x,
        y + size
    );

    ctx.bezierCurveTo(
        x + size * 1.4,
        y + size / 2,
        x + size,
        y - size / 2,
        x,
        y + size / 3
    );

    ctx.fill();
    ctx.restore();
}

    ctx.restore();

    drawDracoReaction(currentTime);
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

function drawCorruptedFragment() {
    if (!corruptedFragment) {
        return;
    }

    const fragment = corruptedFragment;

    const pulseScale =
        1 + Math.sin(fragment.pulse) * 0.12;

    const remainingTime =
        Math.max(
            0,
            fragment.expiresAt - performance.now()
        );

    const remainingPercentage =
        remainingTime / fragmentDuration;

    ctx.save();

    ctx.translate(
        fragment.x + fragment.size / 2,
        fragment.y + fragment.size / 2
    );

    ctx.rotate(fragment.rotation);
    ctx.scale(pulseScale, pulseScale);

    ctx.shadowColor = COLORS.danger;
    ctx.shadowBlur = 30;

    ctx.fillStyle = 'rgba(214, 64, 69, 0.85)';
    ctx.strokeStyle = COLORS.coral;
    ctx.lineWidth = 4;

    ctx.beginPath();

    ctx.moveTo(0, -fragment.size / 2);
    ctx.lineTo(fragment.size / 2, 0);
    ctx.lineTo(0, fragment.size / 2);
    ctx.lineTo(-fragment.size / 2, 0);

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = COLORS.iceWhite;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(-10, -14);
    ctx.lineTo(10, 14);

    ctx.moveTo(12, -12);
    ctx.lineTo(-12, 12);

    ctx.stroke();

    ctx.restore();

    drawProgressBar(
        fragment.x,
        fragment.y + fragment.size + 10,
        fragment.size,
        7,
        remainingPercentage * 100,
        COLORS.danger
    );
}

function drawDangerOverlay() {
    const lowestStat = Math.min(
        dracoStats.fome,
        dracoStats.higiene,
        dracoStats.felicidade,
        dracoStats.energia
    );

    if (lowestStat > 35) {
        return;
    }

    const currentTime = performance.now();

    const opacity =
        lowestStat <= 15
            ? 0.16 + Math.sin(currentTime * 0.012) * 0.07
            : 0.07;

    ctx.fillStyle =
        `rgba(214, 64, 69, ${opacity})`;

    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    if (lowestStat <= 15) {
        ctx.strokeStyle =
            'rgba(255, 142, 142, 0.6)';

        ctx.lineWidth = 3;

        for (let index = 0; index < 5; index++) {
            const y =
                Math.random() * HEIGHT;

            ctx.beginPath();

            ctx.moveTo(
                0,
                y
            );

            ctx.lineTo(
                WIDTH,
                y + randomBetween(-10, 10)
            );

            ctx.stroke();
        }
    }
}

function drawGameplay() {
    drawGameplayBackground();
    drawHUD();
    drawCorruptedFragment();
    drawDraco();
    drawDangerOverlay();
    drawFeedback();

    drawCenteredText(
        'DRACO',
        290,
        18,
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

    drawButton(buttons.endMenu, {
        backgroundColor: COLORS.backgroundLight,
        textColor: COLORS.iceWhite,
        borderColor: COLORS.neonBlue
    });
}

function isPointInsideFragment(x, y) {
    if (!corruptedFragment) {
        return false;
    }

    const centerX =
        corruptedFragment.x +
        corruptedFragment.size / 2;

    const centerY =
        corruptedFragment.y +
        corruptedFragment.size / 2;

    const distance = Math.hypot(
        x - centerX,
        y - centerY
    );

    return distance <= corruptedFragment.size * 0.7;
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

        criticalSince = null;
        lastStatsUpdate = performance.now();

        setDracoAction('eating', 1100);
        showFeedback('Draco foi alimentado!');
        return;
    }

    if (isPointInsideFragment(mouseX, mouseY)) {
    corruptedFragment = null;

    coreStability = clamp(
        coreStability + 10
    );

    dracoStats.felicidade = clamp(
        dracoStats.felicidade + 5
    );

    showFeedback(
        'Fragmento estabilizado! +10% de estabilidade',
        2200
    );

    scheduleNextFragment(performance.now());

    return;
}

    if (isPointInsideButton(mouseX, mouseY, buttons.clean)) {
        dracoStats.higiene = clamp(dracoStats.higiene + 35);

        criticalSince = null;
        lastStatsUpdate = performance.now();

        setDracoAction('cleaning', 1500);
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

        criticalSince = null;
        lastStatsUpdate = performance.now();

        setDracoAction('playing', 2000);
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

        criticalSince = null;
        lastStatsUpdate = performance.now();

        setDracoAction('sleeping', 2000);
        showFeedback('Draco descansou e recuperou energia.');
    }

    return;
}

    if (
        currentState === GAME_STATES.GAME_OVER ||
        currentState === GAME_STATES.VICTORY
    ) {
        if (isPointInsideButton(mouseX, mouseY, buttons.restart)) {
            startTutorial();
            return;
        }

        if (isPointInsideButton(mouseX, mouseY, buttons.endMenu)) {
            currentState = GAME_STATES.MENU;
        }
    }
});

function drawVictory() {
    const victoryGradient = ctx.createRadialGradient(
        WIDTH / 2,
        HEIGHT / 2,
        20,
        WIDTH / 2,
        HEIGHT / 2,
        430
    );

    victoryGradient.addColorStop(
        0,
        'rgba(116, 227, 154, 0.45)'
    );

    victoryGradient.addColorStop(
        1,
        'rgba(19, 34, 56, 0.95)'
    );

    ctx.fillStyle = victoryGradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    drawPanel(90, 85, 620, 430);

    drawCenteredText(
        'NÚCLEO RESTAURADO',
        165,
        40,
        COLORS.success,
        'bold'
    );

    drawCenteredText(
        'Draco alcançou a energia necessária',
        235,
        19,
        COLORS.iceWhite
    );

    drawCenteredText(
        'para estabilizar o Núcleo Arcadia.',
        270,
        19,
        COLORS.iceWhite
    );

    drawCenteredText(
        'O vínculo entre vocês salvou este mundo.',
        330,
        20,
        COLORS.neonBlue,
        'bold'
    );

    drawCenteredText(
        'DEMO CONCLUÍDA',
        380,
        24,
        COLORS.coral,
        'bold'
    );

    drawButton(buttons.restart, {
        backgroundColor: COLORS.success,
        textColor: COLORS.darkText
    });

    drawButton(buttons.endMenu, {
        backgroundColor: COLORS.backgroundLight,
        textColor: COLORS.iceWhite,
        borderColor: COLORS.neonBlue
    });
}

function update(currentTime) {
    updateParticles();
    updateStats(currentTime);
    updateCorruptedFragment(currentTime);
    updateDracoAnimation(currentTime);

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

        case GAME_STATES.VICTORY:
            drawVictory();
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