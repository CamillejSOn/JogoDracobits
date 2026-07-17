(() => {
    const G = DracoBits, ctx = G.ctx, C = G.COLORS;
    G.createParticles = () => {
        G.particles.length = 0;
        for (let i = 0; i < 55; i++) G.particles.push({ x: Math.random() * G.WIDTH, y: Math.random() * G.HEIGHT, r: G.random(.5, 2.5), s: G.random(.08, .35), a: G.random(.2, .9) });
    };
    G.updateParticles = () => G.particles.forEach(p => { p.y -= p.s; if (p.y < -5) { p.y = G.HEIGHT + 5; p.x = Math.random() * G.WIDTH; } });
    G.drawBase = () => {
        const gradient = ctx.createLinearGradient(0, 0, 0, G.HEIGHT);
        gradient.addColorStop(0, C.backgroundLight); gradient.addColorStop(1, C.background);
        ctx.fillStyle = gradient; ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);
        G.particles.forEach(p => { ctx.beginPath(); ctx.fillStyle = `rgba(95,211,255,${p.a})`; ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); });
    };
    function crystal(x, y, size, color, now) {
        ctx.save(); ctx.translate(x, y + Math.sin(now * .003) * 5); ctx.shadowColor = color; ctx.shadowBlur = 18; ctx.globalAlpha = .65; ctx.fillStyle = color;
        ctx.beginPath(); ctx.moveTo(0, -size); ctx.lineTo(size * .65, 0); ctx.lineTo(0, size); ctx.lineTo(-size * .65, 0); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    function core(now) {
        const stability = G.state.stability;
        const color = stability < 30 ? C.danger : stability < 65 ? C.warning : C.neonBlue;
        const pulse = 1 + Math.sin(now * .003) * (.05 + (100 - stability) / 900);
        ctx.save(); ctx.translate(650, 205); ctx.scale(pulse, pulse); ctx.shadowColor = color; ctx.shadowBlur = 24; ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.fillStyle = `${color}22`;
        ctx.beginPath(); ctx.arc(0, 0, 48, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.rotate(now * .0006);
        for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 48, Math.sin(a) * 48); ctx.lineTo(Math.cos(a) * 66, Math.sin(a) * 66); ctx.stroke(); }
        ctx.restore(); ctx.fillStyle = C.iceWhite; ctx.font = 'bold 12px Courier New'; ctx.textAlign = 'center'; ctx.fillText('NÚCLEO', 650, 295); ctx.textAlign = 'left';
    }
    G.drawWorld = now => {
        const phaseGlow = [
            'rgba(95,211,255,.14)',
            'rgba(123,109,204,.18)',
            'rgba(214,64,69,.18)',
            'rgba(255,209,102,.17)'
        ][G.state.level - 1];
        const phaseWash = [
            'rgba(19,34,56,0)',
            'rgba(68,39,95,.10)',
            'rgba(110,18,32,.13)',
            'rgba(95,75,15,.10)'
        ][G.state.level - 1];

        ctx.fillStyle = phaseWash;
        ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);

        const glow = ctx.createRadialGradient(400, 330, 20, 400, 330, 280);
        glow.addColorStop(0, phaseGlow);
        glow.addColorStop(1, 'rgba(19,34,56,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);
        ctx.save(); ctx.strokeStyle = 'rgba(95,211,255,.15)'; ctx.lineWidth = 2;
        for (let i = 0; i < 7; i++) { const y = 300 + i * 25; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(G.WIDTH, y); ctx.stroke(); }
        for (let i = 0; i < 10; i++) { const x = i * 90; ctx.beginPath(); ctx.moveTo(x, 300); ctx.lineTo(x + 40, 475); ctx.stroke(); }
        ctx.restore(); crystal(350, 400, 22, C.softPurple, now); crystal(730, 345, 16, C.neonBlue, now + 700); crystal(330, 270, 12, C.coral, now + 1300);
        ctx.save(); ctx.shadowColor = C.neonBlue; ctx.shadowBlur = 25; ctx.fillStyle = 'rgba(5,8,13,.85)'; ctx.strokeStyle = 'rgba(95,211,255,.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(400, 420, 130, 32, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore(); core(now);
    };
    G.drawDanger = now => {
        const low = G.lowestStat();
        const phaseCritical = G.state.level >= 3;
        if (low > 35 && !phaseCritical) return;

        const baseAlpha = phaseCritical ? (G.state.level === 4 ? .055 : .035) : 0;
        const alpha = low <= 15
            ? .16 + Math.sin(now * .012) * .07
            : low <= 35
                ? .07
                : baseAlpha;

        ctx.fillStyle = `rgba(214,64,69,${alpha})`;
        ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);

        if (low <= 15 || G.state.level === 4) {
            ctx.strokeStyle = low <= 15 ? 'rgba(255,142,142,.6)' : 'rgba(255,209,102,.22)';
            ctx.lineWidth = low <= 15 ? 3 : 1;
            const lines = low <= 15 ? 5 : 2;
            for (let i = 0; i < lines; i++) {
                const y = Math.random() * G.HEIGHT;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(G.WIDTH, y + G.random(-10, 10));
                ctx.stroke();
            }
        }
    };
    G.createParticles();
})();
