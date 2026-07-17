(() => {
    const G = DracoBits;
    let context = null;
    let master = null;
    let musicGain = null;
    let effectsGain = null;
    let nextBeatAt = 0;
    let beatIndex = 0;
    let lastScreen = '';

    const menuNotes = [220, 277.18, 329.63, 277.18, 196, 246.94, 293.66, 246.94];
    const gameNotes = [146.83, 196, 220, 246.94, 164.81, 220, 246.94, 293.66];
    const dangerNotes = [110, 116.54, 103.83, 98, 110, 123.47, 103.83, 92.5];

    function ensureAudio() {
        if (!G.state.audioEnabled) return false;

        if (!context) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return false;

            context = new AudioContextClass();
            master = context.createGain();
            musicGain = context.createGain();
            effectsGain = context.createGain();

            master.gain.value = 0.8;
            musicGain.gain.value = 0.16;
            effectsGain.gain.value = 0.28;

            musicGain.connect(master);
            effectsGain.connect(master);
            master.connect(context.destination);

            nextBeatAt = context.currentTime + 0.05;
        }

        if (context.state === 'suspended') context.resume();
        return true;
    }

    function envelope(gain, start, duration, volume) {
        gain.gain.cancelScheduledValues(start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), start + 0.035);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    }

    function tone(frequency, duration = 0.12, type = 'sine', volume = 0.35, delay = 0, destination = effectsGain) {
        if (!ensureAudio()) return;

        const start = context.currentTime + delay;
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, start);
        envelope(gain, start, duration, volume);

        oscillator.connect(gain);
        gain.connect(destination);
        oscillator.start(start);
        oscillator.stop(start + duration + 0.05);
    }

    function pad(frequency, start, duration, volume) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const filter = context.createBiquadFilter();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, start);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, start);
        envelope(gain, start, duration, volume);

        oscillator.connect(filter);
        filter.connect(gain);
        gain.connect(musicGain);
        oscillator.start(start);
        oscillator.stop(start + duration + 0.08);
    }

    function sparkle(frequency, start, volume = 0.018) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(frequency, start);
        envelope(gain, start, 0.42, volume);
        oscillator.connect(gain);
        gain.connect(musicGain);
        oscillator.start(start);
        oscillator.stop(start + 0.47);
    }

    function currentSequence() {
        if (G.state.screen === G.STATES.PLAYING && (G.lowestStat() <= 30 || G.state.level === 3)) {
            return { notes: dangerNotes, beat: 0.42, bass: 55 };
        }

        if (G.state.screen === G.STATES.PLAYING) {
            return { notes: gameNotes, beat: G.state.level === 2 ? 0.48 : 0.56, bass: 73.42 };
        }

        return { notes: menuNotes, beat: 0.64, bass: 55 };
    }

    function scheduleMusic() {
        if (!context || !G.state.audioEnabled) return;

        const sequence = currentSequence();

        while (nextBeatAt < context.currentTime + 0.22) {
            const note = sequence.notes[beatIndex % sequence.notes.length];
            const strongBeat = beatIndex % 4 === 0;

            pad(note, nextBeatAt, sequence.beat * 1.65, strongBeat ? 0.035 : 0.026);
            pad(sequence.bass, nextBeatAt, sequence.beat * 1.8, strongBeat ? 0.026 : 0.014);

            if (beatIndex % 2 === 1) sparkle(note * 2, nextBeatAt + sequence.beat * 0.25);

            nextBeatAt += sequence.beat;
            beatIndex++;
        }
    }

    function resetMusicClock() {
        if (!context) return;
        nextBeatAt = context.currentTime + 0.05;
        beatIndex = 0;
    }

    G.initAudio = () => {
        const started = ensureAudio();
        if (started) resetMusicClock();
        return started;
    };

    G.toggleAudio = () => {
        G.state.audioEnabled = !G.state.audioEnabled;
        G.buttons.audio.label = `MÚSICA: ${G.state.audioEnabled ? 'ON' : 'OFF'}`;

        if (G.state.audioEnabled) {
            ensureAudio();
            master.gain.cancelScheduledValues(context.currentTime);
            master.gain.setTargetAtTime(0.8, context.currentTime, 0.08);
            resetMusicClock();
            tone(660, 0.08, 'sine', 0.18);
        } else if (context) {
            master.gain.cancelScheduledValues(context.currentTime);
            master.gain.setTargetAtTime(0.0001, context.currentTime, 0.05);
        }
    };

    G.sound = name => {
        if (!G.state.audioEnabled) return;

        const sounds = {
            click: () => tone(520, 0.07, 'square', 0.13),
            feed: () => { tone(330, 0.09, 'triangle', 0.2); tone(440, 0.11, 'triangle', 0.16, 0.08); },
            clean: () => { tone(760, 0.08, 'sine', 0.15); tone(980, 0.1, 'sine', 0.11, 0.06); },
            play: () => { tone(523, 0.09, 'square', 0.14); tone(659, 0.09, 'square', 0.12, 0.09); tone(784, 0.12, 'square', 0.1, 0.18); },
            sleep: () => { tone(392, 0.3, 'sine', 0.1); tone(294, 0.45, 'sine', 0.07, 0.18); },
            warning: () => { tone(220, 0.12, 'sawtooth', 0.18); tone(180, 0.16, 'sawtooth', 0.14, 0.15); },
            fragment: () => { tone(900, 0.07, 'square', 0.16); tone(1150, 0.09, 'square', 0.11, 0.06); },
            crystal: () => { tone(660, 0.12, 'sine', 0.15); tone(880, 0.15, 'sine', 0.12, 0.08); tone(1320, 0.18, 'sine', 0.09, 0.16); },
            combo: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.14, 'triangle', 0.13, i * 0.08)),
            level: () => { tone(196, 0.22, 'sawtooth', 0.14); tone(262, 0.22, 'sawtooth', 0.11, 0.16); },
            gameover: () => { tone(220, 0.42, 'sawtooth', 0.14); tone(147, 0.65, 'sine', 0.12, 0.28); },
            victory: () => [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.45, 'triangle', 0.13, i * 0.16))
        };

        if (sounds[name]) sounds[name]();
    };

    G.updateAudio = () => {
        if (!G.state.audioEnabled || !ensureAudio()) return;

        if (lastScreen !== G.state.screen) {
            lastScreen = G.state.screen;
            resetMusicClock();
        }

        scheduleMusic();
    };
})();
