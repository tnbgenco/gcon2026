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
