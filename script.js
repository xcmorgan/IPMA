// ============================================
// PROJECT MANAGEMENT MASTERY - SCRIPTS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Highlight active section in TOC
    const sections = document.querySelectorAll('.content-section[id]');
    const tocLinks = document.querySelectorAll('.toc a');
    
    function highlightTOC() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        tocLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', highlightTOC);
    
    // Animate progress bars on load
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => {
            bar.style.width = width;
        }, 500);
    });
    
    // Add copy functionality to code blocks
    document.querySelectorAll('.code-block').forEach(block => {
        const button = document.createElement('button');
        button.className = 'copy-btn';
        button.textContent = 'Copy';
        button.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            padding: 4px 12px;
            background: var(--gray-700);
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s;
        `;
        
        block.style.position = 'relative';
        block.appendChild(button);
        
        block.addEventListener('mouseenter', () => button.style.opacity = '1');
        block.addEventListener('mouseleave', () => button.style.opacity = '0');
        
        button.addEventListener('click', () => {
            const code = block.querySelector('pre').textContent;
            navigator.clipboard.writeText(code).then(() => {
                button.textContent = 'Copied!';
                setTimeout(() => button.textContent = 'Copy', 2000);
            });
        });
    });
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.topic-card, .feature, .path-item').forEach(el => {
        el.classList.add('animate-ready');
        observer.observe(el);
    });
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Format currency
function formatCurrency(amount) {
    return '$' + amount.toLocaleString();
}

// Calculate project metrics
function calculateMetrics(planned, actual) {
    const variance = actual - planned;
    const percentVariance = (variance / planned) * 100;
    return {
        variance,
        percentVariance,
        status: percentVariance > 10 ? 'critical' : percentVariance > 0 ? 'warning' : 'good'
    };
}

// Critical path calculator
function calculateCriticalPath(activities) {
    // Forward pass
    activities.forEach((activity, index) => {
        if (activity.predecessors.length === 0) {
            activity.es = 0;
            activity.ef = activity.duration;
        } else {
            const maxEF = activity.predecessors.reduce((max, predIndex) => {
                return Math.max(max, activities[predIndex].ef);
            }, 0);
            activity.es = maxEF;
            activity.ef = maxEF + activity.duration;
        }
    });
    
    // Backward pass and float calculation
    const projectDuration = Math.max(...activities.map(a => a.ef));
    
    for (let i = activities.length - 1; i >= 0; i--) {
        const activity = activities[i];
        const successors = activities.filter((a, idx) => 
            a.predecessors.includes(i)
        );
        
        if (successors.length === 0) {
            activity.lf = projectDuration;
        } else {
            activity.lf = Math.min(...successors.map(s => s.ls));
        }
        
        activity.ls = activity.lf - activity.duration;
        activity.totalFloat = activity.ls - activity.es;
        activity.isCritical = activity.totalFloat === 0;
    }
    
    return {
        activities,
        projectDuration,
        criticalPath: activities.filter(a => a.isCritical)
    };
}

// Export for use in other scripts
window.PMUtils = {
    formatCurrency,
    calculateMetrics,
    calculateCriticalPath
};