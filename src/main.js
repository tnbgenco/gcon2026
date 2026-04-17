// Apple-style fade-in-on-scroll animation
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
  const fadeElements = document.querySelectorAll('.fade-in');
  fadeElements.forEach(el => observer.observe(el));
});

// For Vite, DOMContentLoaded might have already fired
const fadeElements = document.querySelectorAll('.fade-in');
fadeElements.forEach(el => observer.observe(el));

// --- Speaker Modal Logic ---
window.openSpeakerModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.closeSpeakerModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

window.addEventListener('click', function(event) {
  if (event.target.classList.contains('modal-overlay')) {
    event.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// --- Sticky Scroll Animation for Moderators ---
window.addEventListener('scroll', () => {
  const section = document.getElementById('moderator-scroll-section');
  if (!section) return;

  const rect = section.getBoundingClientRect();
  const top = rect.top;
  // Calculate the height of the scrollable area (total height minus viewport)
  const scrollHeight = section.offsetHeight - window.innerHeight;
  
  if (scrollHeight <= 0) return;

  // Progress from 0 to 1
  let progress = -top / scrollHeight;
  if (progress < 0) progress = 0;
  if (progress > 1) progress = 1;

  // Fade in text slightly before animating images fully in
  const modText = document.querySelector('.mod-text-fade');
  if (modText) {
    if (progress > 0.05) {
      modText.style.opacity = '1';
      modText.style.transform = 'translateY(0)';
    } else {
      modText.style.opacity = '0';
      modText.style.transform = 'translateY(20px)';
    }
  }

  // Smooth easing function for image animation timeline
  // Start animation from 5% to 80% scroll
  let p = (progress - 0.05) / 0.75; 
  if (p < 0) p = 0;
  if (p > 1) p = 1;
  
  // Ease-out cubic: 1 - (1 - p)^3
  const easeOut = 1 - Math.pow(1 - p, 3);

  const modImages = document.querySelectorAll('.mod-img');
  modImages.forEach((img) => {
    const start = parseFloat(img.getAttribute('data-start'));
    let target = parseFloat(img.getAttribute('data-target'));
    
    // Scale down horizontal spread on smaller devices to keep them visible
    if (window.innerWidth < 768) {
       target = target * 0.9; 
    }
    
    // Calculate current position
    const currentX = start + (target - start) * easeOut;
    // Apply transform (centering anchor is left: 50%, so translate -50% first)
    img.style.transform = `translateX(calc(-50% + ${currentX}vw))`;
  });
});

// --- Sticky Scroll Animation for Facts ---
window.addEventListener('scroll', () => {
  const factSection = document.getElementById('facts-scroll-section');
  if (factSection) {
    const factRect = factSection.getBoundingClientRect();
    const factScrollHeight = Math.max(1, factSection.offsetHeight - window.innerHeight);
    
    let factProgress = -factRect.top / factScrollHeight;
    if (factProgress < 0) factProgress = 0;
    if (factProgress > 1) factProgress = 1;

    // Ease-out progress for counter
    const factEaseOut = 1 - Math.pow(1 - factProgress, 3);
    
    const factNumbers = document.querySelectorAll('.fact-number');
    factNumbers.forEach(el => {
      const target = parseInt(el.getAttribute('data-target'));
      const current = Math.round(target * factEaseOut);
      el.innerText = current;
    });
  }
});

// --- Sticky Scroll Animation for Emcees ---
window.addEventListener('scroll', () => {
  const section = document.getElementById('emcee-scroll-section');
  if (!section) return;

  const rect = section.getBoundingClientRect();
  const top = rect.top;
  const scrollHeight = Math.max(1, section.offsetHeight - window.innerHeight);
  
  let progress = -top / scrollHeight;
  if (progress < 0) progress = 0;
  if (progress > 1) progress = 1;

  // Fade in text 
  const emceeText = document.querySelector('.emcee-text-fade');
  if (emceeText) {
    if (progress > 0.05) {
      emceeText.style.opacity = '1';
      emceeText.style.transform = 'translateY(0)';
    } else {
      emceeText.style.opacity = '0';
      emceeText.style.transform = 'translateY(20px)';
    }
  }

  // Animation logic: fade in from IKA (1), then DAYANGKU (2), then IJAT (3)
  const emceeImages = document.querySelectorAll('.emcee-img');
  emceeImages.forEach((img) => {
    const order = parseInt(img.getAttribute('data-order'));
    let startP = 0, endP = 0.2;
    if (order === 1) { startP = 0.1; endP = 0.3; }
    else if (order === 2) { startP = 0.35; endP = 0.55; }
    else if (order === 3) { startP = 0.6; endP = 0.8; }
    
    let p = (progress - startP) / (endP - startP);
    if (p < 0) p = 0;
    if (p > 1) p = 1;
    
    // Ease-out cubic for smoother animation
    const easeOut = 1 - Math.pow(1 - p, 3);
    
    img.style.opacity = easeOut;
    // Slight move-up effect for premium feel
    img.style.transform = `translateX(-50%) translateY(${(1 - easeOut) * 20}px)`;
  });
});

// --- Live Agenda Indicator ---
function updateLiveEvent() {
  const isDay1 = window.location.pathname.includes('day1');
  const isDay2 = window.location.pathname.includes('day2');
  
  if (!isDay1 && !isDay2) return;
  
  const targetDateStr = isDay1 ? '2026-04-22' : '2026-04-23';
  const now = new Date();
  
  const currentDateStr = now.getFullYear() + '-' + 
                         String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                         String(now.getDate()).padStart(2, '0');
                         
  if (currentDateStr !== targetDateStr) return;
  
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const currentTotalMins = currentHour * 60 + currentMin;

  const timelineItems = document.querySelectorAll('.timeline-item');
  
  timelineItems.forEach(item => {
    const timeEl = item.querySelector('.timeline-time');
    if (!timeEl) return;
    
    // Clean up existing dot if present
    const existingDot = timeEl.querySelector('.blinking-dot');
    if (existingDot) existingDot.remove();
    
    const timeText = timeEl.textContent.trim();
    let isLive = false;
    
    if (timeText.includes('-')) {
      const [startStr, endStr] = timeText.split('-').map(s => s.trim());
      const [startH, startM] = startStr.split(':').map(Number);
      const [endH, endM] = endStr.split(':').map(Number);
      
      const startTotalMins = startH * 60 + startM;
      const endTotalMins = endH * 60 + endM;
      
      if (currentTotalMins >= startTotalMins && currentTotalMins < endTotalMins) {
        isLive = true;
      }
    } else if (timeText.includes(':')) {
      const [h, m] = timeText.split(':').map(Number);
      const totalMins = h * 60 + m;
      // Single time events are considered active for 30 minutes
      if (currentTotalMins >= totalMins && currentTotalMins < totalMins + 30) {
        isLive = true;
      }
    }
    
    if (isLive) {
      const dot = document.createElement('span');
      dot.className = 'blinking-dot';
      timeEl.insertBefore(dot, timeEl.firstChild);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateLiveEvent();
  setInterval(updateLiveEvent, 60000); // Check every minute
});

// For dynamic execution safely in case DOM is already loaded (Vite HMR)
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  updateLiveEvent();
  setInterval(updateLiveEvent, 60000);
}
