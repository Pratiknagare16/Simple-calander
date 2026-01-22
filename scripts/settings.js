window.CalendarSettings = {
    settings: {
        startWeek: 'sunday',
        timeFormat: '12h',
        defaultView: 'month',
        theme: 'light'
    },

    init: function() {
        this.loadSettings();
        this.bindEvents();
        this.applySettings();
    },

    loadSettings: function() {
        const stored = localStorage.getItem('calendar_settings');
        if (stored) {
            this.settings = { ...this.settings, ...JSON.parse(stored) };
        }
    },

    saveSettings: function() {
        localStorage.setItem('calendar_settings', JSON.stringify(this.settings));
        this.applySettings();
        
        // Reload Calendar if needed
        if (window.CalendarApp) {
            window.CalendarApp.currentView = this.settings.defaultView;
            window.CalendarApp.render();
        }
    },

    bindEvents: function() {
        const modal = document.getElementById('settingsModal');
        const openBtn = document.getElementById('settingsBtn');
        const closeBtn = document.getElementById('closeSettingsBtn');
        const saveBtn = document.getElementById('saveSettingsBtn');
        
        // Inputs
        const startWeekInput = document.getElementById('settingStartWeek');
        const timeFormatInput = document.getElementById('settingTimeFormat');
        const defaultViewInput = document.getElementById('settingDefaultView');
        const themeInput = document.getElementById('settingTheme');
        const notifBtn = document.getElementById('enableNotificationsBtn');

        if (openBtn) {
            openBtn.addEventListener('click', () => {
                // Populate inputs
                startWeekInput.value = this.settings.startWeek;
                timeFormatInput.value = this.settings.timeFormat;
                defaultViewInput.value = this.settings.defaultView;
                themeInput.value = this.settings.theme;
                
                // Update Notif Button Text
                if (notifBtn) {
                    if (Notification.permission === 'granted') {
                        notifBtn.innerText = 'Notifications Enabled ✅';
                        notifBtn.disabled = true;
                    } else if (Notification.permission === 'denied') {
                        notifBtn.innerText = 'Notifications Denied ❌';
                        notifBtn.disabled = true;
                    } else {
                        notifBtn.innerText = 'Enable Desktop Notifications';
                        notifBtn.disabled = false;
                    }
                }
                
                modal.classList.remove('hidden');
            });
        }
        
        if (notifBtn) {
            notifBtn.addEventListener('click', () => {
                if (window.requestNotificationPermission) {
                    window.requestNotificationPermission();
                    modal.classList.add('hidden'); // Close to avoid confusion or wait for promise
                }
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.settings.startWeek = startWeekInput.value;
                this.settings.timeFormat = timeFormatInput.value;
                this.settings.defaultView = defaultViewInput.value;
                this.settings.theme = themeInput.value;
                
                this.saveSettings();
                modal.classList.add('hidden');
            });
        }
        
        // Close on backdrop
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    },

    applySettings: function() {
        // Apply Theme
        document.body.classList.remove('dark-theme', 'high-contrast');
        
        if (this.settings.theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else if (this.settings.theme === 'high-contrast') {
            document.body.classList.add('high-contrast');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.CalendarSettings.init();
});
