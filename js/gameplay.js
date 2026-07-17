(() => {
    const G = DracoBits, ctx = G.ctx, C = G.COLORS;

    const levelSettings = {
        1: {
            name: 'ARCADIA INSTÁVEL',
            subtitle: 'Reconecte Draco ao núcleo.',
            drain: [3, 2, 2, 1],
            fragmentMin: 5600,
            fragmentMax: 8200,
            fragmentDuration: 4100,
            crystalMin: 9000,
            crystalMax: 14000
        },
        2: {
            name: 'CORRUPÇÃO CRESCENTE',
            subtitle: 'As falhas estão se espalhando.',
            drain: [4, 3, 3, 2],
            fragmentMin: 4200,
            fragmentMax: 6500,
            fragmentDuration: 3400,
            crystalMin: 11000,
            crystalMax: 16000
        },
        3: {
            name: 'COLAPSO IMINENTE',
            subtitle: 'Mantenha Draco vivo sob pressão.',
            drain: [5, 4, 4, 3],
            fragmentMin: 3100,
            fragmentMax: 4800,
            fragmentDuration: 2800,
            crystalMin: 12500,
            crystalMax: 18000
        },
        4: {
            name: 'RECONSTRUÇÃO FINAL',
            subtitle: 'Complete a restauração de Arcadia.',
            drain: [6, 5, 5, 4],
            fragmentMin: 2300,
            fragmentMax: 3600,
            fragmentDuration: 2300,
            crystalMin: 14500,
            crystalMax: 20000
        }
    };

    function phaseFromStability(stability) {
        if (stability >= 75) return 4;
        if (stability >= 50) return 3;
        if (stability >= 25) return 2;
        return 1;
    }

    function updateLevel() {
        const oldLevel = G.state.level;
        const newLevel = Math.max(oldLevel, phaseFromStability(G.state.stability));
        G.state.level = newLevel;

        if (newLevel !== oldLevel) {
            const cfg = levelSettings[newLevel];
            const now = performance.now();

            G.state.phaseTitle = `FASE ${newLevel} // ${cfg.name}`;
            G.state.phaseSubtitle = cfg.subtitle;
            G.state.phaseTransitionUntil = now + 3000;
            G.state.fragment = null;
            G.state.crystal = null;
            G.state.nextFragmentAt = now + 3200;
            G.state.nextCrystalAt = now + cfg.crystalMin;
            G.state.shake = newLevel >= 3 ? 12 : 7;

            G.showFeedback(`FASE ${newLevel} INICIADA`, 2200);
            G.showEcho(
                newLevel === 2
                    ? 'A corrupção está aumentando...'
                    : newLevel === 3
                        ? 'Estamos perdendo Arcadia. Continue!'
                        : 'Última etapa. Reconstrua o núcleo!',
                3000
            );
            G.sound('level');
        }
    }

    function scheduleFragment(now) {
        const cfg = levelSettings[G.state.level];
        G.state.nextFragmentAt = now + G.random(cfg.fragmentMin, cfg.fragmentMax);
    }

    function spawnFragment(now) {
        const cfg = levelSettings[G.state.level];
        const size = G.random(42, 62);
        G.state.fragment = {
            x: G.random(330, G.WIDTH - size - 35),
            y: G.random(175, 390),
            size,
            expiresAt: now + cfg.fragmentDuration,
            duration: cfg.fragmentDuration,
            rotation: Math.random() * Math.PI,
            pulse: 0
        };
        G.showEcho('Anomalia detectada. Estabilize o fragmento.', 2300);
        G.sound('warning');
    }

    function scheduleCrystal(now) {
        const cfg = levelSettings[G.state.level];
        G.state.nextCrystalAt = now + G.random(cfg.crystalMin, cfg.crystalMax);
    }

    function spawnCrystal(now) {
        const size = G.random(34, 46);
        G.state.crystal = {
            x: G.random(340, 720),
            y: G.random(190, 390),
            size,
            expiresAt: now + G.constants.crystalDuration,
            pulse: Math.random() * Math.PI * 2
        };
        G.showEcho('Cristal de dados detectado. Capture-o!', 2300);
        G.sound('crystal');
    }

    G.updateGameplay = now => {
        if (G.state.screen !== G.STATES.PLAYING) return;

        if (now > G.state.comboUntil && G.state.combo > 0) {
            G.state.combo = 0;
            G.state.lastComboAction = '';
        }

        if (now - G.state.lastStatsUpdate >= G.constants.statsInterval) {
            G.state.lastStatsUpdate = now;
            const s = G.state.stats;
            const drain = levelSettings[G.state.level].drain;
            s.fome = G.clamp(s.fome - drain[0]);
            s.higiene = G.clamp(s.higiene - drain[1]);
            s.felicidade = G.clamp(s.felicidade - drain[2]);
            s.energia = G.clamp(s.energia - drain[3]);

            const low = G.lowestStat();
            if (low <= 0) {
                if (G.state.criticalSince === null) {
                    G.state.criticalSince = now;
                    G.showFeedback('PERIGO! Você tem 3 segundos para salvar Draco!', 3000);
                    G.showEcho('Não podemos perdê-lo...', 2600);
                } else if (now - G.state.criticalSince >= G.constants.criticalGrace) {
                    G.goTo(G.STATES.GAME_OVER);
                    G.sound('gameover');
                    return;
                }
            } else {
                G.state.criticalSince = null;
            }

            if (low >= 70) G.state.stability = G.clamp(G.state.stability + 2);
            else if (low >= 40) G.state.stability = G.clamp(G.state.stability + 1);
            else if (G.averageStats() < 45) G.state.stability = G.clamp(G.state.stability - 2);

            updateLevel();

            if (G.state.stability >= 100) {
                G.goTo(G.STATES.VICTORY);
                G.showEcho('Conseguimos. Arcadia foi restaurada.', 4000);
                G.sound('victory');
                return;
            }

            const milestone = Math.floor(G.state.stability / 25) * 25;
            if (milestone > G.state.lastEchoMilestone && milestone > 0) {
                G.state.lastEchoMilestone = milestone;
                G.showEcho(milestone >= 75 ? 'Excelente. O núcleo está respondendo.' : `Integridade restaurada para ${milestone}%.`, 2500);
            }
        }

        if (!G.state.fragment && now >= G.state.nextFragmentAt) spawnFragment(now);
        if (G.state.fragment) {
            G.state.fragment.pulse += .08;
            G.state.fragment.rotation += .01 + G.state.level * .003;
            if (now >= G.state.fragment.expiresAt) {
                G.state.fragment = null;
                G.state.stats.energia = G.clamp(G.state.stats.energia - 12 - G.state.level * 3);
                G.state.stability = G.clamp(G.state.stability - 6 - G.state.level * 2);
                G.state.shake = 12 + G.state.level * 2;
                G.showFeedback('A falha se espalhou! Draco perdeu energia.', 2400);
                scheduleFragment(now);
            }
        }

        if (!G.state.crystal && now >= G.state.nextCrystalAt) spawnCrystal(now);
        if (G.state.crystal) {
            G.state.crystal.pulse += .07;
            if (now >= G.state.crystal.expiresAt) {
                G.state.crystal = null;
                G.showFeedback('O cristal se desfez.', 1500);
                scheduleCrystal(now);
            }
        }

        if (G.state.shake > 0) G.state.shake *= .85;
    };

    G.drawFragment = now => {
        const f = G.state.fragment;
        if (!f) return;
        const scale = 1 + Math.sin(f.pulse) * .12;
        const remaining = Math.max(0, f.expiresAt - now) / f.duration;
        ctx.save();
        ctx.translate(f.x + f.size / 2, f.y + f.size / 2);
        ctx.rotate(f.rotation);
        ctx.scale(scale, scale);
        ctx.shadowColor = C.danger;
        ctx.shadowBlur = 30;
        ctx.fillStyle = 'rgba(214,64,69,.85)';
        ctx.strokeStyle = C.coral;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, -f.size / 2);
        ctx.lineTo(f.size / 2, 0);
        ctx.lineTo(0, f.size / 2);
        ctx.lineTo(-f.size / 2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = C.iceWhite;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-10, -14);
        ctx.lineTo(10, 14);
        ctx.moveTo(12, -12);
        ctx.lineTo(-12, 12);
        ctx.stroke();
        ctx.restore();
        G.bar(f.x, f.y + f.size + 10, f.size, 7, remaining * 100, C.danger);
    };

    G.drawCrystal = now => {
        const crystal = G.state.crystal;
        if (!crystal) return;
        const floatY = Math.sin(now * .006 + crystal.pulse) * 7;
        const scale = 1 + Math.sin(crystal.pulse) * .1;
        const remaining = Math.max(0, crystal.expiresAt - now) / G.constants.crystalDuration;
        ctx.save();
        ctx.translate(crystal.x, crystal.y + floatY);
        ctx.scale(scale, scale);
        ctx.rotate(Math.sin(now * .0015) * .2);
        ctx.shadowColor = C.success;
        ctx.shadowBlur = 30;
        ctx.fillStyle = 'rgba(116,227,154,.9)';
        ctx.strokeStyle = C.iceWhite;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -crystal.size);
        ctx.lineTo(crystal.size * .7, 0);
        ctx.lineTo(0, crystal.size);
        ctx.lineTo(-crystal.size * .7, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        G.bar(crystal.x - crystal.size * .7, crystal.y + crystal.size + 14, crystal.size * 1.4, 7, remaining * 100, C.success);
    };

    G.hitFragment = (x, y) => {
        const f = G.state.fragment;
        if (!f) return false;
        return Math.hypot(x - (f.x + f.size / 2), y - (f.y + f.size / 2)) <= f.size * .7;
    };

    G.hitCrystal = (x, y) => {
        const c = G.state.crystal;
        if (!c) return false;
        return Math.hypot(x - c.x, y - c.y) <= c.size;
    };

    G.resolveFragment = now => {
        G.state.fragment = null;
        G.state.stability = G.clamp(G.state.stability + 10);
        G.state.stats.felicidade = G.clamp(G.state.stats.felicidade + 5);
        G.registerCombo('fragment');
        G.showFeedback('Fragmento estabilizado! +10% de estabilidade', 2200);
        G.showEcho('Boa resposta. A corrupção recuou.', 2200);
        G.sound('fragment');
        scheduleFragment(now);
        updateLevel();
    };

    G.collectCrystal = now => {
        G.state.crystal = null;
        const roll = Math.floor(Math.random() * 3);
        if (roll === 0) {
            Object.keys(G.state.stats).forEach(key => G.state.stats[key] = G.clamp(G.state.stats[key] + 12));
            G.showFeedback('Cristal vital: +12 em todas as necessidades', 2400);
        } else if (roll === 1) {
            G.state.stability = G.clamp(G.state.stability + 15);
            G.showFeedback('Cristal puro: +15% de estabilidade', 2400);
        } else {
            G.state.stats.energia = G.clamp(G.state.stats.energia + 30);
            G.state.stats.felicidade = G.clamp(G.state.stats.felicidade + 10);
            G.showFeedback('Cristal energético: energia restaurada', 2400);
        }
        G.registerCombo('crystal');
        G.showEcho('Energia de dados assimilada com sucesso.', 2400);
        G.sound('crystal');
        scheduleCrystal(now);
        updateLevel();
    };

    G.performAction = action => {
        const s = G.state.stats;
        if (action === 'feed') {
            s.fome = G.clamp(s.fome + 30);
            G.setDracoAction('eating', 1100);
            G.sound('feed');
            G.showFeedback('Draco foi alimentado!');
        }
        if (action === 'clean') {
            s.higiene = G.clamp(s.higiene + 35);
            G.setDracoAction('cleaning', 1500);
            G.sound('clean');
            G.showFeedback('Draco está limpinho!');
        }
        if (action === 'play') {
            if (s.energia < 15) return G.showFeedback('Draco está cansado demais para brincar.');
            s.felicidade = G.clamp(s.felicidade + 30);
            s.energia = G.clamp(s.energia - 10);
            G.setDracoAction('playing', 1800);
            G.sound('play');
            G.showFeedback('Draco adorou brincar!');
        }
        if (action === 'sleep') {
            s.energia = G.clamp(s.energia + 40);
            s.fome = G.clamp(s.fome - 8);
            G.setDracoAction('sleeping', 2200);
            G.sound('sleep');
            G.showFeedback('Draco descansou e recuperou energia.', 2200);
        }
        G.registerCombo(action);
        G.state.criticalSince = null;
        G.state.lastStatsUpdate = performance.now();
    };
})();
