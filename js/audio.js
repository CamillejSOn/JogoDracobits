(() => {
    const G = DracoBits;
    let audioContext = null;
    let master = null;

    function ensureAudio() {
        if (!G.state.audioEnabled) return false;
        if (!audioContext) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return false;
            audioContext = new AudioContextClass();
            master = audioContext.createGain();
            master.gain.value = 0.16;
            master.connect(audioContext.destination);
        }
        if (audioContext.state === 'suspended') audioContext.resume();
        return true;
    }

    function tone(frequency, duration = 0.12, type = 'sine', volume = 0.35, delay = 0) {
        if (!ensureAudio()) return;
        const start = audioContext.currentTime + delay;
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        oscillator.connect(gain);
        gain.connect(master);
        oscillator.start(start);
        oscillator.stop(start + duration + 0.03);
    }

    G.initAudio = ensureAudio;
    G.toggleAudio = () => {
        G.state.audioEnabled = !G.state.audioEnabled;
        G.buttons.audio.label = `ÁUDIO: ${G.state.audioEnabled ? 'ON' : 'OFF'}`;
        if (G.state.audioEnabled) {
            ensureAudio();
            tone(660, 0.08, 'sine', 0.25);
        }
    };

    G.sound = name => {
        if (!G.state.audioEnabled) return;
        const sounds = {
            click: () => tone(520, 0.07, 'square', 0.18),
            feed: () => { tone(330, 0.09, 'triangle', 0.22); tone(440, 0.11, 'triangle', 0.18, 0.08); },
            clean: () => { tone(760, 0.08, 'sine', 0.16); tone(980, 0.1, 'sine', 0.12, 0.06); },
            play: () => { tone(523, 0.09, 'square', 0.16); tone(659, 0.09, 'square', 0.14, 0.09); tone(784, 0.12, 'square', 0.12, 0.18); },
            sleep: () => { tone(392, 0.3, 'sine', 0.12); tone(294, 0.45, 'sine', 0.08, 0.18); },
            warning: () => { tone(220, 0.12, 'sawtooth', 0.2); tone(180, 0.16, 'sawtooth', 0.17, 0.15); },
            fragment: () => { tone(900, 0.07, 'square', 0.18); tone(1150, 0.09, 'square', 0.13, 0.06); },
            crystal: () => { tone(660, 0.12, 'sine', 0.16); tone(880, 0.15, 'sine', 0.13, 0.08); tone(1320, 0.18, 'sine', 0.1, 0.16); },
            combo: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.14, 'triangle', 0.14, i * 0.08)); },
            level: () => { tone(196, 0.22, 'sawtooth', 0.16); tone(262, 0.22, 'sawtooth', 0.13, 0.16); },
            gameover: () => { tone(220, 0.42, 'sawtooth', 0.16); tone(147, 0.65, 'sine', 0.14, 0.28); },
            victory: () => { [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.45, 'triangle', 0.14, i * 0.16)); }
        };
        if (sounds[name]) sounds[name]();
    };

    G.updateAudio = now => {
        if (!G.state.audioEnabled || G.state.screen !== G.STATES.PLAYING) return;
        if (now - G.state.lastAmbientAt < 4200) return;
        G.state.lastAmbientAt = now;
        const base = G.state.level === 3 ? 110 : G.state.level === 2 ? 130 : 147;
        tone(base, 1.8, 'sine', 0.025);
        tone(base * 1.5, 1.6, 'sine', 0.018, 0.2);
    };
})();
