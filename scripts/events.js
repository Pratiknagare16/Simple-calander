document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('eventModal');
    const modalTitle = document.getElementById('modalTitle');
    const cancelBtn = document.getElementById('cancelBtn');
    const deleteBtn = document.getElementById('deleteEventBtn');
    const eventForm = document.getElementById('eventForm');
    
    // Form Inputs
    const eventIdInput = document.getElementById('eventId');
    const eventTitleInput = document.getElementById('eventTitle');
    const startTimeInput = document.getElementById('startTime');
    const endTimeInput = document.getElementById('endTime');
    const isAllDayInput = document.getElementById('isAllDay');
    const eventDescInput = document.getElementById('eventDesc');
    const eventCategorySelect = document.getElementById('eventCategory');
    const eventColorInput = document.getElementById('eventColor');
    const eventReminderSelect = document.getElementById('eventReminder');
    const eventDateDisplay = document.getElementById('eventDateDisplay');
    
    const createEventBtn = document.querySelector('.btn-create-event');
    const mobileFab = document.getElementById('mobileFab');

    // Listen for 'open-event-modal' custom event
    document.addEventListener('open-event-modal', (e) => {
        openModal(e.detail);
    });

    function openModal(eventData = null) {
        modal.classList.remove('hidden');
        
        if (eventData) {
            // Edit Mode
            modalTitle.innerText = 'Edit Event';
            eventIdInput.value = eventData.id;
            eventTitleInput.value = eventData.title;
            startTimeInput.value = eventData.startTime || '';
            endTimeInput.value = eventData.endTime || '';
            isAllDayInput.checked = eventData.isAllDay || false;
            eventDescInput.value = eventData.description || '';
            eventCategorySelect.value = eventData.category || 'personal';
            eventColorInput.value = eventData.color || '#3B82F6';
            eventReminderSelect.value = eventData.reminder || 'none';
            
            deleteBtn.classList.remove('hidden');
            
            const dateObj = new Date(eventData.date);
            eventDateDisplay.innerText = dateObj.toLocaleDateString('en-US', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            });
        } else {
            // Create Mode
            modalTitle.innerText = 'Add Event';
            eventIdInput.value = '';
            eventTitleInput.value = '';
            startTimeInput.value = '09:00';
            endTimeInput.value = '10:00';
            isAllDayInput.checked = false;
            eventDescInput.value = '';
            eventCategorySelect.value = 'personal';
            eventColorInput.value = '#3B82F6';
            eventReminderSelect.value = '15';
            
            deleteBtn.classList.add('hidden');
            
            const app = window.CalendarApp;
            const targetDate = app.selectedDate || app.today; // Fallback to today if null? usually today is default
            // Actually CalendarApp.today is just new Date()
            // If selectedDate is null, we might want to default to today or current view date
            
            const displayDate = targetDate || new Date();

            eventDateDisplay.innerText = displayDate.toLocaleDateString('en-US', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            });
        }
        
        eventTitleInput.focus();
    }

    function closeModal() {
        modal.classList.add('hidden');
    }

    // Button Listeners
    if (createEventBtn) {
        createEventBtn.addEventListener('click', () => openModal(null));
    }
    
    if (mobileFab) {
        mobileFab.addEventListener('click', () => openModal(null));
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Handle Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // Delete Event
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            const id = eventIdInput.value;
            if (id) {
                if(confirm('Delete this event?')) {
                    window.CalendarStorage.deleteEvent(id);
                    window.CalendarApp.render();
                    closeModal();
                }
            }
        });
    }

    // Save Event
    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const app = window.CalendarApp;
        const id = eventIdInput.value;
        
        // Determine Date
        let dateStr;
        if (id) {
            const existing = window.CalendarStorage.getEvents().find(ev => ev.id === id);
            dateStr = existing ? existing.date : new Date().toISOString().split('T')[0];
        } else {
            const targetDate = app.selectedDate || new Date();
            const offset = targetDate.getTimezoneOffset();
            const localDate = new Date(targetDate.getTime() - (offset*60*1000));
            dateStr = localDate.toISOString().split('T')[0];
        }

        const eventData = {
            id: id || crypto.randomUUID(), // Use UUID
            title: eventTitleInput.value,
            description: eventDescInput.value,
            date: dateStr,
            startTime: startTimeInput.value,
            endTime: endTimeInput.value,
            isAllDay: isAllDayInput.checked,
            category: eventCategorySelect.value,
            color: eventColorInput.value,
            reminder: eventReminderSelect.value
        };

        window.CalendarStorage.saveEvent(eventData);
        window.CalendarApp.render();
        
        // Update EventList if open
        if (window.EventList && app.selectedDate) {
             const offset = app.selectedDate.getTimezoneOffset();
             const local = new Date(app.selectedDate.getTime() - (offset*60*1000));
             window.EventList.render(local.toISOString().split('T')[0]);
        }

        closeModal();
        
        // Show Toast
        const toast = document.getElementById('toast');
        if (toast) {
            toast.classList.add('visible');
            setTimeout(() => {
                toast.classList.remove('visible');
            }, 3000);
        }
    });
});
