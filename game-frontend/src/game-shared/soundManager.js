export const SoundManager = {
    sounds: {
        correct: new Audio('sounds/correct.mp3'),
        wrong:   new Audio('sounds/wrong.mp3'),
        bgm:     new Audio('sounds/bgm_test.mp3'),
        click:   new Audio('sounds/click_test.mp3')
    },

    isMuted: localStorage.getItem('global_sound') === 'false',

    init: function() {
        this.sounds.bgm.loop = true;
        this.sounds.bgm.volume = 0.3;

        window.addEventListener('settingsChange', (e) => {
            if (e.detail.type === 'sound') {
                this.isMuted = !e.detail.value;

                if (this.isMuted) {
                    this.sounds.bgm.pause();
                } else {
                    this.sounds.bgm.play().catch(_err => console.log("Trình duyệt yêu cầu tương tác trước khi phát nhạc."));
                }
            }
        });
    },

    play: function(name) {
        if (this.isMuted) return;

        if (this.sounds[name]) {
            this.sounds[name].currentTime = 0;
            this.sounds[name].play().catch(_e => console.log("Chưa tải được file: " + name));
        }
    },

    toggleMusic: function() {
        if (this.isMuted) return;

        if (this.sounds.bgm.paused) {
            this.sounds.bgm.play().catch(_e => {});
        } else {
            this.sounds.bgm.pause();
        }
    },

    toggleMute: function() {
        this.isMuted = !this.isMuted;

        if (this.isMuted) {
            this.sounds.bgm.pause();
            return "";
        } else {
            this.sounds.bgm.play().catch(_e => {});
            return "";
        }
    }
};

SoundManager.init();
window.SoundManager = SoundManager;
