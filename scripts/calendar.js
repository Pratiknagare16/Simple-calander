window.CalendarApp = {
    today: new Date(),
    currentDate: new Date(), // Tracks the currently viewed date/month
    selectedDate: null,
    currentView: 'month', // month, week, day, agenda
    activeFilters: ['personal', 'work', 'study', 'travel', 'health'],
    showSharedCalendars: false,
    dateRange: { start: null, end: null },

    init: function() {
        this.cacheDOM();
        this.bindEvents();
        
        // Load last view from localStorage (priority)
        const lastView = localStorage.getItem('calendar_last_view');
        if (lastView) {
            this.currentView = lastView;
        } else if (window.CalendarSettings) {
            // Fallback to default setting
            this.currentView = window.CalendarSettings.settings.defaultView || 'month';
        }

        // Update active button
        const btn = document.querySelector(`.view-btn[data-view="${this.currentView}"]`);
        if (btn) {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }
        
        this.render();
    },

    cacheDOM: function() {
        this.monthYear = document.getElementById("monthYear");
        this.dates = document.getElementById("dates");
        this.gridHeader = document.getElementById("calendarGridHeader");
        this.viewContainer = document.getElementById("calendarViewContainer");
        this.miniMonth = document.getElementById("miniCalendarMonth");
        this.miniGrid = document.getElementById("miniCalendarGrid");
    },

    bindEvents: function() {
        // Navigation
        document.getElementById('prevBtn').addEventListener('click', () => this.changeDate(-1));
        document.getElementById('nextBtn').addEventListener('click', () => this.changeDate(1));
        document.getElementById('todayBtn').addEventListener('click', () => {
            this.currentDate = new Date();
            this.render();
        });
        
        // View Switcher
        const viewBtns = document.querySelectorAll('.view-btn');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                viewBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentView = e.target.dataset.view;
                localStorage.setItem('calendar_last_view', this.currentView);
                this.render();
            });
        });

        // Expose openModal to global scope for event clicks
        window.openEditModal = (event) => {
            const openEvent = new CustomEvent('open-event-modal', { detail: event });
            document.dispatchEvent(openEvent);
        };
    },

    // Public Methods for Sidebar/External Control
    updateFilters: function(filters) {
        this.activeFilters = filters;
        this.render();
    },

    toggleSharedCalendars: function(show) {
        this.showSharedCalendars = show;
        this.render();
    },

    updateDateRange: function(start, end) {
        this.dateRange = { start, end };
        if (start) {
            this.currentDate = new Date(start);
            // If in week/day view, ensure we start on the right day/week
            // But render() handles the view logic based on currentDate
        }
        this.render();
    },

    shouldShowEvent: function(event) {
        // Category Filter
        if (!this.activeFilters.includes(event.category)) return false;
        
        // Date Range Filter
        if (this.dateRange.start && this.dateRange.end) {
            if (event.date < this.dateRange.start || event.date > this.dateRange.end) return false;
        }
        
        return true;
    },

    changeDate: function(offset) {
        if (this.currentView === 'month') {
            this.currentDate.setMonth(this.currentDate.getMonth() + offset);
        } else if (this.currentView === 'week') {
            this.currentDate.setDate(this.currentDate.getDate() + (offset * 7));
        } else {
            this.currentDate.setDate(this.currentDate.getDate() + offset);
        }
        this.render();
    },

    getStartWeekDay: function() {
        return (window.CalendarSettings && window.CalendarSettings.settings.startWeek === 'monday') ? 1 : 0;
    },

    moveEventToDate: function(eventId, newDate) {
        const events = window.CalendarStorage.getStoredEvents();
        const eventIndex = events.findIndex(e => e.id === eventId);
        
        if (eventIndex >= 0) {
            const event = events[eventIndex];
            // Update date
            event.date = this.formatDate(newDate);
            // Save
            window.CalendarStorage.saveEvent(event);
            // Re-render
            this.render();
            
            // Show toast
            const toast = document.getElementById('toast');
            if (toast) {
                toast.innerText = "Event Moved";
                toast.classList.add('visible');
                setTimeout(() => toast.classList.remove('visible'), 3000);
            }
        }
    },

    render: function() {
        // Update Header
        const options = { month: 'long', year: 'numeric' };
        if (this.currentView === 'day') options.day = 'numeric';
        this.monthYear.innerText = this.currentDate.toLocaleString("default", options);

        // Reset Containers
        this.dates.classList.add('hidden');
        this.viewContainer.classList.add('hidden');
        this.gridHeader.classList.add('hidden');
        this.viewContainer.innerHTML = '';

        if (this.currentView === 'month') {
            this.dates.classList.remove('hidden');
            this.gridHeader.classList.remove('hidden');
            this.renderGridHeader();
            this.renderMonthView();
        } else if (this.currentView === 'week') {
            this.viewContainer.classList.remove('hidden');
            this.renderWeekView();
        } else if (this.currentView === 'day') {
            this.viewContainer.classList.remove('hidden');
            this.renderDayView();
        } else if (this.currentView === 'agenda') {
            this.viewContainer.classList.remove('hidden');
            this.renderAgendaView();
        }
        
        // Render Mini Calendar (always month)
        if (window.MiniCalendar) window.MiniCalendar.render(this.currentDate);
    },

    renderGridHeader: function() {
        const startDay = this.getStartWeekDay();
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        this.gridHeader.innerHTML = '';
        for (let i = 0; i < 7; i++) {
            const dayIndex = (startDay + i) % 7;
            const div = document.createElement('div');
            div.innerText = days[dayIndex];
            this.gridHeader.appendChild(div);
        }
    },

    renderMonthView: function() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        let firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();

        // Adjust for start week
        const startDay = this.getStartWeekDay();
        const emptySlots = (firstDay - startDay + 7) % 7;

        this.dates.innerHTML = '';

        // Empty slots
        for (let i = 0; i < emptySlots; i++) {
            this.dates.appendChild(document.createElement('div'));
        }

        // Days
        for (let d = 1; d <= lastDate; d++) {
            const dateDiv = document.createElement('div');
            dateDiv.classList.add('date');
            
            const currentLoopDate = new Date(year, month, d);
            
            // Highlight Today
            if (this.isSameDate(currentLoopDate, this.today)) {
                dateDiv.classList.add('today');
            }
            
            // Highlight Selected
            if (this.selectedDate && this.isSameDate(currentLoopDate, this.selectedDate)) {
                dateDiv.classList.add('selected');
            }

            // Date Number
            const numberSpan = document.createElement('span');
            numberSpan.classList.add('date-number');
            numberSpan.innerText = d;
            dateDiv.appendChild(numberSpan);

            // Events
            const dateStr = this.formatDate(currentLoopDate);
            const events = window.CalendarStorage.getEventsForDate(dateStr)
                .filter(e => this.shouldShowEvent(e));

            events.slice(0, 2).forEach(event => {
                const preview = document.createElement('div');
                preview.classList.add('event-preview');
                
                // Draggable
                preview.setAttribute('draggable', true);
                preview.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData("text/plain", event.id);
                    e.dataTransfer.effectAllowed = "move";
                    preview.style.opacity = '0.5';
                });
                preview.addEventListener('dragend', () => {
                    preview.style.opacity = '1';
                });

                preview.style.borderLeftColor = event.color || 'var(--primary-color)';
                preview.style.backgroundColor = this.hexToRgba(event.color || '#3B82F6', 0.1);
                preview.innerText = event.title;
                preview.title = event.title;
                
                preview.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.openEditModal(event);
                });
                
                dateDiv.appendChild(preview);
            });

            if (events.length > 2) {
                const more = document.createElement('div');
                more.style.fontSize = '0.75rem';
                more.style.color = 'var(--text-secondary)';
                more.innerText = `+${events.length - 2} more`;
                dateDiv.appendChild(more);
            }

            // Click Handler
            dateDiv.addEventListener('click', () => {
                this.selectDate(currentLoopDate);
            });

            // Drag & Drop Handlers (Drop Target)
            dateDiv.addEventListener('dragover', (e) => {
                e.preventDefault(); // Allow dropping
                e.dataTransfer.dropEffect = "move";
                dateDiv.style.backgroundColor = 'var(--surface-color)';
            });

            dateDiv.addEventListener('dragleave', () => {
                dateDiv.style.backgroundColor = '';
            });

            dateDiv.addEventListener('drop', (e) => {
                e.preventDefault();
                dateDiv.style.backgroundColor = '';
                const eventId = e.dataTransfer.getData("text/plain");
                if (eventId) {
                    this.moveEventToDate(eventId, currentLoopDate);
                }
            });

            this.dates.appendChild(dateDiv);
        }
    },

    renderWeekView: function() {
        const startOfWeek = new Date(this.currentDate);
        const currentDay = this.currentDate.getDay();
        const startDay = this.getStartWeekDay();
        const distance = (currentDay - startDay + 7) % 7;
        
        startOfWeek.setDate(this.currentDate.getDate() - distance);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        // Update Header Title to show range
        this.monthYear.innerText = `${startOfWeek.toLocaleDateString('default', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}`;

        this.renderTimeGrid(7, startOfWeek);
    },

    renderDayView: function() {
        this.renderTimeGrid(1, this.currentDate);
    },

    renderTimeGrid: function(daysToShow, startDate) {
        const container = document.createElement('div');
        container.classList.add('time-grid-container');

        // 1. Header
        const header = document.createElement('div');
        header.classList.add('time-grid-header');
        
        // Header Days
        for (let i = 0; i < daysToShow; i++) {
            const dayDate = new Date(startDate);
            dayDate.setDate(startDate.getDate() + i);
            
            const cell = document.createElement('div');
            cell.classList.add('header-cell');
            if (this.isSameDate(dayDate, this.today)) cell.classList.add('today');
            
            cell.innerHTML = `
                <div style="font-size:0.75rem; text-transform:uppercase;">${dayDate.toLocaleDateString('default', { weekday: 'short' })}</div>
                <div style="font-size:1.1rem;">${dayDate.getDate()}</div>
            `;
            header.appendChild(cell);
        }
        container.appendChild(header);

        // 2. Body
        const body = document.createElement('div');
        body.classList.add('time-grid-body');

        // Time Labels
        const timeLabels = document.createElement('div');
        timeLabels.classList.add('time-labels');
        for (let h = 0; h < 24; h++) {
            const label = document.createElement('div');
            label.classList.add('time-label');
            label.style.top = `${h * 60}px`;
            
            const displayTime = this.formatTimeLabel(h);
            label.innerText = displayTime;
            if (h === 0) label.innerText = ''; 
            
            timeLabels.appendChild(label);
        }
        body.appendChild(timeLabels);

        // Day Columns
        const dayColumns = document.createElement('div');
        dayColumns.classList.add('day-columns');

        for (let i = 0; i < daysToShow; i++) {
            const dayDate = new Date(startDate);
            dayDate.setDate(startDate.getDate() + i);
            
            const col = document.createElement('div');
            col.classList.add('day-column');

            // Grid Lines
            for (let h = 0; h < 24; h++) {
                const line = document.createElement('div');
                line.classList.add('grid-line');
                line.style.top = `${h * 60}px`;
                col.appendChild(line);
            }

            // Current Time Indicator (if today)
            if (this.isSameDate(dayDate, new Date())) {
                const now = new Date();
                const minutes = (now.getHours() * 60) + now.getMinutes();
                const line = document.createElement('div');
                line.classList.add('current-time-line');
                line.style.top = `${minutes}px`;
                col.appendChild(line);
            }

            // Events
            const dateStr = this.formatDate(dayDate);
            const events = window.CalendarStorage.getEventsForDate(dateStr)
                .filter(e => this.shouldShowEvent(e));

            events.forEach(event => {
                if (event.isAllDay) return; 

                const startMin = this.timeToMinutes(event.startTime);
                const endMin = this.timeToMinutes(event.endTime);
                const duration = endMin - startMin;

                const eventBlock = document.createElement('div');
                eventBlock.classList.add('event-block');
                eventBlock.style.top = `${startMin}px`;
                eventBlock.style.height = `${duration}px`;
                eventBlock.style.backgroundColor = this.hexToRgba(event.color || '#3B82F6', 0.1);
                eventBlock.style.borderLeftColor = event.color || 'var(--primary-color)';
                
                const timeStr = this.formatTimeRange(event.startTime, event.endTime);
                
                eventBlock.innerHTML = `
                    <span class="event-time">${timeStr}</span>
                    <span class="event-title">${event.title}</span>
                `;

                eventBlock.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.openEditModal(event);
                });

                col.appendChild(eventBlock);
            });
            
            // Click to create
            col.addEventListener('click', (e) => {
                if (e.target === col || e.target.classList.contains('grid-line')) {
                    this.selectDate(dayDate);
                    window.openEditModal(null); 
                }
            });

            dayColumns.appendChild(col);
        }
        body.appendChild(dayColumns);
        container.appendChild(body);
        this.viewContainer.appendChild(container);

        // Scroll to 8 AM
        setTimeout(() => {
            container.scrollTop = 480; 
        }, 0);
    },

    renderAgendaView: function() {
        const container = document.createElement('div');
        container.classList.add('agenda-view');

        const startDate = new Date(this.currentDate);
        
        // Show next 14 days
        for (let i = 0; i < 14; i++) {
            const dayDate = new Date(startDate);
            dayDate.setDate(startDate.getDate() + i);
            const dateStr = this.formatDate(dayDate);
            
            const events = window.CalendarStorage.getEventsForDate(dateStr)
                .filter(e => this.shouldShowEvent(e));
            
            if (events.length > 0) {
                const group = document.createElement('div');
                group.classList.add('agenda-day-group');

                const header = document.createElement('div');
                header.classList.add('agenda-date-header');
                if (this.isSameDate(dayDate, this.today)) header.classList.add('today');
                
                header.innerText = dayDate.toLocaleDateString('default', { weekday: 'short', month: 'long', day: 'numeric' });
                group.appendChild(header);

                events.sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));

                events.forEach(event => {
                    const item = document.createElement('div');
                    item.classList.add('agenda-event');
                    item.style.borderLeftColor = event.color || 'var(--primary-color)';

                    const timeStr = event.isAllDay ? 'All Day' : this.formatTimeRange(event.startTime, event.endTime);
                    
                    item.innerHTML = `
                        <div class="agenda-time">${timeStr}</div>
                        <div class="agenda-details">
                            <h4>${event.title}</h4>
                            <p>${event.description || 'No description'}</p>
                        </div>
                    `;
                    
                    item.addEventListener('click', (e) => {
                        window.openEditModal(event);
                    });

                    group.appendChild(item);
                });

                container.appendChild(group);
            }
        }
        
        if (container.children.length === 0) {
             container.innerHTML = '<p style="text-align:center; color:var(--text-secondary); margin-top:40px;">No upcoming events found.</p>';
        }

        this.viewContainer.appendChild(container);
    },

    selectDate: function(date) {
        this.selectedDate = date;
        
        // Visual update
        const allDates = document.querySelectorAll('.date');
        allDates.forEach(d => d.classList.remove('selected'));
        if (this.currentView === 'month') {
             this.render();
        }

        // Update Side Panel
        if (window.EventList) {
            window.EventList.render(this.formatDate(date));
        }

        // Open Side Panel (Desktop & Mobile)
        const detailsPanel = document.getElementById('eventDetailsPanel');
        if (detailsPanel) {
            detailsPanel.classList.remove('hidden-panel');
            if (window.innerWidth <= 768) {
                detailsPanel.classList.add('mobile-visible');
            }
        }
    },

    isSameDate: function(d1, d2) {
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    },

    formatDate: function(date) {
        const offset = date.getTimezoneOffset();
        const local = new Date(date.getTime() - (offset*60*1000));
        return local.toISOString().split('T')[0];
    },

    timeToMinutes: function(timeStr) {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':').map(Number);
        return (h * 60) + m;
    },

    formatTimeLabel: function(hour) {
        const is24h = window.CalendarSettings && window.CalendarSettings.settings.timeFormat === '24h';
        if (is24h) {
            return `${hour.toString().padStart(2, '0')}:00`;
        }
        return `${hour === 0 ? '12' : (hour > 12 ? hour - 12 : hour)} ${hour < 12 ? 'AM' : 'PM'}`;
    },

    formatTimeRange: function(start, end) {
        const is24h = window.CalendarSettings && window.CalendarSettings.settings.timeFormat === '24h';
        if (is24h) {
            return `${start} - ${end}`;
        }
        
        const to12h = (t) => {
            const [h, m] = t.split(':').map(Number);
            const suffix = h < 12 ? 'AM' : 'PM';
            const h12 = h === 0 ? 12 : (h > 12 ? h - 12 : h);
            return `${h12}:${m.toString().padStart(2, '0')} ${suffix}`;
        };

        return `${to12h(start)} - ${to12h(end)}`;
    },

    hexToRgba: function(hex, alpha) {
        let c;
        if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
            c= hex.substring(1).split('');
            if(c.length== 3){
                c= [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c= '0x'+c.join('');
            return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
        }
        return 'rgba(59, 130, 246, 0.1)';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.CalendarApp.init();
});
