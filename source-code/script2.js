document.addEventListener('mousemove', function(e) {
    const highlight = document.querySelector('.highlight');
    
    // Calculate the position to center the highlight on the cursor
    const x = e.clientX;
    const y = e.clientY;
    
    // Update the position of the highlight using translate for smoother animations
    highlight.style.left = `${x}px`;
    highlight.style.top = `${y}px`;
});

document.addEventListener('DOMContentLoaded', () => {
    const texts = document.querySelectorAll('.text');

    texts.forEach(text => {
        const color = window.getComputedStyle(text).color;
        
        if (color === 'rgb(0, 0, 0)') { // Black in RGB
            text.classList.add('inverted');
        }
    });
});