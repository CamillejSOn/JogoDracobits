(() => {
    const G = DracoBits, ctx = G.ctx, C = G.COLORS;
    G.centerText = (text, y, size = 24, color = C.iceWhite, weight = 'normal') => {
        ctx.fillStyle = color;
        ctx.font = `${weight} ${size}px Courier New`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, G.WIDTH / 2, y);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    };
    G.panel = (x, y, w, h) => {
        ctx.save();
        ctx.fillStyle = 'rgba(5,8,13,.75)';
        ctx.strokeStyle = 'rgba(95,211,255,.75)';
        ctx.lineWidth = 2;
        G.roundRect(x, y, w, h, 12);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    };
    G.button = (b, bg = C.coral, text = C.darkText, border = C.iceWhite) => {
        ctx.save();
        ctx.fillStyle = bg;
        ctx.strokeStyle = border;
        ctx.lineWidth = 2;
        G.roundRect(b.x, b.y, b.width, b.height);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = text;
        ctx.font = 'bold 17px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.label, b.x + b.width / 2, b.y + b.height / 2);
        ctx.restore();
    };
    G.bar = (x, y, w, h, value, color) => {
        ctx.fillStyle = 'rgba(5,8,13,.8)';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w * G.clamp(value) / 100, h);
        ctx.strokeStyle = C.iceWhite;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
    };
    const statColor = value => value > 60 ? C.success : value > 30 ? C.warning : C.danger;
    G.drawHUD = now => {
        G.panel(20, 20, 300, 235);
        ctx.fillStyle = C.iceWhite;
        ctx.font = 'bold 16px Courier New';
        [['Fome', 'fome', 50], ['Higiene', 'higiene', 100], ['Felicidade', 'felicidade', 150], ['Energia', 'energia', 200]].forEach(([label, key, y]) => {
            const value = G.state.stats[key];
            ctx.fillText(`${label}: ${value}%`, 40, y);
            G.bar(40, y + 10, 250, 15, value, statColor(value));
        });
        G.panel(500, 20, 280, 108);
        ctx.fillStyle = C.iceWhite;
        ctx.font = 'bold 15px Courier New';
        ctx.fillText(`Estabilidade: ${G.state.stability}%`, 520, 49);
        G.bar(520, 62, 235, 16, G.state.stability, C.neonBlue);
        ctx.fillStyle = G.state.level === 3 ? C.danger : G.state.level === 2 ? C.warning : C.success;
        ctx.fillText(`Nível de corrupção: ${G.state.level}`, 520, 104);

        if (G.state.combo > 0) {
            const remaining = Math.max(0, G.state.comboUntil - now) / G.constants.comboWindow;
            G.panel(335, 180, 150, 58);
            ctx.fillStyle = C.warning;
            ctx.font = 'bold 18px Courier New';
            ctx.fillText(`COMBO x${G.state.combo}`, 355, 208);
            G.bar(352, 218, 116, 7, remaining * 100, C.warning);
        }
    };
    G.drawFeedback = now => {
        if (!G.state.feedback || now > G.state.feedbackUntil) return;
        G.panel(170, 430, 460, 45);
        G.centerText(G.state.feedback, 452, 15, C.iceWhite, 'bold');
    };
    G.drawEcho = now => {
        if (!G.state.echoMessage || now > G.state.echoUntil) return;
        G.panel(335, 115, 430, 56);
        ctx.fillStyle = C.softPurple;
        ctx.font = 'bold 14px Courier New';
        ctx.fillText('ECHO:', 352, 140);
        ctx.fillStyle = C.iceWhite;
        ctx.font = '14px Courier New';
        ctx.fillText(G.state.echoMessage, 415, 140);
    };
})();
