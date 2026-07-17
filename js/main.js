(() => {
    const G = DracoBits, ctx = G.ctx, C = G.COLORS, B = G.buttons;

    function rating() {
        G.panel(190, 100, 420, 400);
        ctx.fillStyle = '#4CAF50';
        G.roundRect(325, 145, 150, 150, 18);
        ctx.fill();
        G.centerText('L', 220, 100, '#fff', 'bold');
        G.centerText('CLASSIFICAÇÃO INDICATIVA', 340, 25, C.iceWhite, 'bold');
        G.centerText('LIVRE', 385, 35, C.success, 'bold');
        G.centerText('Não contém conteúdo impróprio.', 435, 18);
        G.centerText('Aguarde...', 475, 15, C.neonBlue);
    }

    function menu(now) {
        const pulse = 1 + Math.sin(now * 0.003) * 0.025;
        ctx.save();
        ctx.translate(G.WIDTH / 2, 115);
        ctx.scale(pulse, pulse);
        ctx.translate(-G.WIDTH / 2, -115);
        G.centerText('DRACOBITS', 115, 64, C.neonBlue, 'bold');
        ctx.restore();
        G.centerText('A ÚLTIMA CENTELHA DE ARCADIA', 170, 18, C.coral, 'bold');
        G.centerText('Cuide. Proteja. Evolua.', 205, 15, 'rgba(234,247,255,.78)');

        ctx.save();
        ctx.shadowColor = C.neonBlue;
        ctx.shadowBlur = 18 + Math.sin(now * 0.004) * 7;
        G.panel(240, 250, 320, 290);
        ctx.restore();
        G.button(B.menuPlay);
        G.button(B.menuHelp, C.softPurple, C.iceWhite);
        G.button(B.menuCredits, C.backgroundLight, C.iceWhite, C.neonBlue);
        G.centerText('Núcleo Arcadia // aguardando conexão', 535, 13, 'rgba(234,247,255,.68)');
    }

    function help() {
        G.centerText('COMO JOGAR', 55, 34, C.neonBlue, 'bold');
        G.panel(70, 85, 660, 405);
        G.centerText('OBJETIVO', 120, 21, C.coral, 'bold');
        G.centerText('Mantenha Draco saudável e restaure o núcleo até 100%.', 152, 15);
        G.centerText('AÇÕES', 195, 21, C.coral, 'bold');
        ['ALIMENTAR — recupera fome.', 'LIMPAR — recupera higiene.', 'BRINCAR — recupera felicidade e gasta energia.', 'DORMIR — recupera energia, mas aumenta a fome.'].forEach((text, index) => G.centerText(text, 228 + index * 29, 15));
        G.centerText('Fragmentos vermelhos: clique antes que desapareçam.', 365, 15, C.warning);
        G.centerText('Cristais verdes: capture para receber bônus.', 394, 15, C.success);
        G.centerText('Alterne ações para completar combos.', 423, 15, C.neonBlue);
        G.centerText('A demo possui 4 fases e fica mais difícil a cada 25%.', 452, 13, C.coral);
        G.centerText('Pressione M ou use o botão para ligar/desligar o áudio.', 474, 12, 'rgba(234,247,255,.75)');
        G.button(B.back, C.softPurple, C.iceWhite);
    }

    function credits() {
        G.centerText('CRÉDITOS', 70, 36, C.neonBlue, 'bold');
        G.panel(105, 105, 590, 385);
        G.centerText('DESIGN E DESENVOLVIMENTO', 150, 19, C.coral, 'bold');
        G.centerText('Camille Silva', 188, 20);
        G.centerText('PROJETO ACADÊMICO', 270, 19, C.coral, 'bold');
        G.centerText('Design e Desenvolvimento de Jogos — UFOP', 307, 16);
        G.centerText('ÁUDIO', 355, 19, C.coral, 'bold');
        G.centerText('Efeitos sintetizados em tempo real com Web Audio API', 387, 14);
        G.centerText('Sem uso de arquivos de áudio de terceiros', 415, 14, C.success);
        G.centerText('2026', 455, 16, C.neonBlue);
        G.button(B.back, C.softPurple, C.iceWhite);
    }

    function tutorial() {
        const message = G.tutorial[G.state.tutorialPage];
        G.centerText('TRANSMISSÃO DE ECHO', 75, 34, C.neonBlue, 'bold');
        G.panel(85, 125, 630, 330);
        ctx.strokeStyle = C.softPurple;
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(170, 285, 60, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(123,109,204,.25)';
        ctx.beginPath(); ctx.arc(170, 285, 48, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = C.neonBlue;
        ctx.fillRect(146, 270, 12, 12); ctx.fillRect(182, 270, 12, 12);
        ctx.fillStyle = C.coral;
        ctx.font = 'bold 20px Courier New';
        ctx.fillText(message.title, 270, 205);
        message.lines.forEach((line, index) => {
            ctx.fillStyle = C.iceWhite;
            ctx.font = '17px Courier New';
            ctx.fillText(line, 270, 255 + index * 42);
        });
        B.tutorialNext.label = G.state.tutorialPage === G.tutorial.length - 1 ? 'INICIAR DEMO' : 'CONTINUAR';
        G.button(B.tutorialNext, C.softPurple, C.iceWhite);
        G.centerText(`${G.state.tutorialPage + 1} / ${G.tutorial.length}`, 555, 14, 'rgba(234,247,255,.7)');
    }

    function gameplay(now) {
        const shake = G.state.shake;
        ctx.save();
        if (shake > 0.5) ctx.translate(G.random(-shake, shake), G.random(-shake, shake));
        G.drawWorld(now);
        G.drawHUD(now);
        G.drawFragment(now);
        G.drawCrystal(now);
        G.drawDraco(now);
        G.drawDanger(now);
        G.drawEcho(now);
        G.drawFeedback(now);
        G.centerText('DRACO // GUARDIÃO DIGITAL', 290, 18, C.neonBlue, 'bold');
        G.button(B.feed);
        G.button(B.clean);
        G.button(B.play, C.softPurple, C.iceWhite);
        G.button(B.sleep, C.backgroundLight, C.iceWhite, C.neonBlue);
        ctx.restore();
    }

    function drawVictory(now) {
        const elapsed = now - G.state.victoryStartedAt;
        const progress = Math.min(1, elapsed / 5200);
        const flash = Math.max(0, 1 - elapsed / 700);
        const ring = 40 + progress * 230;

        ctx.fillStyle = `rgba(8,38,48,${0.85 - progress * 0.2})`;
        ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);

        ctx.save();
        ctx.translate(G.WIDTH / 2, 270);
        ctx.strokeStyle = `rgba(116,227,154,${0.35 + progress * 0.65})`;
        ctx.lineWidth = 5;
        ctx.shadowColor = C.success;
        ctx.shadowBlur = 35;
        ctx.beginPath();
        ctx.arc(0, 0, ring, 0, Math.PI * 2);
        ctx.stroke();
        for (let index = 0; index < 18; index++) {
            const angle = index * Math.PI * 2 / 18 + now * 0.0005;
            const distance = 55 + progress * 180;
            ctx.fillStyle = index % 2 ? C.neonBlue : C.success;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * distance, Math.sin(angle) * distance, 2 + progress * 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        if (elapsed > 900) G.centerText('NÚCLEO RESTAURADO', 135, 40, C.success, 'bold');
        if (elapsed > 1900) G.centerText('Draco estabilizou o Núcleo Arcadia.', 205, 18);
        if (elapsed > 2800) G.centerText('ECHO: Conseguimos... obrigado.', 345, 19, C.neonBlue, 'bold');
        if (elapsed > 3700) G.centerText('O vínculo entre vocês salvou este mundo.', 390, 18);
        if (elapsed > 4500) G.centerText('DEMO CONCLUÍDA', 435, 25, C.coral, 'bold');
        if (elapsed > 5200) {
            G.button(B.restart, C.success, C.darkText);
            G.button(B.endMenu, C.backgroundLight, C.iceWhite, C.neonBlue);
        }
        if (flash > 0) {
            ctx.fillStyle = `rgba(234,247,255,${flash})`;
            ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);
        }
    }

    function drawGameOver(now) {
        const elapsed = now - G.state.gameOverStartedAt;
        const alpha = Math.min(0.88, elapsed / 900 * 0.88);
        ctx.fillStyle = `rgba(90,5,15,${alpha})`;
        ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);
        G.panel(90, 85, 620, 430);
        G.centerText('COLAPSO DO SISTEMA', 165, 40, C.coral, 'bold');
        G.centerText('Uma necessidade de Draco permaneceu em zero.', 245, 18);
        G.centerText('O sistema não resistiu à instabilidade.', 300, 19, C.neonBlue, 'bold');
        G.centerText('TENTE NOVAMENTE', 370, 24, C.coral, 'bold');
        G.button(B.restart, C.coral, C.darkText);
        G.button(B.endMenu, C.backgroundLight, C.iceWhite, C.neonBlue);
    }

    function drawPhaseTransition(now) {
        if (G.state.screen !== G.STATES.PLAYING || now >= G.state.phaseTransitionUntil) return;

        const remaining = G.state.phaseTransitionUntil - now;
        const alpha = Math.min(.88, Math.max(.35, remaining / 900));

        ctx.save();
        ctx.fillStyle = `rgba(3,7,13,${alpha})`;
        ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);

        const colors = [C.success, C.warning, C.coral, C.neonBlue];
        const color = colors[G.state.level - 1];

        ctx.shadowColor = color;
        ctx.shadowBlur = 30;
        G.panel(95, 185, 610, 220);
        G.centerText(G.state.phaseTitle, 255, 30, color, 'bold');
        G.centerText(G.state.phaseSubtitle, 310, 17, C.iceWhite);
        G.centerText(`Dificuldade ${G.state.level}/4`, 356, 14, 'rgba(234,247,255,.72)');
        ctx.restore();
    }

    function drawAudioButton() {
        G.button(B.audio, 'rgba(5,8,13,.82)', C.iceWhite, G.state.audioEnabled ? C.success : C.danger);
    }

    function drawTransition() {
        if (G.state.transitionAlpha <= 0) return;
        ctx.fillStyle = `rgba(3,7,13,${G.state.transitionAlpha})`;
        ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);
    }

    function update(now) {
        G.updateParticles();
        G.updateGameplay(now);
        G.updateDraco(now);
        G.updateAudio(now);
        G.state.transitionAlpha = Math.max(0, G.state.transitionAlpha - 0.035);
        if (G.state.screen === G.STATES.RATING && now - G.state.ratingStartedAt >= G.constants.ratingDuration) G.goTo(G.STATES.MENU);
    }

    function draw(now) {
        G.drawBase();
        const screen = G.state.screen;
        if (screen === G.STATES.RATING) rating();
        else if (screen === G.STATES.MENU) menu(now);
        else if (screen === G.STATES.HELP) help();
        else if (screen === G.STATES.CREDITS) credits();
        else if (screen === G.STATES.TUTORIAL) tutorial();
        else if (screen === G.STATES.PLAYING) gameplay(now);
        else if (screen === G.STATES.GAME_OVER) drawGameOver(now);
        else if (screen === G.STATES.VICTORY) drawVictory(now);
        drawPhaseTransition(now);
        if (screen !== G.STATES.RATING) drawAudioButton();
        drawTransition();
    }

    G.canvas.addEventListener('mousedown', event => {
        G.initAudio();
        const rect = G.canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) * G.WIDTH / rect.width;
        const y = (event.clientY - rect.top) * G.HEIGHT / rect.height;
        const screen = G.state.screen;

        if (G.pointIn(x, y, B.audio)) {
            G.toggleAudio();
            return;
        }

        G.sound('click');

        if (screen === G.STATES.MENU) {
            if (G.pointIn(x, y, B.menuPlay)) {
                G.state.tutorialPage = 0;
                G.goTo(G.STATES.TUTORIAL);
            } else if (G.pointIn(x, y, B.menuHelp)) G.goTo(G.STATES.HELP);
            else if (G.pointIn(x, y, B.menuCredits)) G.goTo(G.STATES.CREDITS);
            return;
        }

        if (screen === G.STATES.HELP || screen === G.STATES.CREDITS) {
            if (G.pointIn(x, y, B.back)) G.goTo(G.STATES.MENU);
            return;
        }

        if (screen === G.STATES.TUTORIAL) {
            if (G.pointIn(x, y, B.tutorialNext)) {
                if (G.state.tutorialPage < G.tutorial.length - 1) G.state.tutorialPage++;
                else G.resetGame();
            }
            return;
        }

        if (screen === G.STATES.PLAYING) {
            const now = performance.now();
            if (now < G.state.phaseTransitionUntil) return;
            if (G.hitCrystal(x, y)) G.collectCrystal(now);
            else if (G.hitFragment(x, y)) G.resolveFragment(now);
            else if (G.pointIn(x, y, B.feed)) G.performAction('feed');
            else if (G.pointIn(x, y, B.clean)) G.performAction('clean');
            else if (G.pointIn(x, y, B.play)) G.performAction('play');
            else if (G.pointIn(x, y, B.sleep)) G.performAction('sleep');
            return;
        }

        if (screen === G.STATES.GAME_OVER || screen === G.STATES.VICTORY) {
            if (screen === G.STATES.VICTORY && performance.now() - G.state.victoryStartedAt < 5200) return;
            if (G.pointIn(x, y, B.restart)) {
                G.state.tutorialPage = 0;
                G.goTo(G.STATES.TUTORIAL);
            } else if (G.pointIn(x, y, B.endMenu)) G.goTo(G.STATES.MENU);
        }
    });

    window.addEventListener('keydown', event => {
        if (event.key.toLowerCase() === 'm') G.toggleAudio();
    });

    function loop(now) {
        update(now);
        draw(now);
        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
})();
