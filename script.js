/* ============================================
   PREMIUM PORTFOLIO - JAVASCRIPT
   Interactive functionality
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    // Initialize all modules
    initThemeToggle();
    initMobileMenu();
    initSmoothScroll();
    initHeaderScroll();
    initStatsCounter();
    initPortfolioFilter();
    initTestimonialsCarousel();
    initContactForm();
    initScrollReveal();
});

/* ============================================
   THEME TOGGLE (Dark Mode)
   ============================================ */

function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
    } else if (systemPrefersDark) {
        html.setAttribute('data-theme', 'dark');
    }

    toggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}

/* ============================================
   MOBILE MENU
   ============================================ */

function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    const body = document.body;

    // Skip if elements don't exist (e.g., on case study pages)
    if (!menuBtn || !mobileMenu) return;

    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking a link
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
            body.style.overflow = '';
        });
    });
}

/* ============================================
   SMOOTH SCROLL
   ============================================ */

function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const headerHeight = 80;
                const targetPosition = target.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ============================================
   HEADER SCROLL EFFECT
   ============================================ */

function initHeaderScroll() {
    const header = document.querySelector('.header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

/* ============================================
   STATS COUNTER ANIMATION
   ============================================ */

function initStatsCounter() {
    const stats = document.querySelectorAll('.stat-number');
    let animated = false;

    const animateStats = () => {
        stats.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    stat.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.textContent = target;
                }
            };

            updateCounter();
        });
    };

    // Use Intersection Observer to trigger animation when stats are visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                animateStats();
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.about-stats');
    if (statsSection) {
        observer.observe(statsSection);
    }
}

/* ============================================
   PORTFOLIO FILTER
   ============================================ */

function initPortfolioFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            // Filter items with animation
            portfolioItems.forEach(item => {
                const category = item.getAttribute('data-category');

                if (filter === 'all' || category === filter) {
                    item.classList.remove('hidden');
                    item.style.animation = 'fadeIn 0.5s ease forwards';
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });
}

/* ============================================
   TESTIMONIALS CAROUSEL
   ============================================ */

function initTestimonialsCarousel() {
    const carousel = document.getElementById('testimonialsCarousel');

    // Skip if carousel doesn't exist (e.g., on case study pages)
    if (!carousel) return;

    const slides = carousel.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.testimonials-dots .dot');
    const prevBtn = document.getElementById('prevTestimonial');
    const nextBtn = document.getElementById('nextTestimonial');

    let currentSlide = 0;
    let autoPlayInterval;

    const showSlide = (index) => {
        // Handle wrap-around
        if (index >= slides.length) index = 0;
        if (index < 0) index = slides.length - 1;

        // Update slides
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });

        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        currentSlide = index;
    };

    const nextSlide = () => showSlide(currentSlide + 1);
    const prevSlide = () => showSlide(currentSlide - 1);

    // Button controls
    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoPlay();
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoPlay();
    });

    // Dot controls
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            resetAutoPlay();
        });
    });

    // Auto-play
    const startAutoPlay = () => {
        autoPlayInterval = setInterval(nextSlide, 5000);
    };

    const resetAutoPlay = () => {
        clearInterval(autoPlayInterval);
        startAutoPlay();
    };

    // Start auto-play
    startAutoPlay();

    // Pause on hover
    carousel.addEventListener('mouseenter', () => {
        clearInterval(autoPlayInterval);
    });

    carousel.addEventListener('mouseleave', () => {
        startAutoPlay();
    });

    // Touch support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    const handleSwipe = () => {
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
            resetAutoPlay();
        }
    };
}

/* ============================================
   CONTACT FORM
   ============================================ */

function initContactForm() {
    const form = document.getElementById('contactForm');
    const successMessage = document.getElementById('formSuccess');

    // Skip if form doesn't exist (e.g., on case study pages)
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Reset errors
        form.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
        });

        // Validate form
        let isValid = true;
        const formData = new FormData(form);

        // Name validation
        const name = formData.get('name').trim();
        if (name.length < 2) {
            showError('name', 'Please enter your name');
            isValid = false;
        }

        // Email validation
        const email = formData.get('email').trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('email', 'Please enter a valid email address');
            isValid = false;
        }

        // Message validation
        const message = formData.get('message').trim();
        if (message.length < 10) {
            showError('message', 'Please enter a message (at least 10 characters)');
            isValid = false;
        }

        if (!isValid) return;

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Simulate form submission (replace with actual API call)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Show success message
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        successMessage.classList.add('show');
        form.reset();

        // Hide success message after 5 seconds
        setTimeout(() => {
            successMessage.classList.remove('show');
        }, 5000);
    });

    function showError(fieldName, message) {
        const field = form.querySelector(`[name="${fieldName}"]`);
        const group = field.closest('.form-group');
        const error = group.querySelector('.form-error');

        group.classList.add('error');
        if (error) error.textContent = message;
    }

    // Real-time validation feedback
    form.querySelectorAll('input, textarea').forEach(field => {
        field.addEventListener('blur', () => {
            const group = field.closest('.form-group');
            if (field.value.trim()) {
                group.classList.remove('error');
            }
        });
    });
}

/* ============================================
   SCROLL REVEAL ANIMATIONS
   ============================================ */

function initScrollReveal() {
    // Add reveal class to elements
    const revealElements = document.querySelectorAll(
        '.section-header, .about-text, .stat-card, .portfolio-item, ' +
        '.testimonial-content, .contact-info, .contact-form'
    );

    revealElements.forEach(el => {
        el.classList.add('reveal');
    });

    // Intersection Observer for reveal animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
}

/* ============================================
   UTILITY: Debounce function
   ============================================ */

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/* ============================================
   CURSOR EFFECTS (Optional - for desktop)
   ============================================ */

// Uncomment below for custom cursor effect on desktop
/*
function initCustomCursor() {
    if ('ontouchstart' in window) return; // Skip on touch devices
    
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
    
    const cursorDot = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    document.body.appendChild(cursorDot);
    
    let cursorX = 0;
    let cursorY = 0;
    let dotX = 0;
    let dotY = 0;
    
    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        
        cursorDot.style.left = cursorX + 'px';
        cursorDot.style.top = cursorY + 'px';
    });
    
    function animateCursor() {
        dotX += (cursorX - dotX) * 0.1;
        dotY += (cursorY - dotY) * 0.1;
        
        cursor.style.left = dotX + 'px';
        cursor.style.top = dotY + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    
    animateCursor();
    
    // Hover effects
    const hoverElements = document.querySelectorAll('a, button, .portfolio-item');
    
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}
*/

/* ============================================
   PARALLAX EFFECTS (Optional)
   ============================================ */

// Subtle parallax on hero shapes
window.addEventListener('scroll', debounce(() => {
    const scrolled = window.pageYOffset;
    const shapes = document.querySelectorAll('.floating-shapes .shape');

    shapes.forEach((shape, index) => {
        const speed = 0.1 * (index + 1);
        const yPos = scrolled * speed;
        shape.style.transform = `translateY(${yPos}px)`;
    });
}, 10));
