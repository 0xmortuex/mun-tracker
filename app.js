// ===========================
// MUN TR Application
// ===========================

// State management
const state = {
    conferences: [],
    filteredConferences: [],
    filters: {
        search: '',
        location: 'all',
        status: 'all',
        daterange: 'all',
        feerange: 'all',
        level: 'all',
        language: 'all',
        beginner: false
    },
    sort: 'status',
    showPast: false
};

// DOM Elements
const searchInput = document.getElementById('searchInput');
const filterToggle = document.getElementById('filterToggle');
const filterBar = document.getElementById('filterBar');
const filterBtns = document.querySelectorAll('.filter-btn');
const checkboxes = document.querySelectorAll('.checkbox-input');
const sortSelect = document.getElementById('sortSelect');
const showPastCheck = document.getElementById('showPastCheck');
const resetBtns = document.querySelectorAll('.reset-btn');
const conferenceGrid = document.getElementById('conferenceGrid');
const emptyState = document.getElementById('emptyState');
const lastUpdated = document.getElementById('lastUpdated');
const footerUpdated = document.getElementById('footerUpdated');
const visibleCount = document.getElementById('visibleCount');
const totalCount = document.getElementById('totalCount');
const pastCount = document.getElementById('pastCount');
const activeFilterCount = document.getElementById('activeFilterCount');

// ===========================
// Initialization
// ===========================
async function init() {
    try {
        // Load conferences data
        const response = await fetch('conferences.json');
        const data = await response.json();
        state.conferences = data.conferences;

        // Update last updated date
        lastUpdated.textContent = data.last_updated;
        footerUpdated.textContent = data.last_updated;
        totalCount.textContent = state.conferences.length;
        pastCount.textContent = state.conferences.filter(c => c.status === 'past').length;

        // Load state from URL hash
        loadStateFromHash();

        // Render initial view
        applyFilters();
        render();

        // Setup event listeners
        setupEventListeners();
    } catch (error) {
        console.error('Error loading conferences:', error);
    }
}

// ===========================
// Event Listeners
// ===========================
function setupEventListeners() {
    // Search
    searchInput.addEventListener('input', (e) => {
        state.filters.search = e.target.value.toLowerCase();
        applyFilters();
        render();
        updateHash();
    });

    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filterType = btn.dataset.filter;
            const filterValue = btn.dataset.value;

            // Remove active class from siblings
            document.querySelectorAll(`[data-filter="${filterType}"]`).forEach(b => {
                b.classList.remove('active');
            });

            // Add active class to clicked button
            btn.classList.add('active');

            // Update state
            state.filters[filterType] = filterValue;

            // Apply filters and render
            applyFilters();
            render();
            updateHash();
            updateActiveFilterCount();
        });
    });

    // Checkboxes
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const filterType = checkbox.dataset.filter;
            state.filters[filterType] = checkbox.checked;
            applyFilters();
            render();
            updateHash();
            updateActiveFilterCount();
        });
    });

    // Sort
    sortSelect.addEventListener('change', (e) => {
        state.sort = e.target.value;
        applySort();
        render();
    });

    // Show past conferences
    showPastCheck.addEventListener('change', (e) => {
        state.showPast = e.target.checked;
        render();
    });

    // Filter toggle (mobile)
    filterToggle.addEventListener('click', () => {
        filterBar.classList.toggle('active');
        filterToggle.classList.toggle('active');
    });

    // Reset buttons
    resetBtns.forEach(btn => {
        btn.addEventListener('click', resetFilters);
    });

    // Close filter bar on mobile when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.filter-container')) {
            filterBar.classList.remove('active');
            filterToggle.classList.remove('active');
        }
    });
}

// ===========================
// Filtering Logic
// ===========================
function applyFilters() {
    state.filteredConferences = state.conferences.filter(conference => {
        // Search filter
        if (state.filters.search) {
            const searchTerm = state.filters.search;
            const matchesSearch = 
                conference.acronym.toLowerCase().includes(searchTerm) ||
                conference.name.toLowerCase().includes(searchTerm);
            if (!matchesSearch) return false;
        }

        // Location filter
        if (state.filters.location !== 'all') {
            if (state.filters.location === 'istanbul') {
                if (conference.city !== 'Istanbul') return false;
            } else if (state.filters.location === 'other') {
                if (conference.city === 'Istanbul') return false;
            }
        }

        // Status filter
        if (state.filters.status !== 'all') {
            if (conference.status !== state.filters.status) return false;
        }

        // Date range filter
        if (state.filters.daterange !== 'all') {
            const confDate = new Date(conference.dates);
            if (isNaN(confDate)) return true; // Include if date is unknown
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const daysInFuture = parseInt(state.filters.daterange);
            const futureDate = new Date(today);
            futureDate.setDate(futureDate.getDate() + daysInFuture);

            if (confDate < today || confDate > futureDate) return false;
        }

        // Fee range filter
        if (state.filters.feerange !== 'all') {
            if (conference.fee_range !== state.filters.feerange) return false;
        }

        // Level filter
        if (state.filters.level !== 'all') {
            if (conference.level !== state.filters.level) return false;
        }

        // Language filter
        if (state.filters.language !== 'all') {
            if (state.filters.language === 'english_only') {
                if (conference.languages.length !== 1 || conference.languages[0] !== 'English') {
                    return false;
                }
            } else if (state.filters.language === 'english_other') {
                if (conference.languages.length === 1 || !conference.languages.includes('English')) {
                    return false;
                }
            }
        }

        // Beginner-friendly filter
        if (state.filters.beginner) {
            if (!conference.beginner_friendly) return false;
        }

        return true;
    });

    applySort();
}

function applySort() {
    const sorted = [...state.filteredConferences];

    switch (state.sort) {
        case 'date':
            sorted.sort((a, b) => {
                const dateA = new Date(a.dates) || new Date(9999, 0, 0);
                const dateB = new Date(b.dates) || new Date(9999, 0, 0);
                return dateA - dateB;
            });
            break;

        case 'fee':
            sorted.sort((a, b) => {
                const feeA = a.fee_try || Infinity;
                const feeB = b.fee_try || Infinity;
                return feeA - feeB;
            });
            break;

        case 'alphabetical':
            sorted.sort((a, b) => a.acronym.localeCompare(b.acronym));
            break;

        case 'status':
        default:
            // Status priority: open > postponed > past > dormant > unknown
            const statusPriority = {
                'open': 0,
                'postponed': 1,
                'past': 2,
                'dormant': 3,
                'unknown': 4
            };
            sorted.sort((a, b) => {
                const priorityA = statusPriority[a.status] || 4;
                const priorityB = statusPriority[b.status] || 4;
                if (priorityA !== priorityB) return priorityA - priorityB;
                // Secondary sort by date within same status
                const dateA = new Date(a.dates) || new Date(9999, 0, 0);
                const dateB = new Date(b.dates) || new Date(9999, 0, 0);
                return dateA - dateB;
            });
            break;
    }

    state.filteredConferences = sorted;
}

// ===========================
// Rendering
// ===========================
function render() {
    // Separate past and non-past conferences
    const nonPastConferences = state.filteredConferences.filter(c => c.status !== 'past');
    const pastConferences = state.filteredConferences.filter(c => c.status === 'past');

    // Update counter
    visibleCount.textContent = state.filteredConferences.length;

    // Show/hide empty state
    if (state.filteredConferences.length === 0) {
        conferenceGrid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    } else {
        emptyState.style.display = 'none';
    }

    // Render cards
    let html = '';

    // Non-past conferences
    nonPastConferences.forEach(conference => {
        html += createConferenceCard(conference);
    });

    // Past conferences section
    if (pastConferences.length > 0) {
        html += `
            <div class="past-conferences-section" style="grid-column: 1 / -1;">
                <label class="checkbox-label" style="margin-bottom: 1rem;">
                    <input type="checkbox" class="past-toggle-check" ${state.showPast ? 'checked' : ''}>
                    <span class="checkbox-text">Show past conferences (${pastConferences.length})</span>
                </label>
                <div class="past-conferences-grid" ${state.showPast ? '' : 'style="display: none;"'}>
        `;

        pastConferences.forEach(conference => {
            html += createConferenceCard(conference);
        });

        html += `
                </div>
            </div>
        `;
    }

    conferenceGrid.innerHTML = html;

    // Add event listeners to expand buttons
    document.querySelectorAll('.expand-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.conference-card');
            const expanded = card.querySelector('.card-expanded');
            expanded.classList.toggle('active');
            btn.textContent = expanded.classList.contains('active') ? 'Hide details' : 'Show details';
        });
    });

    // Add event listener to past toggle
    const pastToggleCheck = document.querySelector('.past-toggle-check');
    if (pastToggleCheck) {
        pastToggleCheck.addEventListener('change', (e) => {
            const grid = e.target.closest('.past-conferences-section').querySelector('.past-conferences-grid');
            grid.style.display = e.target.checked ? 'grid' : 'none';
        });
    }
}

function createConferenceCard(conference) {
    const statusColor = conference.status;
    const feeDisplay = conference.fee_display || 'Not disclosed';
    const dateDisplay = conference.dates_display || 'TBA';

    let expandedHtml = `
        <div class="card-expanded">
            ${conference.languages && conference.languages.length > 0 ? `
                <div class="expanded-section">
                    <div class="expanded-section-title">Languages</div>
                    <div class="expanded-section-content">${conference.languages.join(', ')}</div>
                </div>
            ` : ''}

            ${conference.rop ? `
                <div class="expanded-section">
                    <div class="expanded-section-title">Rules of Procedure</div>
                    <div class="expanded-section-content">${escapeHtml(conference.rop)}</div>
                </div>
            ` : ''}

            ${conference.committees ? `
                <div class="expanded-section">
                    <div class="expanded-section-title">Committees</div>
                    <div class="expanded-section-content">${escapeHtml(conference.committees)}</div>
                </div>
            ` : ''}

            ${conference.character ? `
                <div class="expanded-section">
                    <div class="expanded-section-title">Character/Description</div>
                    <div class="expanded-section-content">${escapeHtml(conference.character)}</div>
                </div>
            ` : ''}

            ${conference.website ? `
                <div class="expanded-section">
                    <div class="expanded-section-title">Official Website</div>
                    <div class="expanded-section-content">
                        <a href="${escapeHtml(conference.website)}" target="_blank" rel="noopener noreferrer" class="expanded-link">${escapeHtml(conference.website)}</a>
                    </div>
                </div>
            ` : ''}

            ${conference.instagram_url ? `
                <div class="expanded-section">
                    <div class="expanded-section-title">Instagram</div>
                    <div class="expanded-section-content">
                        <a href="${escapeHtml(conference.instagram_url)}" target="_blank" rel="noopener noreferrer" class="expanded-link">${escapeHtml(conference.instagram)}</a>
                    </div>
                </div>
            ` : ''}

            ${conference.email ? `
                <div class="expanded-section">
                    <div class="expanded-section-title">Email</div>
                    <div class="expanded-section-content">
                        <a href="mailto:${escapeHtml(conference.email)}" class="expanded-link">${escapeHtml(conference.email)}</a>
                    </div>
                </div>
            ` : ''}

            <p class="expanded-disclaimer">Verify before applying</p>
        </div>
    `;

    return `
        <article class="conference-card">
            <div class="card-header">
                <div class="card-acronym">${escapeHtml(conference.acronym)}</div>
                <div class="status-badge">
                    <div class="status-dot ${statusColor}"></div>
                    <span>${conference.status.charAt(0).toUpperCase() + conference.status.slice(1)}</span>
                </div>
            </div>

            <div class="card-name">${escapeHtml(conference.name)}</div>
            <div class="card-host">${escapeHtml(conference.host)} • ${escapeHtml(conference.city)}</div>

            <div class="card-details">
                <div class="detail-row">
                    <span class="detail-label">Dates:</span>
                    <span class="detail-value">${dateDisplay}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Fee:</span>
                    <span class="detail-value">${feeDisplay}</span>
                </div>
            </div>

            <div class="card-badges">
                ${conference.beginner_friendly ? '<span class="badge">Beginner-friendly</span>' : ''}
                ${conference.edition_label ? `<span class="badge">${escapeHtml(conference.edition_label)}</span>` : ''}
            </div>

            <button class="expand-btn">Show details</button>

            ${expandedHtml}
        </article>
    `;
}

// ===========================
// URL Hash Management
// ===========================
function updateHash() {
    const params = new URLSearchParams();

    if (state.filters.search) params.set('search', state.filters.search);
    if (state.filters.location !== 'all') params.set('location', state.filters.location);
    if (state.filters.status !== 'all') params.set('status', state.filters.status);
    if (state.filters.daterange !== 'all') params.set('daterange', state.filters.daterange);
    if (state.filters.feerange !== 'all') params.set('feerange', state.filters.feerange);
    if (state.filters.level !== 'all') params.set('level', state.filters.level);
    if (state.filters.language !== 'all') params.set('language', state.filters.language);
    if (state.filters.beginner) params.set('beginner', 'true');

    const hash = params.toString();
    window.location.hash = hash ? '#' + hash : '';
}

function loadStateFromHash() {
    const hash = window.location.hash.substring(1);
    if (!hash) return;

    const params = new URLSearchParams(hash);

    if (params.has('search')) {
        state.filters.search = params.get('search');
        searchInput.value = state.filters.search;
    }

    if (params.has('location')) {
        state.filters.location = params.get('location');
        updateFilterButton('location', state.filters.location);
    }

    if (params.has('status')) {
        state.filters.status = params.get('status');
        updateFilterButton('status', state.filters.status);
    }

    if (params.has('daterange')) {
        state.filters.daterange = params.get('daterange');
        updateFilterButton('daterange', state.filters.daterange);
    }

    if (params.has('feerange')) {
        state.filters.feerange = params.get('feerange');
        updateFilterButton('feerange', state.filters.feerange);
    }

    if (params.has('level')) {
        state.filters.level = params.get('level');
        updateFilterButton('level', state.filters.level);
    }

    if (params.has('language')) {
        state.filters.language = params.get('language');
        updateFilterButton('language', state.filters.language);
    }

    if (params.has('beginner')) {
        state.filters.beginner = params.get('beginner') === 'true';
        document.getElementById('beginnerFriendlyCheck').checked = state.filters.beginner;
    }

    updateActiveFilterCount();
}

function updateFilterButton(filterType, value) {
    document.querySelectorAll(`[data-filter="${filterType}"]`).forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.value === value) {
            btn.classList.add('active');
        }
    });
}

// ===========================
// Reset Filters
// ===========================
function resetFilters() {
    state.filters = {
        search: '',
        location: 'all',
        status: 'all',
        daterange: 'all',
        feerange: 'all',
        level: 'all',
        language: 'all',
        beginner: false
    };

    searchInput.value = '';
    document.getElementById('beginnerFriendlyCheck').checked = false;

    // Reset all filter buttons
    filterBtns.forEach(btn => {
        if (btn.dataset.value === 'all') {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Reset checkboxes
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    applyFilters();
    render();
    updateHash();
    updateActiveFilterCount();
}

// ===========================
// Utility Functions
// ===========================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateActiveFilterCount() {
    let count = 0;
    if (state.filters.search) count++;
    if (state.filters.location !== 'all') count++;
    if (state.filters.status !== 'all') count++;
    if (state.filters.daterange !== 'all') count++;
    if (state.filters.feerange !== 'all') count++;
    if (state.filters.level !== 'all') count++;
    if (state.filters.language !== 'all') count++;
    if (state.filters.beginner) count++;

    activeFilterCount.textContent = count;
}

// ===========================
// Start Application
// ===========================
document.addEventListener('DOMContentLoaded', init);
