window.NotificationSystem = {
    init: function() {
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
            return;
        }

        // If already granted, start scheduler
        if (Notification.permission === "granted") {
            this.startScheduler();
        }
        
        // Expose request function
        window.requestNotificationPermission = () => {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    this.startScheduler();
                    new Notification("Notifications Enabled", {
                        body: "You will now receive reminders for your events.",
                        icon: 'assets/icons/calendar-icon.png'
                    });
                }
            });
        };
    },

    startScheduler: function() {
        // Check every minute
        setInterval(() => {
            this.checkReminders();
        }, 60000);
        
        // Initial check
        this.checkReminders();
    },

    checkReminders: function() {
        if (Notification.permission !== "granted") return;

        const events = window.CalendarStorage.getEvents();
        const now = new Date();
        const currentMinutes = Math.floor(now.getTime() / 60000); // Minutes since epoch

        events.forEach(event => {
            if (!event.reminder || event.reminder === 'none') return;
            if (!event.date || !event.startTime) return;

            const reminderMinutes = parseInt(event.reminder);
            if (isNaN(reminderMinutes)) return;

            // Calculate Event Start Time in Minutes
            const eventDate = new Date(`${event.date}T${event.startTime}`);
            const eventTimeMinutes = Math.floor(eventDate.getTime() / 60000);
            
            // Trigger Time
            const triggerTime = eventTimeMinutes - reminderMinutes;

            // Check if we hit the minute (allow 1 min window)
            if (currentMinutes === triggerTime) {
                this.showNotification(event);
            }
        });
    },

    showNotification: function(event) {
        const title = `Reminder: ${event.title}`;
        const options = {
            body: `${event.startTime} - ${event.description || 'No description'}`,
            icon: 'assets/icons/calendar-icon.png', // Placeholder
            badge: 'assets/icons/badge.png' // Placeholder
        };

        const notification = new Notification(title, options);
        
        notification.onclick = function() {
            window.focus();
            notification.close();
            // Open event modal if possible
            if (window.openEditModal) {
                window.openEditModal(event);
            }
        };
        
        // Play sound (optional)
        // const audio = new Audio('assets/sounds/notification.mp3');
        // audio.play().catch(e => console.log('Audio play failed', e));
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.NotificationSystem.init();
});
