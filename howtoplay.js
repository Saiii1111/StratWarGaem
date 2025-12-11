// ===== HOW TO PLAY SIDEBAR TAB FUNCTIONALITY =====

function initSidebarTabs() {
    const sidebarTabs = document.querySelectorAll('.sidebar-tab');
    const sidebarContents = document.querySelectorAll('.sidebar-content');
    
    // Function to switch tabs
    function switchTab(tabName) {
        // Update active tab
        sidebarTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });
        
        // Update active content
        sidebarContents.forEach(content => {
            content.classList.remove('active');
            if (content.dataset.tab === tabName) {
                content.classList.add('active');
            }
        });
        
        // Save active tab to localStorage
        localStorage.setItem('neonBattleActiveTab', tabName);
    }
    
    // Add click events to tabs
    sidebarTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.tab);
        });
    });
    
    // Load saved tab from localStorage, or default to battle-stats
    const savedTab = localStorage.getItem('neonBattleActiveTab') || 'battle-stats';
    switchTab(savedTab);
}

function initUnitInfoTab() {
    const unitTabs = document.querySelectorAll('.unit-tab');
    const unitDetails = document.querySelectorAll('.unit-detail');
    
    // Function to switch unit info
    function switchUnitInfo(unitType) {
        // Update active tab
        unitTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.unit === unitType) {
                tab.classList.add('active');
            }
        });
        
        // Update active detail
        unitDetails.forEach(detail => {
            detail.classList.remove('active');
            if (detail.dataset.unit === unitType) {
                detail.classList.add('active');
            }
        });
    }
    
    // Add click events to tabs
    unitTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchUnitInfo(tab.dataset.unit);
        });
    });
    
    // Sync with placement buttons
    document.querySelectorAll('.unit-controls button[data-type]').forEach(btn => {
        btn.addEventListener('click', () => {
            const unitType = btn.dataset.type;
            switchUnitInfo(unitType);
        });
    });
    
    // Initialize with soldier
    switchUnitInfo('soldier');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initSidebarTabs();
    initUnitInfoTab();
});
