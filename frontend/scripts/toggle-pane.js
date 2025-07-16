// Panel toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggle-panel');
    const panel = document.getElementById('control-panel');

    toggleButton.addEventListener('click', () => {
        panel.classList.toggle('active');
        toggleButton.textContent = panel.classList.contains('active') 
            ? 'Hide Panel' 
            : 'Show Panel';
    });
});
