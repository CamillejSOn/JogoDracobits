window.DracoBits = {
    canvas: document.getElementById('gameCanvas'),
    ctx: null,
    WIDTH: 800,
    HEIGHT: 600,
    COLORS: {
        background: '#132238', backgroundLight: '#1D3655', neonBlue: '#5FD3FF',
        softPurple: '#7B6DCC', iceWhite: '#EAF7FF', coral: '#FF8E8E',
        darkText: '#132238', danger: '#D64045', success: '#74E39A', warning: '#FFD166'
    },
    STATES: {
        RATING: 'rating', MENU: 'menu', HELP: 'help', CREDITS: 'credits',
        TUTORIAL: 'tutorial', PLAYING: 'playing', GAME_OVER: 'gameover', VICTORY: 'victory'
    },
    state: {
        screen: 'rating', tutorialPage: 0, ratingStartedAt: performance.now(),
        stats: { fome: 100, higiene: 100, felicidade: 100, energia: 100 },
        stability: 0, level: 1, feedback: '', feedbackUntil: 0,
        lastStatsUpdate: performance.now(), criticalSince: null,
        fragment: null, nextFragmentAt: performance.now() + 5000,
        crystal: null, nextCrystalAt: performance.now() + 11000,
        combo: 0, comboUntil: 0, lastComboAction: '',
        dracoAction: 'idle', dracoActionUntil: 0, blinkUntil: 0,
        nextBlinkAt: performance.now() + 2500, dracoX: 400, dracoDirection: 1,
        dracoMovingUntil: 0, nextDracoDecisionAt: performance.now() + 1200,
        echoMessage: '', echoUntil: 0, lastEchoMilestone: 0, shake: 0
    },
    constants: {
        ratingDuration: 3500, statsInterval: 1000, criticalGrace: 3000,
        fragmentDuration: 3500, fragmentMinInterval: 4500, fragmentMaxInterval: 7500,
        crystalDuration: 5200, crystalMinInterval: 10000, crystalMaxInterval: 16000,
        comboWindow: 5200
    },
    buttons: {
        menuPlay: { x: 280, y: 300, width: 240, height: 52, label: 'NOVO JOGO' },
        menuHelp: { x: 280, y: 370, width: 240, height: 52, label: 'COMO JOGAR' },
        menuCredits: { x: 280, y: 440, width: 240, height: 52, label: 'CRÉDITOS' },
        back: { x: 300, y: 510, width: 200, height: 48, label: 'VOLTAR' },
        tutorialNext: { x: 300, y: 475, width: 200, height: 50, label: 'CONTINUAR' },
        feed: { x: 45, y: 505, width: 160, height: 48, label: '🍖 ALIMENTAR' },
        clean: { x: 225, y: 505, width: 160, height: 48, label: '🫧 LIMPAR' },
        play: { x: 405, y: 505, width: 160, height: 48, label: '★ BRINCAR' },
        sleep: { x: 585, y: 505, width: 160, height: 48, label: '☾ DORMIR' },
        restart: { x: 180, y: 440, width: 200, height: 50, label: 'TENTAR NOVAMENTE' },
        endMenu: { x: 420, y: 440, width: 200, height: 50, label: 'MENU PRINCIPAL' }
    },
    tutorial: [
        { title: 'ECHO // CONEXÃO INICIADA', lines: ['Bem-vindo ao Núcleo Arcadia.', 'Este é Draco, uma das últimas criaturas digitais.', 'Ele depende dos seus cuidados para sobreviver.'] },
        { title: 'NECESSIDADES E FALHAS', lines: ['As necessidades de Draco diminuem com o tempo.', 'Fragmentos corrompidos surgirão pelo cenário.', 'Clique neles antes que a falha se espalhe.'] },
        { title: 'CRISTAIS E COMBOS', lines: ['Cristais oferecem bônus temporários.', 'Alterne suas ações para formar combos.', 'Combos completos aceleram a restauração.'] },
        { title: 'SUA MISSÃO', lines: ['Mantenha Draco saudável para restaurar o núcleo.', 'A dificuldade aumenta conforme você progride.', 'Alcance 100% de estabilidade para vencer.'] }
    ],
    particles: []
};
DracoBits.ctx = DracoBits.canvas.getContext('2d');
DracoBits.WIDTH = DracoBits.canvas.width;
DracoBits.HEIGHT = DracoBits.canvas.height;
