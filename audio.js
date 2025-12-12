// audio.js - Simplified Version (Just for soldier sounds)
class SoundSystem {
    constructor() {
        this.enabled = true;
        this.volume = 0.7;
        this.slashSounds = [];
        this.init();
    }

    init() {
        // Load soldier slash sounds
        for (let i = 1; i <= 4; i++) {
            const audio = new Audio();
            audio.src = `Audio/slash${i}.mp3`;
            audio.preload = 'auto';
            audio.volume = this.volume;
            this.slashSounds.push(audio);
        }
        
        // Optional: Test if sounds loaded
        console.log(`Loaded ${this.slashSounds.length} slash sounds`);
    }

    playRandomSlash(volume = 0.8, pitch = 1.0) {
        if (!this.enabled || this.slashSounds.length === 0) return;
        
        // Pick random slash sound
        const randomIndex = Math.floor(Math.random() * this.slashSounds.length);
        const sound = this.slashSounds[randomIndex].cloneNode();
        
        // Adjust volume and pitch
        sound.volume = this.volume * volume;
        sound.playbackRate = pitch;
        
        // Play and clean up
        sound.play().catch(e => console.log("Sound play failed (user might not have interacted yet)"));
        sound.onended = () => sound.remove();
        
        return sound;
    }

    playSlash(index, volume = 0.8, pitch = 1.0) {
        if (!this.enabled || index < 0 || index >= this.slashSounds.length) return;
        
        const sound = this.slashSounds[index].cloneNode();
        sound.volume = this.volume * volume;
        sound.playbackRate = pitch;
        
        sound.play().catch(e => console.log("Sound play failed"));
        sound.onended = () => sound.remove();
        
        return sound;
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    setVolume(level) {
        this.volume = Math.max(0, Math.min(1, level));
    }
}

// Create global sound system
window.soundSystem = new SoundSystem();
