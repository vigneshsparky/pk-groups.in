// Canvas Background Animation
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('backgroundCanvas');
    if(!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    // Particle system
    const particles = [];
    const particleCount = Math.min(80, Math.floor(width / 15));
    
    // Logo colors for particles
    const colors = [
        'rgba(0, 102, 204, 0.3)',    // Primary blue
        'rgba(0, 76, 153, 0.3)',     // Secondary blue
        'rgba(0, 204, 102, 0.2)',    // Accent green
        'rgba(230, 242, 255, 0.2)'   // Light blue
    ];
    
    // Create particles
    function createParticles() {
        particles.length = 0;
        
        for(let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
    }
    
    // Draw particles
    function drawParticles() {
        particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.fill();
        });
    }
    
    // Update particles
    function updateParticles() {
        particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Bounce off edges
            if(particle.x < 0 || particle.x > width) particle.speedX *= -1;
            if(particle.y < 0 || particle.y > height) particle.speedY *= -1;
        });
    }
    
    // Draw connections between particles
    function drawConnections() {
        for(let i = 0; i < particles.length; i++) {
            for(let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if(distance < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 102, 204, ${0.2 * (1 - distance/100)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    // Animation loop
    let animationId;
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        drawParticles();
        drawConnections();
        updateParticles();
        
        animationId = requestAnimationFrame(animate);
    }
    
    // Handle window resize
    function handleResize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        createParticles();
    }
    
    // Initialize
    createParticles();
    animate();
    
    // Event listeners
    window.addEventListener('resize', handleResize);
    
    // Optimize for mobile
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            handleResize();
        }, 250);
    });
    
    // Pause animation when page is not visible
    document.addEventListener('visibilitychange', function() {
        if(document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animate();
        }
    });
});