window.MiniCalendar = {
    render: function(parentDate) {
        // parentDate usually comes from CalendarApp.currentDate
        // If not provided, use local state or today
        
        // We maintain our own browsing state distinct from main calendar?
        // Usually mini calendar tracks main calendar unless navigated separately.
        // For simplicity, let's sync them for now.
        
        const date = parentDate || new Date();
        const year = date.getFullYear();
        const month = date.getMonth();

        const header = document.getElementById('miniCalendarMonth');
        const grid = document.getElementById('miniCalendarGrid');
        const prevBtn = document.getElementById('miniPrev');
        const nextBtn = document.getElementById('miniNext');
        
        if (!header || !grid) return;

        header.innerText = date.toLocaleString('default', { month: 'long', year: 'numeric' });

        // Bind Events (Once)
        if (!this.eventsBound) {
            if (prevBtn) prevBtn.addEventListener('click', () => window.CalendarApp.changeDate(-1));
            if (nextBtn) nextBtn.addEventListener('click', () => window.CalendarApp.changeDate(1));
            this.eventsBound = true;
        }

        grid.innerHTML = '';
        
        // Headers (S M T W T F S)
        const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        days.forEach(d => {
            const el = document.createElement('div');
            el.innerText = d;
            el.style.fontWeight = 'bold';
            el.style.textAlign = 'center';
            el.style.fontSize = '0.7rem';
            el.style.color = 'var(--text-secondary)';
            grid.appendChild(el);
        });

        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        
        // Empty slots
        for (let i = 0; i < firstDay; i++) {
            grid.appendChild(document.createElement('div'));
        }

        // Dates
        for (let d = 1; d <= lastDate; d++) {
            const el = document.createElement('div');
            el.innerText = d;
            el.style.textAlign = 'center';
            el.style.fontSize = '0.75rem';
            el.style.padding = '4px';
            el.style.cursor = 'pointer';
            el.style.borderRadius = '50%';
            
            const currentLoopDate = new Date(year, month, d);
            
            // Today
            if (window.CalendarApp.isSameDate(currentLoopDate, window.CalendarApp.today)) {
                el.style.backgroundColor = 'var(--primary-color)';
                el.style.color = 'white';
            }
            
            // Selected
            if (window.CalendarApp.selectedDate && 
                window.CalendarApp.isSameDate(currentLoopDate, window.CalendarApp.selectedDate)) {
                el.style.boxShadow = '0 0 0 2px var(--primary-color)';
                if (!window.CalendarApp.isSameDate(currentLoopDate, window.CalendarApp.today)) {
                    el.style.color = 'var(--primary-color)';
                    el.style.fontWeight = 'bold';
                }
            }

            // Has Events?
            const dateStr = window.CalendarApp.formatDate(currentLoopDate);
            const events = window.CalendarStorage.getEventsForDate(dateStr);
            if (events.length > 0) {
                // Dot indicator
                const dot = document.createElement('div');
                dot.style.width = '4px';
                dot.style.height = '4px';
                dot.style.backgroundColor = events[0].color || 'var(--primary-color)';
                dot.style.borderRadius = '50%';
                dot.style.margin = '2px auto 0';
                el.appendChild(dot);
            }

            el.addEventListener('click', () => {
                window.CalendarApp.selectDate(currentLoopDate);
            });
            
            grid.appendChild(el);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Initialized by CalendarApp
});
