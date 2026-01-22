window.EventList = {
    render: function(dateStr) {
        const listContainer = document.getElementById('eventList');
        const heading = document.querySelector('.panel-header h3');
        
        listContainer.innerHTML = '';
        
        let events = [];
        let title = 'Events';

        if (dateStr) {
            events = window.CalendarStorage.getEventsForDate(dateStr);
            const dateObj = new Date(dateStr + 'T00:00:00');
            title = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        } else {
            const currentDate = window.CalendarApp ? window.CalendarApp.currentDate : new Date();
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();
            
            const allEvents = window.CalendarStorage.getEvents();
            events = allEvents.filter(e => {
                const eDate = new Date(e.date + 'T00:00:00');
                return eDate.getMonth() === currentMonth && eDate.getFullYear() === currentYear;
            });
            
            events.sort((a, b) => new Date(a.date) - new Date(b.date));
            title = 'Events this Month';
        }

        // Apply Active Filters
        if (window.CalendarApp && window.CalendarApp.activeFilters) {
            events = events.filter(event => {
                const category = event.category || 'personal';
                return window.CalendarApp.activeFilters.includes(category);
            });
        }

        heading.innerText = title;

        if (events.length === 0) {
            listContainer.innerHTML = '<p class="no-events" style="color:var(--text-secondary); text-align:center; margin-top:20px;">No events found.</p>';
            return;
        }

        events.forEach(event => {
            const item = document.createElement('div');
            item.classList.add('event-item');
            
            // Item Styles (inline for now, or move to css)
            item.style.padding = '12px';
            item.style.marginBottom = '12px';
            item.style.backgroundColor = 'var(--surface-color)';
            item.style.borderRadius = '8px';
            item.style.borderLeft = `4px solid ${event.color || 'var(--primary-color)'}`;
            item.style.cursor = 'pointer';
            item.style.transition = 'transform 0.2s';
            
            item.onmouseover = () => item.style.transform = 'translateY(-2px)';
            item.onmouseout = () => item.style.transform = 'translateY(0)';

            const dateLabel = dateStr ? '' : `<small style="color:var(--text-secondary); display:block; margin-bottom:4px;">${event.date}</small>`;
            const timeLabel = (event.startTime && !event.isAllDay) ? 
                `<span style="font-size:0.8rem; color:var(--text-secondary); margin-right:8px;">${event.startTime} - ${event.endTime}</span>` : 
                (event.isAllDay ? `<span style="font-size:0.8rem; color:var(--text-secondary); margin-right:8px;">All Day</span>` : '');

            item.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <h4 style="margin:0; font-size:0.95rem; flex:1; color:var(--text-primary);">${event.title}</h4>
                    <div class="item-actions" style="display:flex; gap:8px;">
                        <button class="btn-icon edit" title="Edit" style="font-size:0.9rem; padding:2px;">✎</button>
                        <button class="btn-icon delete" title="Delete" style="font-size:0.9rem; padding:2px;">🗑️</button>
                    </div>
                </div>
                ${dateLabel}
                <div style="margin-top:4px;">
                    ${timeLabel}
                </div>
                <p style="margin:4px 0; color:var(--text-secondary); font-size:0.85rem;">${event.description || ''}</p>
            `;
            
            // Handle Actions
            const editBtn = item.querySelector('.edit');
            const deleteBtn = item.querySelector('.delete');
            
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.openEditModal(event);
            });
            
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if(confirm('Delete this event?')) {
                    window.CalendarStorage.deleteEvent(event.id);
                    window.CalendarApp.render();
                }
            });

            item.addEventListener('click', () => {
                window.openEditModal(event);
            });
            
            listContainer.appendChild(item);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.EventList.render();
});
