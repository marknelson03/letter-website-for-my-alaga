function createHeart(container) {
    const heart = document.createElement("span");
    heart.innerHTML = "❤️";
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.animationDuration = (Math.random() * 3 + 3) + "s";
    container.appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 6000);
}

// Music play/pause handling to satisfy browser autoplay policies
document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('bg-music');
    const hint = document.getElementById('audio-hint');
    const hintBtn = document.getElementById('enable-sound-btn');
    if (!audio) return;

    // Start hearts animation after DOM ready
    const heartsContainer = document.querySelector('.hearts');
    if (heartsContainer) setInterval(() => createHeart(heartsContainer), 300);

    // Password and envelope interaction
    const envelopeFlap = document.querySelector('.envelope-flap');
    const passwordModal = document.getElementById('password-modal');
    const passwordInput = document.getElementById('password-input');
    const passwordSubmit = document.getElementById('password-submit');
    const passwordError = document.getElementById('password-error');
    const correctPassword = 'mydadaismypalagi';
    let envelopeOpened = false;
    
    if (envelopeFlap) {
        envelopeFlap.addEventListener('click', () => {
            const envelope = document.querySelector('.envelope');
            // If envelope is currently open, just close it (no password needed)
            if (envelopeOpened && envelope.classList.contains('open')) {
                envelope.classList.remove('open');
                envelopeOpened = false;
            } else {
                // If envelope is closed, show password modal to open it
                passwordModal.classList.remove('hidden');
                passwordInput.focus();
                passwordInput.value = '';
                passwordError.textContent = '';
            }
        });
    }
    
    // Handle password submission
    if (passwordSubmit) {
        passwordSubmit.addEventListener('click', checkPassword);
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkPassword();
            }
        });
    }
    
    function checkPassword() {
        const enteredPassword = passwordInput.value;
        const envelope = document.querySelector('.envelope');
        
        if (enteredPassword === correctPassword) {
            // Correct password - open the envelope
            passwordModal.classList.add('hidden');
            envelope.classList.add('open');
            envelopeOpened = true;
            passwordError.textContent = '';
        } else {
            // Wrong password
            passwordError.textContent = '❌ Wrong password, try again';
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    // Image load diagnostics and visible fallback for broken images
    const photos = document.querySelectorAll('.photo');
    photos.forEach(img => {
        // set a friendly fallback message to show via CSS when broken
        img.dataset.fallback = 'Image not available';

        img.addEventListener('load', () => {
            console.log('Image loaded:', img.src);
            img.classList.remove('broken');
        });

        img.addEventListener('error', () => {
            console.error('Image failed to load:', img.src);
            // mark as broken so CSS shows the placeholder message
            img.classList.add('broken');
            // remove src to avoid repeated failed requests
            try { img.removeAttribute('src'); } catch(e){}
        });
    });

    // Try to autoplay with sound. Many browsers block audible autoplay;
    // if that fails, fallback to muted autoplay so at least music runs silently.
    audio.muted = false;
    audio.play().then(() => {
        // audible autoplay succeeded — hide hint if present
        if (hint) hint.classList.add('hidden');
    }).catch(() => {
        // audible autoplay blocked — try muted autoplay as fallback
        audio.muted = true;
        audio.play().then(() => {
            // muted autoplay started; show hint to request unmute
            if (hint) hint.classList.remove('hidden');
        }).catch(() => {
            // muted autoplay also blocked; show hint to request any user gesture
            if (hint) hint.classList.remove('hidden');
        });
    });

    // Add a one-time global interaction handler so a single click/tap
    // will unmute and play audible audio (this satisfies browser gesture requirement).
    function enableAudio() {
        try {
            audio.muted = false;
            audio.volume = 1;
            audio.play().catch(() => {});
        } catch (e) {}
        
        // Hide overlay with fade-out animation
        if (hint) hint.classList.add('hidden');
        
        // Show letter with fade-in animation after overlay fades
        const letter = document.querySelector('.letter');
        if (letter) {
            setTimeout(() => {
                letter.classList.add('show');
            }, 50);
        }
        
        window.removeEventListener('click', enableAudio);
        window.removeEventListener('touchstart', enableAudio);
    }

    // Only clicking the hint button enables audio
    if (hintBtn) hintBtn.addEventListener('click', enableAudio);

    // The overlay remains visible until the user explicitly clicks the button.
});
