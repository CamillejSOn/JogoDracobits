(() => {
    const G = DracoBits;
    G.clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
    G.random = (min, max) => Math.random() * (max - min) + min;
    G.averageStats = () => Object.values(G.state.stats).reduce((a, b) => a + b, 0) / 4;
    G.lowestStat = () => Math.min(...Object.values(G.state.stats));
    G.showFeedback = (text, duration = 1700) => {
        G.state.feedback = text;
        G.state.feedbackUntil = performance.now() + duration;
    };
    G.showEcho = (text, duration = 2500) => {
        G.state.echoMessage = text;
        G.state.echoUntil = performance.now() + duration;
    };
    G.setDracoAction = (action, duration = 1000) => {
        G.state.dracoAction = action;
        G.state.dracoActionUntil = performance.now() + duration;
    };

    G.goTo = screen => {
        const now = performance.now();
        G.state.screen = screen;
        G.state.screenStartedAt = now;
        G.state.transitionAlpha = 1;
        if (screen === G.STATES.VICTORY) G.state.victoryStartedAt = now;
        if (screen === G.STATES.GAME_OVER) G.state.gameOverStartedAt = now;
    };
    G.pointIn = (x, y, item) => x >= item.x && x <= item.x + item.width && y >= item.y && y <= item.y + item.height;
    G.roundRect = (x, y, w, h, r = 8) => {
        const ctx = G.ctx;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
    };
    G.registerCombo = action => {
        const now = performance.now();
        if (now > G.state.comboUntil || action === G.state.lastComboAction) G.state.combo = 0;
        G.state.combo++;
        G.state.lastComboAction = action;
        G.state.comboUntil = now + G.constants.comboWindow;
        if (G.state.combo >= 4) {
            G.state.stability = G.clamp(G.state.stability + 8);
            G.state.combo = 0;
            G.state.lastComboAction = '';
            G.showFeedback('COMBO COMPLETO! +8% de estabilidade', 2300);
            G.showEcho('Sequência perfeita. O núcleo absorveu a energia.', 2500);
            G.sound('combo');
        }
    };
    G.resetGame = () => {
        const now = performance.now();
        Object.assign(G.state, {
            screen: G.STATES.PLAYING,
            screenStartedAt: now, transitionAlpha: 1, victoryStartedAt: 0, gameOverStartedAt: 0,
            stats: { fome: 100, higiene: 100, felicidade: 100, energia: 100 },
            stability: 0, level: 1, criticalSince: null,
            fragment: null, nextFragmentAt: now + 5000,
            crystal: null, nextCrystalAt: now + 11000,
            combo: 0, comboUntil: 0, lastComboAction: '',
            lastStatsUpdate: now, dracoAction: 'idle', dracoActionUntil: 0,
            blinkUntil: 0, nextBlinkAt: now + 2500, dracoX: 400, dracoDirection: 1,
            dracoMovingUntil: now + 1800, nextDracoDecisionAt: now + 2200,
            lastEchoMilestone: 0, shake: 0, lastAmbientAt: now,
            phaseTitle: 'FASE 1 // ARCADIA INSTÁVEL',
            phaseSubtitle: 'Estabilize Draco e reconecte o núcleo.',
            phaseTransitionUntil: now + 2600
        });
        G.showFeedback('Mantenha Draco saudável!', 2500);
        G.showEcho('Conexão estabelecida. Proteja Draco.', 3000);
    };
})();
