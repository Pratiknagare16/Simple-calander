document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const sidebarLeft = document.getElementById('sidebarLeft');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const closePanelBtn = document.getElementById('closePanelBtn');
    const eventDetailsPanel = document.getElementById('eventDetailsPanel');

    // Sidebar Toggle (Mobile/Desktop)
    function toggleSidebar() {
        sidebarLeft.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            sidebarLeft.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            
            // Also close right panel on mobile if overlay clicked?
            // Usually overlay is for left sidebar.
        });
    }

    // Right Panel Close
    if (closePanelBtn) {
        closePanelBtn.addEventListener('click', () => {
            eventDetailsPanel.classList.add('hidden-panel');
            eventDetailsPanel.classList.remove('mobile-visible');
        });
    }

    // ESC to close panel
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (eventDetailsPanel && !eventDetailsPanel.classList.contains('hidden-panel')) {
                eventDetailsPanel.classList.add('hidden-panel');
                eventDetailsPanel.classList.remove('mobile-visible');
            }
        }
    });

    // Swipe Support (Basic)
    let touchStartX = 0;
    let touchEndX = 0;
    const calendarMain = document.querySelector('.calendar-main');

    if (calendarMain) {
        calendarMain.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, {passive: true});

        calendarMain.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, {passive: true});
    }

    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            // Swipe Left -> Next Month
            window.CalendarApp.changeDate(1);
        }
        if (touchEndX > touchStartX + 50) {
            // Swipe Right -> Prev Month
            window.CalendarApp.changeDate(-1);
        }
    }
});
