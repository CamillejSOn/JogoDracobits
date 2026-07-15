(() => {
    const G = DracoBits, ctx = G.ctx, C = G.COLORS;
    G.getMood = () => {
        if (G.state.dracoAction === 'sleeping') return 'sleeping';
        if (G.state.stats.energia <= 25) return 'tired';
        const avg = G.averageStats(); return avg <= 35 ? 'sad' : avg >= 75 ? 'happy' : 'neutral';
    };
    G.updateDraco = now => {
        if (G.state.screen !== G.STATES.PLAYING) return;
        if (now >= G.state.nextBlinkAt) { G.state.blinkUntil = now + 160; G.state.nextBlinkAt = now + G.random(2200, 4800); }
        if (G.state.dracoAction !== 'idle' && now >= G.state.dracoActionUntil) G.state.dracoAction = 'idle';
        if (G.state.dracoAction !== 'sleeping' && now >= G.state.nextDracoDecisionAt) {
            G.state.dracoDirection = Math.random() < .5 ? -1 : 1; G.state.dracoMovingUntil = now + G.random(1200, 2600); G.state.nextDracoDecisionAt = G.state.dracoMovingUntil + G.random(700, 1800);
        }
        if (G.state.dracoAction === 'idle' && now < G.state.dracoMovingUntil) {
            G.state.dracoX += G.state.dracoDirection * .32;
            if (G.state.dracoX < 330 || G.state.dracoX > 470) G.state.dracoDirection *= -1;
        }
    };
    function heart(x, y, size) {
        ctx.save(); ctx.fillStyle = C.coral; ctx.shadowColor = C.coral; ctx.shadowBlur = 10; ctx.beginPath(); ctx.moveTo(x, y + size / 3); ctx.bezierCurveTo(x - size, y - size / 2, x - size * 1.4, y + size / 2, x, y + size); ctx.bezierCurveTo(x + size * 1.4, y + size / 2, x + size, y - size / 2, x, y + size / 3); ctx.fill(); ctx.restore();
    }
    function face(mood, now) {
        const blink = now < G.state.blinkUntil; ctx.strokeStyle = C.background; ctx.fillStyle = C.background; ctx.lineWidth = 4; ctx.lineCap = 'round';
        if (mood === 'sleeping' || blink) { ctx.beginPath(); ctx.moveTo(-20, -25); ctx.lineTo(-8, -25); ctx.moveTo(8, -25); ctx.lineTo(20, -25); ctx.stroke(); }
        else if (mood === 'tired') { ctx.beginPath(); ctx.moveTo(-21, -22); ctx.lineTo(-8, -25); ctx.moveTo(8, -25); ctx.lineTo(21, -22); ctx.stroke(); }
        else { ctx.beginPath(); ctx.arc(-14, -25, 5, 0, Math.PI * 2); ctx.arc(14, -25, 5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = C.iceWhite; ctx.beginPath(); ctx.arc(-12, -27, 1.8, 0, Math.PI * 2); ctx.arc(16, -27, 1.8, 0, Math.PI * 2); ctx.fill(); }
        ctx.strokeStyle = C.coral; ctx.lineWidth = 4; ctx.beginPath();
        if (mood === 'happy') ctx.arc(0, -10, 11, .1, Math.PI - .1);
        else if (mood === 'sad') ctx.arc(0, 1, 10, Math.PI + .15, Math.PI * 2 - .15);
        else if (mood === 'tired') ctx.arc(0, -8, 6, 0, Math.PI * 2);
        else { ctx.moveTo(-7, -9); ctx.lineTo(7, -9); }
        ctx.stroke();
    }
    G.drawDraco = now => {
        const mood = G.getMood(), action = G.state.dracoAction; let jump = 0, rot = 0, sx = 1, sy = 1;
        if (action === 'playing') { jump = -Math.abs(Math.sin(now * .012)) * 28; rot = Math.sin(now * .014) * .12; }
        if (action === 'eating') { sx = 1 + Math.sin(now * .025) * .08; sy = 1 - Math.sin(now * .025) * .05; }
        if (action === 'cleaning') rot = Math.sin(now * .025) * .08;
        if (action === 'sleeping') { sy = .78; jump = 15; }
        const x = G.state.dracoX, y = 350 + Math.sin(now * .004) * 3 + jump;
        ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.beginPath(); ctx.ellipse(x, 420, 48, 13, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sx, sy); ctx.shadowColor = mood === 'sad' ? C.softPurple : C.neonBlue; ctx.shadowBlur = 28;
        ctx.fillStyle = '#459BC4'; ctx.beginPath(); ctx.moveTo(-28, 20); ctx.quadraticCurveTo(-70, 20, -62, -15); ctx.quadraticCurveTo(-45, 2, -25, 0); ctx.closePath(); ctx.fill();
        ctx.fillStyle = C.softPurple; [[-1], [1]].forEach(([side]) => { ctx.beginPath(); ctx.moveTo(side * 25, -5); ctx.lineTo(side * 58, -30); ctx.lineTo(side * 47, 10); ctx.closePath(); ctx.fill(); });
        ctx.fillStyle = mood === 'sad' ? '#6684B5' : C.neonBlue; ctx.beginPath(); ctx.ellipse(0, 8, 39, 35, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(0, -23, 35, 30, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = C.iceWhite; [[-1], [1]].forEach(([side]) => { ctx.beginPath(); ctx.moveTo(side * 21, -46); ctx.lineTo(side * 15, -66); ctx.lineTo(side * 6, -45); ctx.closePath(); ctx.fill(); });
        ctx.shadowBlur = 0; face(mood, now); ctx.restore();
        if (action === 'playing') { heart(x + 45, 285 - Math.abs(Math.sin(now * .008)) * 15, 10); heart(x - 45, 297, 7); }
        if (action === 'eating') { ctx.save(); ctx.fillStyle = C.coral; ctx.font = 'bold 26px Courier New'; ctx.textAlign = 'center'; ctx.fillText('♥', x, 270); ctx.restore(); }
        if (action === 'cleaning') for (let i = 0; i < 5; i++) { const a = now * .003 + i * 1.25; ctx.strokeStyle = 'rgba(234,247,255,.75)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + Math.cos(a) * 55, 350 + Math.sin(a) * 35, 4 + i, 0, Math.PI * 2); ctx.stroke(); }
        if (action === 'sleeping') { ctx.fillStyle = C.iceWhite; ctx.font = 'bold 20px Courier New'; ctx.fillText('Z', x + 40, 290); ctx.font = 'bold 27px Courier New'; ctx.fillText('Z', x + 58, 265); }
    };
})();
