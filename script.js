document.addEventListener('DOMContentLoaded', () => {

    // --- GLOBAL UI & UTILITY ---
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // --- PARALLAX & VISUAL EFFECTS ---
    const dust = document.querySelector('.dust-overlay');
    const scanlines = document.querySelector('.scanlines');
    const screen = document.getElementById('lcd-screen');

    window.addEventListener('scroll', () => {
        const offset = window.pageYOffset;
        if (dust) dust.style.backgroundPositionY = `${offset * 0.1}px`;
        if (scanlines) scanlines.style.backgroundPositionY = `${offset * 0.6}px`;
    });

    // LCD Interference Flicker
    setInterval(() => {
        if (Math.random() > 0.995 && screen) {
            screen.style.opacity = "0.92";
            setTimeout(() => screen.style.opacity = "1", 40);
        }
    }, 150);

    // --- 3. HERO CARD LOGIC ---
    const card = document.querySelector('.hero-section .card');
    const footnote = document.querySelector('.footnote');

    if (card) {
        card.addEventListener('click', (e) => {
            card.classList.toggle('is-active');
            if (footnote) footnote.classList.toggle('is-active');
            e.stopPropagation(); 
        });
    }

    // --- TESTIMONIAL SLIDER ---
    document.querySelectorAll('.testimonial-wrapper').forEach((wrapper) => {
        const slider = wrapper.querySelector('.slider-container');
        const nextBtn = wrapper.querySelector('.slideArrow.next');
        const prevBtn = wrapper.querySelector('.slideArrow.prev');

        if (!slider || !nextBtn || !prevBtn) return;

        const style = window.getComputedStyle(slider);
        const isReverse = style.flexDirection === 'row-reverse' || style.direction === 'rtl';
        const directionMultiplier = isReverse ? -1 : 1;

        const updateArrows = () => {
            const scrollLeft = slider.scrollLeft;
            const maxScroll = slider.scrollWidth - slider.clientWidth;
            const isAtStart = isReverse ? Math.abs(scrollLeft) <= 10 : scrollLeft <= 10;
            const isAtEnd = isReverse ? Math.abs(scrollLeft) >= maxScroll - 10 : scrollLeft >= maxScroll - 10;

            prevBtn.classList.toggle('is-hidden', isAtStart);
            nextBtn.classList.toggle('is-hidden', isAtEnd);
        };

        slider.addEventListener('scroll', updateArrows);
        setTimeout(updateArrows, 50);

        let isDown = false, startX, scrollLeftState;

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.style.scrollSnapType = 'none'; 
            startX = e.pageX - slider.offsetLeft;
            scrollLeftState = slider.scrollLeft;
            slider.style.cursor = 'grabbing';
        });

        const stopDragging = () => {
            isDown = false;
            slider.style.cursor = 'grab';
            slider.style.scrollSnapType = 'x mandatory';
        };

        slider.addEventListener('mouseleave', stopDragging);
        slider.addEventListener('mouseup', stopDragging);
        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2 * directionMultiplier; 
            slider.scrollLeft = scrollLeftState - walk;
        });

        nextBtn.addEventListener('click', () => {
            const slide = slider.querySelector('.slide');
            if (slide) slider.scrollBy({ left: slide.offsetWidth * directionMultiplier, behavior: 'smooth' });
        });

        prevBtn.addEventListener('click', () => {
            const slide = slider.querySelector('.slide');
            if (slide) slider.scrollBy({ left: -slide.offsetWidth * directionMultiplier, behavior: 'smooth' });
        });
    });

    // --- COLOR ROTATOR ---
    document.querySelectorAll('.card').forEach((el, index) => {
        el.style.setProperty('--card-hue', (index * 40) % 360);
    });

    // --- DESIGN PAGE LOGIC ---
    (() => {
        const container = document.querySelector('.hero-section');
        const logos = Array.from(document.querySelectorAll('.floating-logo'));
        if (!container || logos.length === 0) return;

        const rows = 8, cols = 8, cells = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (!(r >= 3 && r <= 4 && c >= 2 && c <= 5)) cells.push({ r, c });
            }
        }
        const shuffledCells = cells.sort(() => Math.random() - 0.5);
        logos.forEach((logo, index) => {
            if (index >= shuffledCells.length) {
                logo.style.display = 'none'; 
                return;
            }
            const { r, c } = shuffledCells[index];
            const top = (r * (100 / rows)) + (100 / rows / 2) + (Math.random() * 4 - 2);
            const left = (c * (100 / cols)) + (100 / cols / 2) + (Math.random() * 4 - 2);
            logo.style.top = `${top}%`;
            logo.style.left = `${left}%`;
            logo.style.transform = `translate(-50%, -50%)`;
        });
    })();

    // Hero Flicker Logic
    (() => {
        const heroElements = document.querySelectorAll('.hero-title, .floating-logo, .hero-anim');
        if (heroElements.length === 0) return;

        function triggerRandomFlicker() {
            const nextWait = Math.floor(Math.random() * (18000 - 12000 + 1)) + 12000;
            setTimeout(() => {
                heroElements.forEach(el => el.classList.add('is-flickering'));
                setTimeout(() => {
                    heroElements.forEach(el => el.classList.remove('is-flickering'));
                    triggerRandomFlicker(); 
                }, 1000); 
            }, nextWait);
        }
        setTimeout(triggerRandomFlicker, 6000);
    })();

    // --- NOISE PAGE ENGINE ---
    const audio = document.getElementById('audio-player');
    const svg = document.getElementById('tapeMachine');

    if (audio && svg) {
        let audioCtx, analyser, dataArray, source, animationFrameId;
        let tapeStartTime = null, pausedTimeOffset = 0;
        const tapeLoopDuration = 5000;

        // Helper to format seconds into M:SS
        const formatTime = (seconds) => {
            if (isNaN(seconds) || seconds === Infinity) return "0:00";
            const m = Math.floor(seconds / 60);
            const s = Math.floor(seconds % 60);
            return `${m}:${s < 10 ? '0' : ''}${s}`;
        };

        const machine = {
            path: svg.querySelector('#Tape'),
            tapeTab: svg.querySelector('#tapeTab'),
            meterL: svg.querySelector('#meterLeft'),
            meterR: svg.querySelector('#meterRight'),
            playBtnsSVG: ['button5', 'button10', 'button12', 'button14'].map(id => svg.querySelector(`#${id}`)),
            faders: Array.from({length: 7}, (_, i) => svg.querySelector(`#fader${i + 1}`)),
            knobs: ['smknob1', 'smknob2', 'smknob3', 'smknob4', 'knob1', 'knob2'].map(id => svg.querySelector(`#${id}`))
        };

        const spools = {
            anti: ['tape1', 'tape2', 'supplyReel', 'spool1', 'spool5'].map(id => svg.querySelector(`#${id}`)),
            clock: ['spool2', 'spool3', 'spool4'].map(id => svg.querySelector(`#${id}`)),
            takeup: svg.querySelector('#takeupReel')
        };

        const ui = {
            playBtn: document.getElementById('play-pause-btn'),
            stopBtn: document.getElementById('stop-btn'),
            skipBtn: document.getElementById('next-btn'),
            prevBtn: document.getElementById('prev-btn'),
            vol: document.getElementById('volume-slider'),
            progress: document.getElementById('progress-bar'),
            playIcon: document.getElementById('play-icon'),
            current: document.getElementById('current-time'),
            duration: document.getElementById('duration'), // Reference to the duration span
            trackTitle: document.getElementById('track-title')
        };

        const initAudio = () => {
            if (audioCtx) return; 
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            source = audioCtx.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioCtx.destination);
            analyser.fftSize = 64; 
            dataArray = new Uint8Array(analyser.frequencyBinCount);
        };

        const randomizeHardware = () => {
            machine.knobs.forEach(k => k && (k.style.transform = `rotate(${Math.round(Math.random() * 160 - 80)}deg)`));
            machine.faders.forEach(f => f && (f.style.transform = `translateY(-${(Math.random() * 53.6).toFixed(2)}px)`));
        };

        const resetHardware = (fullStop = false) => {
            machine.faders.forEach(f => f && (f.style.transform = `translateY(0)`));
            machine.playBtnsSVG.forEach(b => b?.classList.remove('btn-pressed'));
            if (fullStop && machine.meterL && machine.meterR) {
                machine.meterL.style.transform = `rotate(90deg)`;
                machine.meterR.style.transform = `rotate(300deg)`;
            }
        };

        const animate = (currentTime) => {
            if (audio.paused) return;

            if (!tapeStartTime) tapeStartTime = currentTime - pausedTimeOffset;
            const elapsed = currentTime - tapeStartTime;
            const progress = (elapsed % tapeLoopDuration) / tapeLoopDuration;
            const rot = (elapsed / 20) % 360; 

            spools.anti.forEach(el => el && (el.style.transform = `rotate(-${rot}deg)`));
            spools.clock.forEach(el => el && (el.style.transform = `rotate(${rot}deg)`));
            if (spools.takeup) spools.takeup.style.transform = `rotate(-${rot * 1.05}deg)`;

            if (machine.path && machine.tapeTab) {
                const len = machine.path.getTotalLength();
                const dist = len - (progress * len);
                const p = machine.path.getPointAtLength(dist);
                const delta = 1;
                const nextP = machine.path.getPointAtLength(dist - delta < 0 ? dist + delta : dist - delta);
                let angle = Math.atan2(nextP.y - p.y, nextP.x - p.x) * (180 / Math.PI);
                if (dist - delta < 0) angle += 180;
                machine.tapeTab.setAttribute('transform', `translate(${p.x}, ${p.y}) rotate(${angle + 90})`);
            }

            if (analyser) {
                analyser.getByteFrequencyData(dataArray);
                const intensityL = (dataArray.slice(0, 15).reduce((a, b) => a + b) / 15) / 255;
                const intensityR = (dataArray.slice(16, 31).reduce((a, b) => a + b) / 15) / 255;
                if (machine.meterR) machine.meterR.style.transform = `rotate(${300 + (intensityR * 220)}deg)`;
                if (machine.meterL) machine.meterL.style.transform = `rotate(${90 - (intensityL * 220)}deg)`;
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        const loadTrack = (index) => {
            const trackItems = document.querySelectorAll('.track-item');
            if (!trackItems.length) return 0;
            let targetIndex = (index + trackItems.length) % trackItems.length;
            const item = trackItems[targetIndex];
            audio.src = item.getAttribute('data-src');
            if (ui.trackTitle) ui.trackTitle.innerText = item.innerText;
            trackItems.forEach(li => li.classList.remove('active'));
            item.classList.add('active');
            tapeStartTime = null; pausedTimeOffset = 0;
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            audio.play().then(() => {
                initAudio();
                // Update duration when loading a new track via click or skip
                if (ui.duration) ui.duration.textContent = formatTime(audio.duration);
                if (ui.playIcon) ui.playIcon.className = 'pause-icon';
                machine.playBtnsSVG.forEach(b => b?.classList.add('btn-pressed'));
                if (machine.tapeTab) machine.tapeTab.style.opacity = "1";
                animationFrameId = requestAnimationFrame(animate);
                randomizeHardware();
            }).catch(() => {});
            return targetIndex;
        };

        let globalTrackIndex = 0;
        ui.playBtn?.addEventListener('click', () => {
            if (audio.paused) {
                initAudio();
                
                // FIX: Sync title if it's still default
                if (ui.trackTitle && ui.trackTitle.innerText === 'SELECT A TRACK') {
                    const activeItem = document.querySelector('.track-item.active');
                    if (activeItem) ui.trackTitle.innerText = activeItem.innerText;
                }

                // FIX: Sync duration immediately if metadata is already loaded
                if (ui.duration && audio.duration) {
                    ui.duration.textContent = formatTime(audio.duration);
                }
                
                audio.play().then(() => {
                    if (machine.tapeTab) machine.tapeTab.style.opacity = "1";
                    ui.playIcon.className = 'pause-icon';
                    machine.playBtnsSVG.forEach(b => b?.classList.add('btn-pressed'));
                    randomizeHardware();
                    animationFrameId = requestAnimationFrame(animate);
                });
            } else {
                audio.pause();
                ui.playIcon.className = 'play-icon';
                pausedTimeOffset = performance.now() - (tapeStartTime || performance.now());
                resetHardware();
            }
        });

        ui.stopBtn?.addEventListener('click', () => {
            audio.pause();
            audio.currentTime = 0;
            if (machine.tapeTab) machine.tapeTab.style.opacity = "0";
            pausedTimeOffset = 0;
            ui.playIcon.className = 'play-icon';
            resetHardware(true);
        });

        ui.skipBtn?.addEventListener('click', () => { globalTrackIndex = loadTrack(globalTrackIndex + 1); });
        ui.prevBtn?.addEventListener('click', () => { globalTrackIndex = loadTrack(globalTrackIndex - 1); });
        if (ui.vol) ui.vol.addEventListener('input', (e) => audio.volume = e.target.value);

        // Metadata listener for tracks that haven't loaded yet
        audio.addEventListener('loadedmetadata', () => {
            if (ui.duration) ui.duration.textContent = formatTime(audio.duration);
        });

        audio.addEventListener('timeupdate', () => {
            if (ui.progress) ui.progress.value = (audio.currentTime / audio.duration) * 100 || 0;
            if (ui.current) {
                ui.current.textContent = formatTime(audio.currentTime);
            }
        });

        document.querySelectorAll('.track-item').forEach((item, index) => {
            item.addEventListener('click', () => { globalTrackIndex = loadTrack(index); });
        });

        audio.addEventListener('ended', () => { globalTrackIndex = loadTrack(globalTrackIndex + 1); });
    }

    // --- MISC PAGE LOGICS ---

    // Transcript Toggle
    const transBtn = document.getElementById("transcript-btn");
    const transBox = document.getElementById("transcript-section");
    if (transBtn && transBox) {
        transBtn.addEventListener('click', () => {
            transBox.classList.toggle("expanded");
            transBtn.classList.toggle("clicked");
        });
    }

    // Lit Switch Logic
    const mySwitch = document.querySelector('#litSwitch');
    if (mySwitch) {
        mySwitch.addEventListener('change', function() {
            const isChecked = this.checked;
            document.querySelectorAll(':root, .dust-overlay, .scanlines, .slider, .card, .work-item, .work-stack, .work-info, .cassette-menu, .led, .power-indicator, .btn-tape, .tape-control, .hero-anim, .hero-section, #heroType, .heroPoem, .wordsBody, .pubHed-section, .footnote, #poetsTagline, .ink-container, .footer-id, .social-links')
                .forEach(el => el.classList.toggle('litMode', isChecked));
        });
    }

    //Lit Switch Animations
    const toggle = document.querySelector('#litSwitch input');
    const target = document.querySelector('#glitchBody');

    if (toggle && target) {

        const handleToggle = (isInitialLoad = false) => {
            target.classList.remove('switchGlitch');

            if (toggle.checked) { 
                if (isInitialLoad) return;
                void target.offsetWidth; 
                target.classList.add('switchGlitch');
            }
        };

        toggle.addEventListener('change', () => handleToggle(false));
        
        // Initialize
        handleToggle(true);
    }

});

// Margin Adjustment (Global scope, guarded)
function adjustMargin() {
    const hero = document.getElementById('tapeMachine');
    const subhero = document.getElementById('subhero');
    if (hero && subhero) {
        subhero.style.marginTop = (hero.offsetWidth - 30) + 'px';
    }
}
window.addEventListener('resize', adjustMargin);
window.addEventListener('load', adjustMargin);