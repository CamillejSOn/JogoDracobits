(() => {
    const G = DracoBits, ctx = G.ctx, C = G.COLORS;
    function scheduleFragment(now) { G.state.nextFragmentAt = now + G.random(G.constants.fragmentMinInterval, G.constants.fragmentMaxInterval); }
    function spawnFragment(now) { const size = G.random(42, 62); G.state.fragment = { x: G.random(330, G.WIDTH - size - 35), y: G.random(175, 390), size, expiresAt: now + G.constants.fragmentDuration, rotation: Math.random() * Math.PI, pulse: 0 }; G.showEcho('Anomalia detectada. Estabilize o fragmento.', 2300); }
    G.updateGameplay = now => {
        if (G.state.screen !== G.STATES.PLAYING) return;
        if (now - G.state.lastStatsUpdate >= G.constants.statsInterval) {
            G.state.lastStatsUpdate = now;
            const s = G.state.stats; s.fome = G.clamp(s.fome - 3); s.higiene = G.clamp(s.higiene - 2); s.felicidade = G.clamp(s.felicidade - 2); s.energia = G.clamp(s.energia - 1);
            const low = G.lowestStat();
            if (low <= 0) { if (G.state.criticalSince === null) { G.state.criticalSince = now; G.showFeedback('PERIGO! Você tem 3 segundos para salvar Draco!', 3000); G.showEcho('Não podemos perdê-lo...', 2600); } else if (now - G.state.criticalSince >= G.constants.criticalGrace) { G.state.screen = G.STATES.GAME_OVER; return; } } else G.state.criticalSince = null;
            if (low >= 70) G.state.stability = G.clamp(G.state.stability + 2); else if (low >= 40) G.state.stability = G.clamp(G.state.stability + 1); else if (G.averageStats() < 45) G.state.stability = G.clamp(G.state.stability - 2);
            if (G.state.stability >= 100) { G.state.screen = G.STATES.VICTORY; G.showEcho('Conseguimos. Arcadia foi restaurada.', 4000); return; }
            const milestone = Math.floor(G.state.stability / 25) * 25;
            if (milestone > G.state.lastEchoMilestone && milestone > 0) { G.state.lastEchoMilestone = milestone; G.showEcho(milestone >= 75 ? 'Excelente. O núcleo está respondendo.' : `Integridade restaurada para ${milestone}%.`, 2500); }
        }
        if (!G.state.fragment && now >= G.state.nextFragmentAt) spawnFragment(now);
        if (G.state.fragment) {
            G.state.fragment.pulse += .08; G.state.fragment.rotation += .01;
            if (now >= G.state.fragment.expiresAt) { G.state.fragment = null; G.state.stats.energia = G.clamp(G.state.stats.energia - 15); G.state.stability = G.clamp(G.state.stability - 8); G.state.shake = 12; G.showFeedback('A falha se espalhou! Draco perdeu energia.', 2400); scheduleFragment(now); }
        }
        if (G.state.shake > 0) G.state.shake *= .85;
    };
    G.drawFragment = now => {
        const f = G.state.fragment; if (!f) return; const scale = 1 + Math.sin(f.pulse) * .12, remaining = Math.max(0, f.expiresAt - now) / G.constants.fragmentDuration;
        ctx.save(); ctx.translate(f.x + f.size / 2, f.y + f.size / 2); ctx.rotate(f.rotation); ctx.scale(scale, scale); ctx.shadowColor = C.danger; ctx.shadowBlur = 30; ctx.fillStyle = 'rgba(214,64,69,.85)'; ctx.strokeStyle = C.coral; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -f.size / 2); ctx.lineTo(f.size / 2, 0); ctx.lineTo(0, f.size / 2); ctx.lineTo(-f.size / 2, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle = C.iceWhite; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-10, -14); ctx.lineTo(10, 14); ctx.moveTo(12, -12); ctx.lineTo(-12, 12); ctx.stroke(); ctx.restore(); G.bar(f.x, f.y + f.size + 10, f.size, 7, remaining * 100, C.danger);
    };
    G.hitFragment = (x, y) => { const f = G.state.fragment; if (!f) return false; return Math.hypot(x - (f.x + f.size / 2), y - (f.y + f.size / 2)) <= f.size * .7; };
    G.resolveFragment = now => { G.state.fragment = null; G.state.stability = G.clamp(G.state.stability + 10); G.state.stats.felicidade = G.clamp(G.state.stats.felicidade + 5); G.showFeedback('Fragmento estabilizado! +10% de estabilidade', 2200); G.showEcho('Boa resposta. A corrupção recuou.', 2200); scheduleFragment(now); };
    G.performAction = action => {
        const s = G.state.stats;
        if (action === 'feed') { s.fome = G.clamp(s.fome + 30); G.setDracoAction('eating', 1100); G.showFeedback('Draco foi alimentado!'); }
        if (action === 'clean') { s.higiene = G.clamp(s.higiene + 35); G.setDracoAction('cleaning', 1500); G.showFeedback('Draco está limpinho!'); }
        if (action === 'play') { if (s.energia < 15) return G.showFeedback('Draco está cansado demais para brincar.'); s.felicidade = G.clamp(s.felicidade + 30); s.energia = G.clamp(s.energia - 10); G.setDracoAction('playing', 1800); G.showFeedback('Draco adorou brincar!'); }
        if (action === 'sleep') { s.energia = G.clamp(s.energia + 40); s.fome = G.clamp(s.fome - 8); G.setDracoAction('sleeping', 2200); G.showFeedback('Draco descansou e recuperou energia.', 2200); }
        G.state.criticalSince = null; G.state.lastStatsUpdate = performance.now();
    };
})();
