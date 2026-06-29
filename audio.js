// Web Audio API Synth for Retro Arcade Sound Effects
const audio = (() => {
    let ctx = null;
    let masterGain = null;
    let isMuted = false;

    // Initialize Audio Context on first user interaction
    function init() {
        if (ctx) return;
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            ctx = new AudioContextClass();
            masterGain = ctx.createGain();
            masterGain.gain.setValueAtTime(0.15, ctx.currentTime); // Low default volume so it doesn't blast
            masterGain.connect(ctx.destination);
        } catch (e) {
            console.warn("Web Audio API not supported in this browser.", e);
        }
    }

    function resume() {
        init();
        if (ctx && ctx.state === 'suspended') {
            ctx.resume();
        }
    }

    function playTone(freq, duration, type = 'square', delay = 0, endFreq = null) {
        if (!ctx || isMuted) return;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        
        if (endFreq !== null) {
            osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + delay + duration);
        }

        gain.gain.setValueAtTime(1.0, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration);
    }

    function playNoise(duration, lowPassFreq = 1000, delay = 0) {
        if (!ctx || isMuted) return;

        // Create buffer with random noise
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(lowPassFreq, ctx.currentTime + delay);
        filter.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + delay + duration);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(1.0, ctx.currentTime + delay);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);

        noiseNode.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(masterGain);

        noiseNode.start(ctx.currentTime + delay);
        noiseNode.stop(ctx.currentTime + delay + duration);
    }

    return {
        init: () => {
            init();
        },
        toggleMute: () => {
            init();
            isMuted = !isMuted;
            if (masterGain) {
                masterGain.gain.setValueAtTime(isMuted ? 0 : 0.15, ctx.currentTime);
            }
            return isMuted;
        },
        getMuted: () => isMuted,
        playJump: () => {
            resume();
            // Upward frequency sweep
            playTone(150, 0.18, 'triangle', 0, 650);
        },
        playCoin: () => {
            resume();
            // Double tone chime: B5 then E6
            playTone(987, 0.08, 'square', 0);
            playTone(1318, 0.25, 'square', 0.08);
        },
        playStomp: () => {
            resume();
            // Stomp sound is a low rumble and crash noise
            playNoise(0.15, 600);
            playTone(120, 0.12, 'sawtooth', 0, 40);
        },
        playPowerUp: () => {
            resume();
            // Arpeggio rising
            const notes = [330, 392, 659, 523, 587, 784];
            notes.forEach((freq, idx) => {
                playTone(freq, 0.08, 'triangle', idx * 0.075);
            });
        },
        playPowerDown: () => {
            resume();
            // Fast slide down
            playTone(440, 0.3, 'sawtooth', 0, 110);
        },
        playDeath: () => {
            resume();
            // Sad tune: C5 -> G4 -> E4 -> A4 -> B4 -> A4 -> G4
            const melody = [
                { f: 523, d: 0.15 },
                { f: 392, d: 0.15 },
                { f: 330, d: 0.15 },
                { f: 440, d: 0.15 },
                { f: 494, d: 0.15 },
                { f: 440, d: 0.15 },
                { f: 392, d: 0.3 }
            ];
            let accumulatedTime = 0;
            melody.forEach((note) => {
                playTone(note.f, note.d, 'square', accumulatedTime);
                accumulatedTime += note.d + 0.05;
            });
        },
        playStageClear: () => {
            resume();
            // Classic arcade victory fanfare
            const melody = [
                { f: 523, d: 0.1, t: 'square' }, // C5
                { f: 659, d: 0.1, t: 'square' }, // E5
                { f: 784, d: 0.1, t: 'square' }, // G5
                { f: 1046, d: 0.1, t: 'square' }, // C6
                { f: 1318, d: 0.1, t: 'square' }, // E6
                { f: 1568, d: 0.3, t: 'square' }, // G6 (hold)
                
                { f: 1318, d: 0.1, t: 'square', delay: 0.4 }, 
                { f: 1386, d: 0.3, t: 'square', delay: 0.5 }, // G#6
                
                { f: 1046, d: 0.1, t: 'square', delay: 0.8 }, 
                { f: 1175, d: 0.1, t: 'square', delay: 0.9 }, 
                { f: 1318, d: 0.1, t: 'square', delay: 1.0 }, 
                { f: 1568, d: 0.4, t: 'square', delay: 1.1 }, // G6
            ];
            
            melody.forEach(note => {
                const baseDelay = note.delay || 0;
                playTone(note.f, note.d, note.t || 'square', baseDelay);
            });
        }
    };
})();
