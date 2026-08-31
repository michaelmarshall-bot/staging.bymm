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

    // --- Testimonial Slider ---
    document.querySelectorAll('.testimonial-wrapper').forEach((wrapper) => {
    const slider = wrapper.querySelector('.slider-container');
    const nextBtn = wrapper.querySelector('.slideArrow.next');
    const prevBtn = wrapper.querySelector('.slideArrow.prev');
    const track = wrapper.querySelector('.hardware-track'); // 1. Select the new track

    if (!slider || !nextBtn || !prevBtn) return;

    // 2. Consolidate scroll updates (arrows + tuner needle)
    const updateProgress = () => {
        const scrollLeft = slider.scrollLeft;
        const maxScroll = slider.scrollWidth - slider.clientWidth;

        // Arrow boundary checks (Guard clause for mobile)
        if (window.innerWidth >= 640) {
            const isAtStart = scrollLeft <= 10;
            const isAtEnd = scrollLeft >= maxScroll - 10;
            prevBtn.classList.toggle('is-hidden', isAtStart);
            nextBtn.classList.toggle('is-hidden', isAtEnd);
        }

        // Tuner needle sync
        if (track) {
            const pct = maxScroll <= 0 ? 0 : scrollLeft / maxScroll;
            wrapper.style.setProperty('--scroll-pct', pct);
        }
    };

    // Scroll and resize listeners (Now calling the consolidated function)
    slider.addEventListener('scroll', updateProgress);
    window.addEventListener('resize', updateProgress);
    setTimeout(updateProgress, 50);

    /* --- EXISTING DRAG LOGIC FOR THE CARDS --- */
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
        const walk = (x - startX) * 2; 
        slider.scrollLeft = scrollLeftState - walk; 
    });

    /* --- EXISTING BUTTON LOGIC --- */
    const smoothScroll = (amount) => {
        slider.style.scrollSnapType = 'none';
        slider.scrollBy({ left: amount, behavior: 'smooth' });
        setTimeout(() => {
            slider.style.scrollSnapType = 'x mandatory';
        }, 500); 
    };

    nextBtn.addEventListener('click', () => {
        const slide = slider.querySelector('.slide');
        if (slide) smoothScroll(slide.offsetWidth);
    });

    prevBtn.addEventListener('click', () => {
        const slide = slider.querySelector('.slide');
        if (slide) smoothScroll(-slide.offsetWidth);
    });

    /* --- NEW: DRAG LOGIC FOR THE TUNER TRACK --- */
    if (track) {
        let isTrackDragging = false;

        const handleTrackDrag = (e) => {
            const rect = track.getBoundingClientRect();
            // Calculate relative pointer position, clamped strictly between 0 and 1
            const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
            const pct = x / rect.width;
            
            // Remove snap temporarily for buttery smooth 1:1 mouse tracking
            slider.style.scrollSnapType = 'none';
            slider.scrollLeft = pct * (slider.scrollWidth - slider.clientWidth);
        };

        // Pointer events handle both mouse clicks and touch swipes seamlessly
        track.addEventListener('pointerdown', (e) => {
            isTrackDragging = true;
            track.setPointerCapture(e.pointerId); 
            handleTrackDrag(e);
        });

        track.addEventListener('pointermove', (e) => {
            if (!isTrackDragging) return;
            handleTrackDrag(e);
        });

        const stopTrackDragging = (e) => {
            if (!isTrackDragging) return;
            isTrackDragging = false;
            track.releasePointerCapture(e.pointerId);
            // Restore snap functionality once the user lets go of the needle
            slider.style.scrollSnapType = 'x mandatory';
        };

        track.addEventListener('pointerup', stopTrackDragging);
        track.addEventListener('pointercancel', stopTrackDragging);
    }
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
    let audioCtx, analyser, dataArray, source, animationFrameId, gainNode;
    let tapeStartTime = null, pausedTimeOffset = 0;
    const tapeLoopDuration = 5000;

    // Helper to format seconds into M:SS
    const formatTime = (seconds) => {
        if (isNaN(seconds) || seconds === Infinity) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Generic cross-browser slider background filler using theme variables
    const updateSliderVisual = (slider) => {
        if (!slider) return;
        const min = parseFloat(slider.min) || 0;
        // Fallback to 100 if max attribute is missing, which is the HTML range default
        const max = slider.max ? parseFloat(slider.max) : 100; 
        const val = parseFloat(slider.value) || 0;
        
        // Calculate percentage relative to the slider's specific min/max bounds
        const pct = ((val - min) / (max - min)) * 100;
        
        slider.style.background = `linear-gradient(to right, var(--tape-color, #00ff00) ${pct}%, var(--slider-bar-color, #222) ${pct}%)`;
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
        duration: document.getElementById('duration'), 
        trackTitle: document.getElementById('track-title')
    };
    
    const initAudio = () => {
        if (audioCtx) return; 
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        gainNode = audioCtx.createGain();
        source = audioCtx.createMediaElementSource(audio);
        
        source.connect(analyser);
        analyser.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        analyser.fftSize = 64; 
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        if (ui.vol) {
            const rawVol = parseFloat(ui.vol.value);
            if (!isNaN(rawVol)) {
                gainNode.gain.value = rawVol > 1 ? rawVol / 100 : rawVol;
            }
        }
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
        const grabbedSrc = item.getAttribute('data-src');
        
        console.log("Attempting to load source:", grabbedSrc);

        initAudio();
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        audio.src = grabbedSrc;
        audio.load(); 

        if (ui.trackTitle) ui.trackTitle.innerText = item.innerText;
        trackItems.forEach(li => li.classList.remove('active'));
        item.classList.add('active');
        tapeStartTime = null; pausedTimeOffset = 0;
        
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        
        audio.play().then(() => {
            if (ui.duration) ui.duration.textContent = formatTime(audio.duration);
            if (ui.playIcon) ui.playIcon.className = 'pause-icon';
            machine.playBtnsSVG.forEach(b => b?.classList.add('btn-pressed'));
            if (machine.tapeTab) machine.tapeTab.style.opacity = "1";
            
            animationFrameId = requestAnimationFrame(animate);
            randomizeHardware();
        }).catch((err) => {
            console.warn("Playback prevented by browser:", err); 
        });
        
        return targetIndex;
    };

    let globalTrackIndex = 0;
    
    ui.playBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        if (!audio.getAttribute('src')) {
            globalTrackIndex = loadTrack(0);
            return; 
        }

        if (audio.paused) {
            initAudio();
            
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            
            if (ui.trackTitle && ui.trackTitle.innerText === 'SELECT A TRACK') {
                const activeItem = document.querySelector('.track-item.active');
                if (activeItem) ui.trackTitle.innerText = activeItem.innerText;
            }

            if (ui.duration && audio.duration) {
                ui.duration.textContent = formatTime(audio.duration);
            }
            
            audio.play().then(() => {
                if (machine.tapeTab) machine.tapeTab.style.opacity = "1";
                ui.playIcon.className = 'pause-icon';
                machine.playBtnsSVG.forEach(b => b?.classList.add('btn-pressed'));
                randomizeHardware();
                animationFrameId = requestAnimationFrame(animate);
            }).catch(e => console.log("Playback prevented:", e));
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
        if (ui.progress) {
            ui.progress.value = 0;
            updateSliderVisual(ui.progress); // Visual reset for progress bar
        }
        if (machine.tapeTab) machine.tapeTab.style.opacity = "0";
        pausedTimeOffset = 0;
        ui.playIcon.className = 'play-icon';
        resetHardware(true);
    });

    ui.skipBtn?.addEventListener('click', () => { globalTrackIndex = loadTrack(globalTrackIndex + 1); });
    ui.prevBtn?.addEventListener('click', () => { globalTrackIndex = loadTrack(globalTrackIndex - 1); });
    
    if (ui.vol) {
        ui.vol.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (isNaN(val)) return;
            
            const normalizedVal = val > 1 ? val / 100 : val;
            
            if (gainNode) {
                gainNode.gain.value = normalizedVal;
            } else {
                audio.volume = normalizedVal;
            }
            
            updateSliderVisual(ui.vol); // Render volume fill instantly on slide
        });
    }

    if (ui.progress) {
        ui.progress.addEventListener('input', (e) => {
            if (audio.duration) {
                audio.currentTime = (e.target.value / 100) * audio.duration;
            }
            updateSliderVisual(ui.progress); // Render progress fill instantly when scrubbing
        });
    }

    audio.addEventListener('loadedmetadata', () => {
        if (ui.duration) ui.duration.textContent = formatTime(audio.duration);
        updateSliderVisual(ui.progress); 
    });

    audio.addEventListener('timeupdate', () => {
        if (ui.progress) {
            ui.progress.value = (audio.currentTime / audio.duration) * 100 || 0;
            updateSliderVisual(ui.progress); // Dynamic track progress updates
        }
        if (ui.current) {
            ui.current.textContent = formatTime(audio.currentTime);
        }
    });

    document.querySelectorAll('.track-item').forEach((item, index) => {
        item.addEventListener('click', () => { globalTrackIndex = loadTrack(index); });
    });

    audio.addEventListener('ended', () => { globalTrackIndex = loadTrack(globalTrackIndex + 1); });
    
    // Initial run to map system baselines for both custom track elements
    updateSliderVisual(ui.progress);
    updateSliderVisual(ui.vol);
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
                .forEach(el => {
                    el.classList.toggle('litMode', isChecked);
                    
                    // Safari Fix: Force a layout recalculation specifically for sections 
                    // to prevent WebKit from dropping the padding on class toggle.
                    if (el.tagName === 'SECTION') {
                        void el.offsetHeight;
                    }
                });
        });
    }

    // Lit Switch Animations
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




// Incident Clock

document.addEventListener('DOMContentLoaded', function() {
    // Select all elements with the class 'timer-wrapper'
    const wrappers = document.querySelectorAll('.timer-wrapper');
    
    // Calculate the centered coordinates
    const leftPos = (window.innerWidth / 2) - 325;
    const topPos = (window.innerHeight / 2) - 325;

    wrappers.forEach(function(wrapper) {
        // 1. Apply the CSS positioning (don't forget to append 'px')
        wrapper.style.left = leftPos + 'px';
        wrapper.style.top = topPos + 'px';

        // 2. Replicate .delay(1000).fadeIn(1000)
        setTimeout(function() {
            // If your CSS hides the element with display: none, make it block first
            if (window.getComputedStyle(wrapper).display === 'none') {
                wrapper.style.display = 'block';
            }
            
            // Animate opacity from 0 to 1 over 1000 milliseconds
            wrapper.animate([
                { opacity: 0 },
                { opacity: 1 }
            ], {
                duration: 1000,
                fill: 'forwards'
            });
            
        }, 1000); // The 1000ms delay before the animation starts
    });
});

// Countdown.min.js

var module, countdown = function(r) {
	function v(a, b) {
		var c = a.getTime();
		a.setUTCMonth(a.getUTCMonth() + b);
		return Math.round((a.getTime() - c) / 864E5)
	}

	function t(a) {
		var b = a.getTime(),
			c = new Date(b);
		c.setUTCMonth(a.getUTCMonth() + 1);
		return Math.round((c.getTime() - b) / 864E5)
	}

	function f(a, b) {
		return a + " " + (1 === a ? p[b] : q[b])
	}

	function n() {}

	function l(a, b, c, g, x, d) {
		0 <= a[c] && (b += a[c], delete a[c]);
		b /= x;
		if (1 >= b + 1) return 0;
		if (0 <= a[g]) {
			a[g] = +(a[g] + b).toFixed(d);
			switch (g) {
				case "seconds":
					if (60 !== a.seconds || isNaN(a.minutes)) break;
					a.minutes++;
					a.seconds = 0;
				case "minutes":
					if (60 !== a.minutes || isNaN(a.hours)) break;
					a.hours++;
					a.minutes = 0;
				case "hours":
					if (24 !== a.hours || isNaN(a.days)) break;
					a.days++;
					a.hours = 0;
				case "days":
					if (7 !== a.days || isNaN(a.weeks)) break;
					a.weeks++;
					a.days = 0;
				case "weeks":
					if (a.weeks !== t(a.refMonth) / 7 || isNaN(a.months)) break;
					a.months++;
					a.weeks = 0;
				case "months":
					if (12 !== a.months || isNaN(a.years)) break;
					a.years++;
					a.months = 0;
				case "years":
					if (10 !== a.years || isNaN(a.decades)) break;
					a.decades++;
					a.years = 0;
				case "decades":
					if (10 !== a.decades ||
						isNaN(a.centuries)) break;
					a.centuries++;
					a.decades = 0;
				case "centuries":
					if (10 !== a.centuries || isNaN(a.millennia)) break;
					a.millennia++;
					a.centuries = 0
			}
			return 0
		}
		return b
	}

	function w(a, b, c, g, d, k) {
		a.start = b;
		a.end = c;
		a.units = g;
		a.value = c.getTime() - b.getTime();
		if (0 > a.value) {
			var f = c;
			c = b;
			b = f
		}
		a.refMonth = new Date(b.getFullYear(), b.getMonth(), 15);
		try {
			a.millennia = 0;
			a.centuries = 0;
			a.decades = 0;
			a.years = c.getUTCFullYear() - b.getUTCFullYear();
			a.months = c.getUTCMonth() - b.getUTCMonth();
			a.weeks = 0;
			a.days = c.getUTCDate() - b.getUTCDate();
			a.hours = c.getUTCHours() - b.getUTCHours();
			a.minutes = c.getUTCMinutes() - b.getUTCMinutes();
			a.seconds = c.getUTCSeconds() - b.getUTCSeconds();
			a.milliseconds = c.getUTCMilliseconds() - b.getUTCMilliseconds();
			var h;
			0 > a.milliseconds ? (h = s(-a.milliseconds / 1E3), a.seconds -= h, a.milliseconds += 1E3 * h) : 1E3 <= a.milliseconds && (a.seconds += m(a.milliseconds / 1E3), a.milliseconds %= 1E3);
			0 > a.seconds ? (h = s(-a.seconds / 60), a.minutes -= h, a.seconds += 60 * h) : 60 <= a.seconds && (a.minutes += m(a.seconds / 60), a.seconds %= 60);
			0 > a.minutes ? (h = s(-a.minutes /
				60), a.hours -= h, a.minutes += 60 * h) : 60 <= a.minutes && (a.hours += m(a.minutes / 60), a.minutes %= 60);
			0 > a.hours ? (h = s(-a.hours / 24), a.days -= h, a.hours += 24 * h) : 24 <= a.hours && (a.days += m(a.hours / 24), a.hours %= 24);
			for (; 0 > a.days;) a.months--, a.days += v(a.refMonth, 1);
			7 <= a.days && (a.weeks += m(a.days / 7), a.days %= 7);
			0 > a.months ? (h = s(-a.months / 12), a.years -= h, a.months += 12 * h) : 12 <= a.months && (a.years += m(a.months / 12), a.months %= 12);
			10 <= a.years && (a.decades += m(a.years / 10), a.years %= 10, 10 <= a.decades && (a.centuries += m(a.decades / 10), a.decades %=
				10, 10 <= a.centuries && (a.millennia += m(a.centuries / 10), a.centuries %= 10)));
			b = 0;
			!(g & 1024) || b >= d ? (a.centuries += 10 * a.millennia, delete a.millennia) : a.millennia && b++;
			!(g & 512) || b >= d ? (a.decades += 10 * a.centuries, delete a.centuries) : a.centuries && b++;
			!(g & 256) || b >= d ? (a.years += 10 * a.decades, delete a.decades) : a.decades && b++;
			!(g & 128) || b >= d ? (a.months += 12 * a.years, delete a.years) : a.years && b++;
			!(g & 64) || b >= d ? (a.months && (a.days += v(a.refMonth, a.months)), delete a.months, 7 <= a.days && (a.weeks += m(a.days / 7), a.days %= 7)) : a.months &&
				b++;
			!(g & 32) || b >= d ? (a.days += 7 * a.weeks, delete a.weeks) : a.weeks && b++;
			!(g & 16) || b >= d ? (a.hours += 24 * a.days, delete a.days) : a.days && b++;
			!(g & 8) || b >= d ? (a.minutes += 60 * a.hours, delete a.hours) : a.hours && b++;
			!(g & 4) || b >= d ? (a.seconds += 60 * a.minutes, delete a.minutes) : a.minutes && b++;
			!(g & 2) || b >= d ? (a.milliseconds += 1E3 * a.seconds, delete a.seconds) : a.seconds && b++;
			if (!(g & 1) || b >= d) {
				var e = l(a, 0, "milliseconds", "seconds", 1E3, k);
				if (e && (e = l(a, e, "seconds", "minutes", 60, k)) && (e = l(a, e, "minutes", "hours", 60, k)) && (e = l(a, e, "hours", "days",
						24, k)) && (e = l(a, e, "days", "weeks", 7, k)) && (e = l(a, e, "weeks", "months", t(a.refMonth) / 7, k))) {
					g = e;
					var n, p = a.refMonth,
						q = p.getTime(),
						r = new Date(q);
					r.setUTCFullYear(p.getUTCFullYear() + 1);
					n = Math.round((r.getTime() - q) / 864E5);
					if (e = l(a, g, "months", "years", n / t(a.refMonth), k))
						if (e = l(a, e, "years", "decades", 10, k))
							if (e = l(a, e, "decades", "centuries", 10, k))
								if (e = l(a, e, "centuries", "millennia", 10, k)) throw Error("Fractional unit overflow");
				}
			}
		} finally {
			delete a.refMonth
		}
		return a
	}

	function d(a, b, c, d, f) {
		var k;
		c = +c || 222;
		d = 0 < d ? d : NaN;
		f = 0 < f ? 20 > f ? Math.round(f) : 20 : 0;
		"function" === typeof a ? (k = a, a = null) : a instanceof Date || (a = null !== a && isFinite(a) ? new Date(a) : null);
		"function" === typeof b ? (k = b, b = null) : b instanceof Date || (b = null !== b && isFinite(b) ? new Date(b) : null);
		if (!a && !b) return new n;
		if (!k) return w(new n, a || new Date, b || new Date, c, d, f);
		var l = c & 1 ? 1E3 / 30 : c & 2 ? 1E3 : c & 4 ? 6E4 : c & 8 ? 36E5 : c & 16 ? 864E5 : 6048E5,
			h, e = function() {
				k(w(new n, a || new Date, b || new Date, c, d, f), h)
			};
		e();
		return h = setInterval(e, l)
	}
	var s = Math.ceil,
		m = Math.floor,
		p, q, u;
	n.prototype.toString =
		function() {
			var a = u(this),
				b = a.length;
			if (!b) return "";
			1 < b && (a[b - 1] = "and " + a[b - 1]);
			return a.join(", ")
		};
	n.prototype.toHTML = function(a) {
		a = a || "span";
		var b = u(this),
			c = b.length;
		if (!c) return "";
		for (var d = 0; d < c; d++) b[d] = "\x3c" + a + "\x3e" + b[d] + "\x3c/" + a + "\x3e";
		--c && (b[c] = "and " + b[c]);
		return b.join(", ")
	};
	u = function(a) {
		var b = [],
			c = a.millennia;
		c && b.push(f(c, 10));
		(c = a.centuries) && b.push(f(c, 9));
		(c = a.decades) && b.push(f(c, 8));
		(c = a.years) && b.push(f(c, 7));
		(c = a.months) && b.push(f(c, 6));
		(c = a.weeks) && b.push(f(c, 5));
		(c = a.days) &&
		b.push(f(c, 4));
		(c = a.hours) && b.push(f(c, 3));
		(c = a.minutes) && b.push(f(c, 2));
		(c = a.seconds) && b.push(f(c, 1));
		(c = a.milliseconds) && b.push(f(c, 0));
		return b
	};
	d.MILLISECONDS = 1;
	d.SECONDS = 2;
	d.MINUTES = 4;
	d.HOURS = 8;
	d.DAYS = 16;
	d.WEEKS = 32;
	d.MONTHS = 64;
	d.YEARS = 128;
	d.DECADES = 256;
	d.CENTURIES = 512;
	d.MILLENNIA = 1024;
	d.DEFAULTS = 222;
	d.ALL = 2047;
	d.setLabels = function(a, b) {
		a = a || [];
		a.split && (a = a.split("|"));
		b = b || [];
		b.split && (b = b.split("|"));
		for (var c = 0; 10 >= c; c++) p[c] = a[c] || p[c], q[c] = b[c] || q[c]
	};
	(d.resetLabels = function() {
		p = "millisecond second minute hour day week month year decade century millennium".split(" ");
		q = "milliseconds seconds minutes hours days weeks months years decades centuries millennia".split(" ")
	})();
	r && r.exports ? r.exports = d : "function" === typeof window.define && window.define.amd && window.define("countdown", [], function() {
		return d
	});
	return d
}(module);

// Custom Code

setInterval(function() {
	var timespan = countdown(new Date("08/25/2026"), new Date());

	var years = document.getElementById('years');
	years.innerHTML = timespan.years

	var months = document.getElementById('months');
	months.innerHTML = timespan.months

	var days = document.getElementById('days');
	days.innerHTML = timespan.days

	var hours = document.getElementById('hours');
	hours.innerHTML = timespan.hours

	var minutes = document.getElementById('minutes');
	minutes.innerHTML = timespan.minutes

	var seconds = document.getElementById('seconds');
	seconds.innerHTML = timespan.seconds

}, 1000);