window.CalendarStorage = {
    STORAGE_KEY: 'calendar_events_v2', // Changed key to avoid conflict with old data

    getStoredEvents: function() {
        const events = localStorage.getItem(this.STORAGE_KEY);
        return events ? JSON.parse(events) : [];
    },

    getEvents: function() {
        let events = this.getStoredEvents();
        
        // Mock Shared Events (if enabled)
        if (window.CalendarApp && window.CalendarApp.showSharedCalendars) {
            events = events.concat(this.getMockSharedEvents());
        }
        
        return events;
    },

    getMockSharedEvents: function() {
        // Generate some consistent mock events
        return [
            {
                id: 'shared_1',
                title: 'Team Standup',
                description: 'Daily sync with the team',
                date: new Date().toISOString().split('T')[0], // Today
                startTime: '10:00',
                endTime: '10:30',
                category: 'work',
                color: '#8B5CF6', // Purple
                isShared: true,
                calendarName: 'Team Calendar'
            },
            {
                id: 'shared_2',
                title: 'Project Review',
                description: 'Review Q1 goals',
                date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0], // Tomorrow
                startTime: '14:00',
                endTime: '15:30',
                category: 'work',
                color: '#8B5CF6',
                isShared: true,
                calendarName: 'Team Calendar'
            }
        ];
    },

    saveEvent: function(event) {
        let events = this.getStoredEvents();
        const index = events.findIndex(e => e.id === event.id);
        
        if (index >= 0) {
            // Update existing
            events[index] = event;
        } else {
            // Add new
            events.push(event);
        }
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(events));
    },

    deleteEvent: function(id) {
        let events = this.getStoredEvents();
        events = events.filter(e => e.id !== id);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(events));
    },

    getEventsForDate: function(dateStr) {
        const events = this.getEvents();
        return events.filter(e => e.date === dateStr);
    }
};
