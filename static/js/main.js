// WFM System Main JavaScript
// Database Status Monitor
class DatabaseStatus {
    constructor() {
        this.statusElement = null;
        this.tableCountElement = null;
        this.checkInterval = 30000; // 30 seconds
    }

    init() {
        this.statusElement = document.getElementById('db-status');
        this.tableCountElement = document.getElementById('table-counts');
        
        if (this.statusElement) {
            this.checkStatus();
            setInterval(() => this.checkStatus(), this.checkInterval);
        }
    }

    async checkStatus() {
        try {
            const response = await fetch('/api/database-status');
            const data = await response.json();
            
            if (data.success) {
                this.setStatus('connected', 'Connected');
                if (data.tables && this.tableCountElement) {
                    this.updateTableCounts(data.tables);
                }
            } else {
                this.setStatus('error', 'Error');
            }
        } catch (error) {
            this.setStatus('error', 'Disconnected');
        }
    }

    setStatus(status, text) {
        if (!this.statusElement) return;
        
        this.statusElement.className = `badge bg-${status === 'connected' ? 'success' : 'danger'}`;
        this.statusElement.textContent = text;
    }

    updateTableCounts(tables) {
        if (!this.tableCountElement) return;
        
        const counts = Object.entries(tables)
            .map(([table, count]) => `${table}: ${count}`)
            .join(', ');
        this.tableCountElement.textContent = counts;
    }
}

// Flash Messages System
class FlashMessages {
    constructor() {
        this.container = null;
    }

    init() {
        this.container = document.getElementById('flash-messages');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'flash-messages';
            this.container.className = 'fixed-top mt-3';
            this.container.style.zIndex = '9999';
            document.body.appendChild(this.container);
        }
    }

    show(message, type = 'info') {
        if (!this.container) this.init();
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show mx-3`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        this.container.appendChild(alert);
        
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 5000);
    }
}

// Sample Data Manager
class SampleDataManager {
    constructor() {
        this.button = null;
    }

    init() {
        this.button = document.getElementById('create-sample-data');
        if (this.button) {
            this.button.addEventListener('click', () => this.createSampleData());
        }
    }

    async createSampleData() {
        if (!confirm('This will create sample data. Continue?')) return;
        
        try {
            LoadingManager.showLoading(this.button);
            
            const response = await fetch('/api/create-sample-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                window.flashMessages.show('Sample data created successfully!', 'success');
                setTimeout(() => window.location.reload(), 1000);
            } else {
                window.flashMessages.show(data.message || 'Failed to create sample data', 'danger');
            }
        } catch (error) {
            console.error('Error creating sample data:', error);
            window.flashMessages.show('Error creating sample data', 'danger');
        } finally {
            LoadingManager.hideLoading(this.button);
        }
    }
}

// Loading Manager
class LoadingManager {
    static showLoading(element) {
        if (!element) return;
        element.disabled = true;
        element.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';
    }

    static hideLoading(element) {
        if (!element) return;
        element.disabled = false;
        element.innerHTML = element.getAttribute('data-original-text') || 'Submit';
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            window.flashMessages.show('Copied to clipboard!', 'success');
        } catch (err) {
            console.error('Failed to copy: ', err);
            window.flashMessages.show('Failed to copy to clipboard', 'danger');
        }
    }
}

// Live Clock Timer
class LiveClockTimer {
    constructor() {
        this.timerElement = null;
        this.clockInTime = null;
        this.interval = null;
        this.isRunning = false;
    }

    init() {
        this.timerElement = document.getElementById('live-timer');
        if (this.timerElement) {
            this.checkClockStatus();
        }
    }

    async checkClockStatus() {
        try {
            const response = await fetch('/api/current-status');
            const data = await response.json();
            
            if (data.success && data.is_clocked_in && data.clock_in_time) {
                this.clockInTime = new Date(data.clock_in_time);
                this.startTimer();
            }
        } catch (error) {
            console.error('Error checking clock status:', error);
        }
    }

    startTimer() {
        if (this.interval) clearInterval(this.interval);
        
        this.isRunning = true;
        this.updateDisplay();
        this.interval = setInterval(() => this.updateDisplay(), 1000);
    }

    updateDisplay() {
        if (!this.timerElement || !this.clockInTime) return;
        
        const now = new Date();
        const diff = now - this.clockInTime;
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        this.timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    onClockIn() {
        this.clockInTime = new Date();
        this.startTimer();
    }

    onClockOut() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
        if (this.timerElement) {
            this.timerElement.textContent = '00:00:00';
        }
    }

    destroy() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}

// Clock Button UI Update
function updateClockButtonUI(isClockedIn, clockInTime = null) {
    const clockInBtn = document.getElementById('clockInBtn');
    const clockOutBtn = document.getElementById('clockOutBtn');
    const statusDiv = document.getElementById('clock-status');
    
    if (clockInBtn && clockOutBtn) {
        if (isClockedIn) {
            clockInBtn.style.display = 'none';
            clockOutBtn.style.display = 'block';
            
            if (statusDiv) {
                statusDiv.innerHTML = `
                    <div class="alert alert-success">
                        <i data-feather="clock" class="me-2"></i>
                        You are currently clocked in
                        ${clockInTime ? `<br><small>Since: ${new Date(clockInTime).toLocaleTimeString()}</small>` : ''}
                    </div>
                `;
            }
        } else {
            clockInBtn.style.display = 'block';
            clockOutBtn.style.display = 'none';
            
            if (statusDiv) {
                statusDiv.innerHTML = `
                    <div class="alert alert-info">
                        <i data-feather="clock" class="me-2"></i>
                        You are currently clocked out
                    </div>
                `;
            }
        }
        
        // Re-initialize Feather icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }
}

// Time Entries Refresh
async function refreshTimeEntries() {
    const tableBody = document.querySelector('#time-entries-table tbody');
    if (!tableBody) return;
    
    try {
        const response = await fetch('/api/recent-time-entries');
        const data = await response.json();
        
        if (data.success) {
            updateTimeEntriesTable(data.entries);
        }
    } catch (error) {
        console.error('Error refreshing time entries:', error);
    }
}

function updateTimeEntriesTable(entries) {
    const tableBody = document.querySelector('#time-entries-table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    entries.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(entry.clock_in_time).toLocaleDateString()}</td>
            <td>${new Date(entry.clock_in_time).toLocaleTimeString()}</td>
            <td>${entry.clock_out_time ? new Date(entry.clock_out_time).toLocaleTimeString() : 'Active'}</td>
            <td>${entry.total_hours || '0.00'}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Quick Actions
function showTimesheet() {
    window.location.href = '/time/timecard';
}

function showProfile() {
    window.location.href = '/auth/profile';
}

function showHelp() {
    window.flashMessages.show('Help documentation coming soon!', 'info');
}

function toggleQuickActionsView() {
    const quickActions = document.getElementById('quick-actions-section');
    if (quickActions) {
        quickActions.style.display = quickActions.style.display === 'none' ? 'block' : 'none';
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize global instances
    window.dbStatus = new DatabaseStatus();
    window.flashMessages = new FlashMessages();
    window.sampleDataManager = new SampleDataManager();
    window.liveTimer = new LiveClockTimer();
    
    // Initialize all components
    window.dbStatus.init();
    window.flashMessages.init();
    window.sampleDataManager.init();
    window.liveTimer.init();
    
    // Initialize Feather icons if available
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    console.log('WFM System initialized successfully');
});

// Clean up on page unload
window.addEventListener('beforeunload', function() {
    if (window.liveTimer) {
        window.liveTimer.destroy();
    }
});