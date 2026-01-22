window.Sidebar = {
    init: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        // 1. Category Filters
        const filters = document.querySelectorAll('.category-filter input');
        filters.forEach(cb => {
            cb.addEventListener('change', () => {
                if (window.CalendarApp) {
                    const activeFilters = Array.from(filters)
                        .filter(i => i.checked)
                        .map(i => i.value);
                    window.CalendarApp.updateFilters(activeFilters);
                }
            });
        });

        // 2. Shared Calendars Toggle
        const sharedToggle = document.getElementById('sharedCalendarsToggle');
        if (sharedToggle) {
            sharedToggle.addEventListener('change', (e) => {
                if (window.CalendarApp) {
                    window.CalendarApp.toggleSharedCalendars(e.target.checked);
                }
            });
        }

        // 3. Date Range Filter (if added to DOM)
        const rangeStart = document.getElementById('filterStartDate');
        const rangeEnd = document.getElementById('filterEndDate');
        
        const handleRangeChange = () => {
            if (window.CalendarApp && rangeStart && rangeEnd) {
                window.CalendarApp.updateDateRange(rangeStart.value, rangeEnd.value);
            }
        };

        if (rangeStart && rangeEnd) {
            rangeStart.addEventListener('change', handleRangeChange);
            rangeEnd.addEventListener('change', handleRangeChange);
        }

        // 4. Create Event Button (Sidebar)
        const createBtn = document.querySelector('.sidebar-left .btn-create-event');
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                if (window.openEditModal) {
                    window.openEditModal(null);
                }
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.Sidebar.init();
});
