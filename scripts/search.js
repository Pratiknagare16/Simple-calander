document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.createElement('div');
    
    // Setup Search Results Dropdown
    searchResults.className = 'search-results-dropdown hidden';
    Object.assign(searchResults.style, {
        position: 'absolute',
        top: '100%',
        left: '0',
        right: '0',
        backgroundColor: 'white',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        maxHeight: '300px',
        overflowY: 'auto',
        zIndex: '1000',
        marginTop: '8px'
    });
    
    document.querySelector('.search-box').appendChild(searchResults);

    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Search Handler
    const handleSearch = debounce((e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length === 0) {
            searchResults.classList.add('hidden');
            searchResults.innerHTML = '';
            return;
        }

        const allEvents = window.CalendarStorage.getEvents();
        const matches = allEvents.filter(event => {
            return (event.title && event.title.toLowerCase().includes(query)) ||
                   (event.description && event.description.toLowerCase().includes(query));
        });

        renderResults(matches);
    }, 300);

    function renderResults(events) {
        searchResults.innerHTML = '';
        searchResults.classList.remove('hidden');

        if (events.length === 0) {
            const noResult = document.createElement('div');
            noResult.style.padding = '12px';
            noResult.style.color = 'var(--text-secondary)';
            noResult.style.fontSize = '0.9rem';
            noResult.innerText = 'No events found.';
            searchResults.appendChild(noResult);
            return;
        }

        events.sort((a, b) => new Date(a.date) - new Date(b.date));

        events.forEach(event => {
            const item = document.createElement('div');
            item.style.padding = '10px 12px';
            item.style.borderBottom = '1px solid var(--surface-color)';
            item.style.cursor = 'pointer';
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.gap = '10px';
            item.style.transition = 'background-color 0.2s';

            item.onmouseover = () => item.style.backgroundColor = 'var(--surface-color)';
            item.onmouseout = () => item.style.backgroundColor = 'white';

            const colorDot = document.createElement('div');
            colorDot.style.width = '10px';
            colorDot.style.height = '10px';
            colorDot.style.borderRadius = '50%';
            colorDot.style.backgroundColor = event.color || 'var(--primary-color)';

            const info = document.createElement('div');
            info.innerHTML = `
                <div style="font-weight:500; font-size:0.9rem; color:var(--text-primary);">${event.title}</div>
                <div style="font-size:0.75rem; color:var(--text-secondary);">${event.date} • ${event.startTime || 'All Day'}</div>
            `;

            item.appendChild(colorDot);
            item.appendChild(info);

            item.addEventListener('click', () => {
                // Navigate to date and open modal
                const date = new Date(event.date + 'T00:00:00');
                if (window.CalendarApp) {
                    window.CalendarApp.currentDate = date;
                    window.CalendarApp.selectDate(date);
                    window.CalendarApp.render();
                }
                window.openEditModal(event);
                searchResults.classList.add('hidden');
                searchInput.value = '';
            });

            searchResults.appendChild(item);
        });
    }

    searchInput.addEventListener('input', handleSearch);

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.add('hidden');
        }
    });
    
    // Focus handler
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim().length > 0) {
            searchResults.classList.remove('hidden');
        }
    });
});
