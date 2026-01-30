/**
 * Roadmap Planner - Supabase Integrated
 * Features: Cloud storage, real-time sync, drag-and-drop, status tracking
 */

// ============================================
// Supabase Configuration
// ============================================

const SUPABASE_URL = 'https://hrisxnfihqhipcwtzqcm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyaXN4bmZpaHFoaXBjd3R6cWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3OTM4NzQsImV4cCI6MjA4NTM2OTg3NH0.ouIpF-BXOIFaEvSRjyETgCg-l2OGjosiegB8FeQF9N8';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// Data Management
// ============================================

const QUARTERS = {
    1: ['January', 'February', 'March'],
    2: ['April', 'May', 'June'],
    3: ['July', 'August', 'September'],
    4: ['October', 'November', 'December']
};

let initiatives = [];
let currentQuarter = 1;
let currentYear = 2026;
let activeFilters = {
    team: 'all',
    priority: 'all',
    status: 'all'
};
let searchQuery = '';
let editingId = null;
let isLoading = false;

// ============================================
// Sample Data for First Run
// ============================================

const sampleInitiatives = [
    {
        title: 'New Dashboard Release',
        description: 'Complete redesign of the analytics dashboard with real-time metrics',
        team: 'engineering',
        priority: 'high',
        status: 'in-progress',
        progress: 65,
        assignee: 'JD',
        start_month: 1,
        end_month: 2,
        quarter: 1,
        year: 2026
    },
    {
        title: 'Design System v3.0',
        description: 'Refresh component library with new brand guidelines',
        team: 'design',
        priority: 'medium',
        status: 'in-progress',
        progress: 40,
        assignee: 'SK',
        start_month: 1,
        end_month: 1,
        quarter: 1,
        year: 2026
    },
    {
        title: 'Q1 Marketing Campaign',
        description: 'Launch integrated campaign across digital channels',
        team: 'marketing',
        priority: 'high',
        status: 'not-started',
        progress: 0,
        assignee: 'MR',
        start_month: 2,
        end_month: 3,
        quarter: 1,
        year: 2026
    },
    {
        title: 'User Research Sprint',
        description: 'Conduct interviews and usability testing with 50+ users',
        team: 'product',
        priority: 'medium',
        status: 'completed',
        progress: 100,
        assignee: 'AL',
        start_month: 1,
        end_month: 1,
        quarter: 1,
        year: 2026
    },
    {
        title: 'API Performance Optimization',
        description: 'Reduce response times by 50% and improve caching',
        team: 'engineering',
        priority: 'high',
        status: 'in-progress',
        progress: 30,
        assignee: 'TK',
        start_month: 2,
        end_month: 3,
        quarter: 1,
        year: 2026
    },
    {
        title: 'Process Automation',
        description: 'Automate repetitive operational workflows',
        team: 'operations',
        priority: 'low',
        status: 'not-started',
        progress: 0,
        assignee: 'RB',
        start_month: 3,
        end_month: 3,
        quarter: 1,
        year: 2026
    }
];

// ============================================
// DOM Elements
// ============================================

const elements = {
    yearSelect: document.getElementById('yearSelect'),
    quarterBtns: document.querySelectorAll('.quarter-btn'),
    addInitiativeBtn: document.getElementById('addInitiativeBtn'),
    searchInput: document.getElementById('searchInput'),
    teamFilters: document.getElementById('teamFilters'),
    priorityFilters: document.getElementById('priorityFilters'),
    statusFilters: document.getElementById('statusFilters'),
    totalInitiatives: document.getElementById('totalInitiatives'),
    highPriorityCount: document.getElementById('highPriorityCount'),
    completedCount: document.getElementById('completedCount'),
    progressPercent: document.getElementById('progressPercent'),
    timelineGrid: document.getElementById('timelineGrid'),
    modalOverlay: document.getElementById('modalOverlay'),
    modalTitle: document.getElementById('modalTitle'),
    modalClose: document.getElementById('modalClose'),
    initiativeForm: document.getElementById('initiativeForm'),
    cancelBtn: document.getElementById('cancelBtn'),
    month1: document.getElementById('month1'),
    month2: document.getElementById('month2'),
    month3: document.getElementById('month3'),
    progressSlider: document.getElementById('progress'),
    progressValue: document.getElementById('progressValue'),
    toastContainer: document.getElementById('toastContainer'),
    shortcutsModal: document.getElementById('shortcutsModal')
};

// ============================================
// Supabase Database Functions
// ============================================

async function fetchInitiatives() {
    isLoading = true;
    showLoadingState();

    try {
        const { data, error } = await supabase
            .from('initiatives')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;

        // If no data, seed with sample data
        if (!data || data.length === 0) {
            await seedSampleData();
            return;
        }

        // Map database fields to JS format
        initiatives = data.map(mapFromDb);
        renderInitiatives();
        updateStats();
        showToast('Data synced from cloud', 'success');

    } catch (error) {
        console.error('Fetch error:', error);
        showToast('Failed to load data. Using local cache.', 'error');
        loadFromLocalStorage();
    } finally {
        isLoading = false;
        hideLoadingState();
    }
}

async function seedSampleData() {
    try {
        const { data, error } = await supabase
            .from('initiatives')
            .insert(sampleInitiatives)
            .select();

        if (error) throw error;

        initiatives = data.map(mapFromDb);
        renderInitiatives();
        updateStats();
        showToast('Sample data loaded', 'info');

    } catch (error) {
        console.error('Seed error:', error);
        showToast('Failed to seed data', 'error');
    }
}

async function createInitiative(initiativeData) {
    try {
        const dbData = mapToDb(initiativeData);

        const { data, error } = await supabase
            .from('initiatives')
            .insert([dbData])
            .select()
            .single();

        if (error) throw error;

        initiatives.push(mapFromDb(data));
        renderInitiatives();
        updateStats();
        showToast('Initiative created', 'success');

    } catch (error) {
        console.error('Create error:', error);
        showToast('Failed to create initiative', 'error');
    }
}

async function updateInitiative(id, initiativeData) {
    try {
        const dbData = mapToDb(initiativeData);

        const { data, error } = await supabase
            .from('initiatives')
            .update(dbData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        const index = initiatives.findIndex(i => i.id === id);
        if (index !== -1) {
            initiatives[index] = mapFromDb(data);
        }

        renderInitiatives();
        updateStats();
        showToast('Initiative updated', 'success');

    } catch (error) {
        console.error('Update error:', error);
        showToast('Failed to update initiative', 'error');
    }
}

async function deleteInitiativeFromDb(id) {
    try {
        const { error } = await supabase
            .from('initiatives')
            .delete()
            .eq('id', id);

        if (error) throw error;

        initiatives = initiatives.filter(i => i.id !== id);
        renderInitiatives();
        updateStats();
        showToast('Initiative deleted', 'info');

    } catch (error) {
        console.error('Delete error:', error);
        showToast('Failed to delete initiative', 'error');
    }
}

// Map database fields to JS camelCase
function mapFromDb(row) {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        team: row.team,
        priority: row.priority,
        status: row.status,
        progress: row.progress,
        assignee: row.assignee,
        startMonth: row.start_month,
        endMonth: row.end_month,
        quarter: row.quarter,
        year: row.year
    };
}

// Map JS camelCase to database fields
function mapToDb(initiative) {
    return {
        title: initiative.title,
        description: initiative.description,
        team: initiative.team,
        priority: initiative.priority,
        status: initiative.status,
        progress: initiative.progress,
        assignee: initiative.assignee,
        start_month: initiative.startMonth,
        end_month: initiative.endMonth,
        quarter: initiative.quarter,
        year: initiative.year,
        updated_at: new Date().toISOString()
    };
}

// Fallback to localStorage
function loadFromLocalStorage() {
    const stored = localStorage.getItem('roadmap_initiatives_v2');
    if (stored) {
        initiatives = JSON.parse(stored);
        renderInitiatives();
        updateStats();
    }
}

function showLoadingState() {
    document.body.classList.add('loading');
}

function hideLoadingState() {
    document.body.classList.remove('loading');
}

// ============================================
// Real-time Subscription
// ============================================

function setupRealtimeSubscription() {
    supabase
        .channel('initiatives-changes')
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'initiatives' },
            (payload) => {
                console.log('Realtime update:', payload);

                switch (payload.eventType) {
                    case 'INSERT':
                        const newItem = mapFromDb(payload.new);
                        if (!initiatives.find(i => i.id === newItem.id)) {
                            initiatives.push(newItem);
                            renderInitiatives();
                            updateStats();
                        }
                        break;
                    case 'UPDATE':
                        const updatedItem = mapFromDb(payload.new);
                        const index = initiatives.findIndex(i => i.id === updatedItem.id);
                        if (index !== -1) {
                            initiatives[index] = updatedItem;
                            renderInitiatives();
                            updateStats();
                        }
                        break;
                    case 'DELETE':
                        initiatives = initiatives.filter(i => i.id !== payload.old.id);
                        renderInitiatives();
                        updateStats();
                        break;
                }
            }
        )
        .subscribe();
}

// ============================================
// Initialization
// ============================================

async function init() {
    setupEventListeners();
    updateQuarterDisplay();
    await fetchInitiatives();
    setupRealtimeSubscription();
}

// ============================================
// Event Listeners
// ============================================

function setupEventListeners() {
    // Year selector
    elements.yearSelect.addEventListener('change', (e) => {
        currentYear = parseInt(e.target.value);
        renderInitiatives();
        updateStats();
    });

    // Quarter buttons
    elements.quarterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.quarterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentQuarter = parseInt(btn.dataset.quarter);
            updateQuarterDisplay();
            renderInitiatives();
            updateStats();
        });
    });

    // Add initiative button
    elements.addInitiativeBtn.addEventListener('click', () => openModal());

    // Search input
    elements.searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderInitiatives();
    });

    // Team filters
    elements.teamFilters.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            elements.teamFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilters.team = btn.dataset.team;
            renderInitiatives();
        });
    });

    // Priority filters
    elements.priorityFilters.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            elements.priorityFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilters.priority = btn.dataset.priority;
            renderInitiatives();
        });
    });

    // Status filters
    elements.statusFilters.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            elements.statusFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilters.status = btn.dataset.status;
            renderInitiatives();
        });
    });

    // Progress slider
    elements.progressSlider.addEventListener('input', (e) => {
        elements.progressValue.textContent = `${e.target.value}%`;
    });

    // Modal events
    elements.modalClose.addEventListener('click', closeModal);
    elements.cancelBtn.addEventListener('click', closeModal);
    elements.modalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.modalOverlay) closeModal();
    });

    // Form submit
    elements.initiativeForm.addEventListener('submit', handleFormSubmit);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// ============================================
// Keyboard Shortcuts
// ============================================

function handleKeyboardShortcuts(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
            closeModal();
            closeShortcutsModal();
            e.target.blur();
        }
        return;
    }

    if (e.key === 'Escape') {
        closeModal();
        closeShortcutsModal();
        return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openModal();
        return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        elements.searchInput.focus();
        return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportData();
        return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        fetchInitiatives();
        return;
    }

    if (e.key === '?') {
        e.preventDefault();
        openShortcutsModal();
        return;
    }

    if (e.key === 'ArrowRight' && !e.ctrlKey && !e.metaKey) {
        if (currentQuarter < 4) {
            currentQuarter++;
            updateQuarterButtons();
            updateQuarterDisplay();
            renderInitiatives();
            updateStats();
        }
        return;
    }

    if (e.key === 'ArrowLeft' && !e.ctrlKey && !e.metaKey) {
        if (currentQuarter > 1) {
            currentQuarter--;
            updateQuarterButtons();
            updateQuarterDisplay();
            renderInitiatives();
            updateStats();
        }
        return;
    }
}

function updateQuarterButtons() {
    elements.quarterBtns.forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.quarter) === currentQuarter) {
            btn.classList.add('active');
        }
    });
}

function openShortcutsModal() {
    elements.shortcutsModal.classList.add('active');
}

function closeShortcutsModal() {
    elements.shortcutsModal.classList.remove('active');
}

window.closeShortcutsModal = closeShortcutsModal;

// ============================================
// Quarter Display
// ============================================

function updateQuarterDisplay() {
    const months = QUARTERS[currentQuarter];

    elements.month1.querySelector('.month-name').textContent = months[0];
    elements.month2.querySelector('.month-name').textContent = months[1];
    elements.month3.querySelector('.month-name').textContent = months[2];

    const startMonthSelect = document.getElementById('startMonth');
    const endMonthSelect = document.getElementById('endMonth');

    [startMonthSelect, endMonthSelect].forEach(select => {
        if (select) {
            select.options[0].text = months[0];
            select.options[1].text = months[1];
            select.options[2].text = months[2];
        }
    });

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const quarterStartMonth = (currentQuarter - 1) * 3;

    [elements.month1, elements.month2, elements.month3].forEach((el, idx) => {
        el.classList.remove('current');
        if (currentMonth === quarterStartMonth + idx && currentYear === currentDate.getFullYear()) {
            el.classList.add('current');
        }
    });
}

// ============================================
// Render Initiatives
// ============================================

function renderInitiatives() {
    document.querySelectorAll('.month-cell').forEach(cell => {
        cell.innerHTML = '';
    });

    const filtered = initiatives.filter(initiative => {
        if (initiative.quarter !== currentQuarter || initiative.year !== currentYear) return false;
        if (activeFilters.team !== 'all' && initiative.team !== activeFilters.team) return false;
        if (activeFilters.priority !== 'all' && initiative.priority !== activeFilters.priority) return false;
        if (activeFilters.status !== 'all' && initiative.status !== activeFilters.status) return false;
        if (searchQuery && !initiative.title.toLowerCase().includes(searchQuery) &&
            !initiative.description?.toLowerCase().includes(searchQuery)) return false;
        return true;
    });

    filtered.forEach(initiative => {
        const card = createInitiativeCard(initiative);
        const cell = document.querySelector(
            `.month-cell[data-month="${initiative.startMonth}"][data-team="${initiative.team}"]`
        );
        if (cell) {
            cell.appendChild(card);
        }
    });

    updateTeamStats();
    setupDragAndDrop();
}

function createInitiativeCard(initiative) {
    const card = document.createElement('div');
    card.className = `initiative-card ${initiative.team}`;
    card.draggable = true;
    card.dataset.id = initiative.id;

    const monthSpan = initiative.endMonth - initiative.startMonth + 1;
    const monthNames = QUARTERS[currentQuarter];
    const dateText = monthSpan > 1
        ? `${monthNames[initiative.startMonth - 1].substring(0, 3)} - ${monthNames[initiative.endMonth - 1].substring(0, 3)}`
        : monthNames[initiative.startMonth - 1].substring(0, 3);

    card.innerHTML = `
    <div class="card-status-dot ${initiative.status}"></div>
    <div class="card-header">
      <span class="card-title">${escapeHtml(initiative.title)}</span>
      <span class="priority-tag ${initiative.priority}">${initiative.priority}</span>
    </div>
    ${initiative.description ? `<p class="card-description">${escapeHtml(initiative.description)}</p>` : ''}
    ${initiative.progress > 0 ? `
    <div class="card-progress">
      <div class="card-progress-bar">
        <div class="card-progress-fill" style="width: ${initiative.progress}%"></div>
      </div>
      <span class="card-progress-text">${initiative.progress}%</span>
    </div>
    ` : ''}
    <div class="card-footer">
      <div class="card-meta">
        <span class="card-dates">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
          </svg>
          ${dateText}
        </span>
        ${initiative.assignee ? `<span class="card-assignee">${escapeHtml(initiative.assignee)}</span>` : ''}
      </div>
      <div class="card-actions">
        <button class="card-action-btn edit" title="Edit" onclick="editInitiativeHandler('${initiative.id}')">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="card-action-btn delete" title="Delete" onclick="deleteInitiativeHandler('${initiative.id}')">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  `;

    return card;
}

function updateTeamStats() {
    const teams = ['engineering', 'design', 'marketing', 'product', 'operations'];

    teams.forEach(team => {
        const teamInitiatives = initiatives.filter(i =>
            i.team === team &&
            i.quarter === currentQuarter &&
            i.year === currentYear
        );

        const count = teamInitiatives.length;
        const completedCount = teamInitiatives.filter(i => i.status === 'completed').length;
        const avgProgress = count > 0
            ? Math.round(teamInitiatives.reduce((sum, i) => sum + (i.progress || 0), 0) / count)
            : 0;

        const header = document.querySelector(`.swimlane[data-team="${team}"] .team-count`);
        const progressBar = document.querySelector(`.swimlane[data-team="${team}"] .team-progress-bar`);

        if (header) {
            header.textContent = `${count} initiative${count !== 1 ? 's' : ''} • ${completedCount} done`;
        }
        if (progressBar) {
            progressBar.style.width = `${avgProgress}%`;
        }
    });
}

function updateStats() {
    const currentInitiatives = initiatives.filter(i =>
        i.quarter === currentQuarter && i.year === currentYear
    );

    const total = currentInitiatives.length;
    const highPriority = currentInitiatives.filter(i => i.priority === 'high').length;
    const completed = currentInitiatives.filter(i => i.status === 'completed').length;
    const avgProgress = total > 0
        ? Math.round(currentInitiatives.reduce((sum, i) => sum + (i.progress || 0), 0) / total)
        : 0;

    elements.totalInitiatives.textContent = total;
    elements.highPriorityCount.textContent = highPriority;
    elements.completedCount.textContent = completed;
    elements.progressPercent.textContent = `${avgProgress}%`;
}

// ============================================
// Swimlane Toggle
// ============================================

window.toggleSwimlane = function (header) {
    const swimlane = header.closest('.swimlane');
    swimlane.classList.toggle('collapsed');
};

// ============================================
// Drag and Drop
// ============================================

function setupDragAndDrop() {
    const cards = document.querySelectorAll('.initiative-card');
    const cells = document.querySelectorAll('.month-cell');

    cards.forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });

    cells.forEach(cell => {
        cell.addEventListener('dragover', handleDragOver);
        cell.addEventListener('dragleave', handleDragLeave);
        cell.addEventListener('drop', handleDrop);
    });
}

function handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    document.querySelectorAll('.month-cell').forEach(cell => {
        cell.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

async function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    const initiativeId = e.dataTransfer.getData('text/plain');
    const newMonth = parseInt(e.currentTarget.dataset.month);
    const newTeam = e.currentTarget.dataset.team;

    const initiative = initiatives.find(i => i.id === initiativeId);
    if (initiative) {
        const duration = initiative.endMonth - initiative.startMonth;
        const updatedData = {
            ...initiative,
            startMonth: newMonth,
            endMonth: Math.min(newMonth + duration, 3),
            team: newTeam
        };

        await updateInitiative(initiativeId, updatedData);
    }
}

// ============================================
// Modal Functions
// ============================================

function openModal(initiative = null) {
    editingId = initiative ? initiative.id : null;
    elements.modalTitle.textContent = initiative ? 'Edit Initiative' : 'Add Initiative';

    if (initiative) {
        document.getElementById('title').value = initiative.title;
        document.getElementById('description').value = initiative.description || '';
        document.querySelector(`input[name="team"][value="${initiative.team}"]`).checked = true;
        document.querySelector(`input[name="priority"][value="${initiative.priority}"]`).checked = true;
        document.querySelector(`input[name="status"][value="${initiative.status}"]`).checked = true;
        document.getElementById('progress').value = initiative.progress || 0;
        document.getElementById('progressValue').textContent = `${initiative.progress || 0}%`;
        document.getElementById('startMonth').value = initiative.startMonth;
        document.getElementById('endMonth').value = initiative.endMonth;
        document.getElementById('assignee').value = initiative.assignee || '';
    } else {
        elements.initiativeForm.reset();
        document.getElementById('progressValue').textContent = '0%';
        document.getElementById('statusNotStarted').checked = true;
    }

    elements.modalOverlay.classList.add('active');
    document.getElementById('title').focus();
}

function closeModal() {
    elements.modalOverlay.classList.remove('active');
    editingId = null;
    elements.initiativeForm.reset();
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const startMonth = parseInt(formData.get('startMonth'));
    const endMonth = parseInt(formData.get('endMonth'));

    if (endMonth < startMonth) {
        showToast('End month must be after or equal to start month', 'error');
        return;
    }

    const initiativeData = {
        title: formData.get('title'),
        description: formData.get('description'),
        team: formData.get('team'),
        priority: formData.get('priority'),
        status: formData.get('status'),
        progress: parseInt(formData.get('progress')) || 0,
        assignee: formData.get('assignee') || '',
        startMonth: startMonth,
        endMonth: endMonth,
        quarter: currentQuarter,
        year: currentYear
    };

    if (editingId) {
        await updateInitiative(editingId, initiativeData);
    } else {
        await createInitiative(initiativeData);
    }

    closeModal();
}

// ============================================
// CRUD Handlers (Global)
// ============================================

window.editInitiativeHandler = function (id) {
    const initiative = initiatives.find(i => i.id === id);
    if (initiative) {
        openModal(initiative);
    }
};

window.deleteInitiativeHandler = async function (id) {
    if (confirm('Are you sure you want to delete this initiative?')) {
        await deleteInitiativeFromDb(id);
    }
};

// ============================================
// Export Function
// ============================================

function exportData() {
    const currentInitiatives = initiatives.filter(i =>
        i.quarter === currentQuarter && i.year === currentYear
    );

    const csvContent = [
        ['Title', 'Team', 'Priority', 'Status', 'Progress', 'Assignee', 'Start Month', 'End Month', 'Description'].join(','),
        ...currentInitiatives.map(i => [
            `"${i.title}"`,
            i.team,
            i.priority,
            i.status,
            i.progress || 0,
            i.assignee || '',
            QUARTERS[currentQuarter][i.startMonth - 1],
            QUARTERS[currentQuarter][i.endMonth - 1],
            `"${(i.description || '').replace(/"/g, '""')}"`
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `roadmap_Q${currentQuarter}_${currentYear}.csv`;
    link.click();

    showToast('Roadmap exported to CSV', 'success');
}

// ============================================
// Toast Notifications
// ============================================

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
        error: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
        info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'
    };

    toast.innerHTML = `
    <svg class="toast-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      ${icons[type]}
    </svg>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  `;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ============================================
// Utilities
// ============================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', init);
