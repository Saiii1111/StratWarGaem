// ===== HOW TO PLAY SIDEBAR TAB FUNCTIONALITY =====

function initSidebarTabs() {
    const sidebarTabs = document.querySelectorAll('.sidebar-tab');
    const sidebarContents = document.querySelectorAll('.sidebar-content');
    
    function switchTab(tabName) {
        sidebarTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });
        
        sidebarContents.forEach(content => {
            content.classList.remove('active');
            if (content.dataset.tab === tabName) {
                content.classList.add('active');
                content.scrollTop = 0;
            }
        });
        
        localStorage.setItem('neonBattleActiveTab', tabName);
    }
    
    sidebarTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.tab);
        });
    });
    
    const savedTab = localStorage.getItem('neonBattleActiveTab') || 'battle-stats';
    switchTab(savedTab);
}

function initUnitInfoTab() {
    const unitTabs = document.querySelectorAll('.unit-tab');
    const unitDetails = document.querySelectorAll('.unit-detail');
    
    function switchUnitInfo(unitType) {
        unitTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.unit === unitType) {
                tab.classList.add('active');
            }
        });
        
        unitDetails.forEach(detail => {
            detail.classList.remove('active');
            if (detail.dataset.unit === unitType) {
                detail.classList.add('active');
            }
        });
    }
    
    unitTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchUnitInfo(tab.dataset.unit);
        });
    });
    
    document.querySelectorAll('.unit-controls button[data-type]').forEach(btn => {
        btn.addEventListener('click', () => {
            const unitType = btn.dataset.type;
            switchUnitInfo(unitType);
        });
    });
    
    switchUnitInfo('soldier');
}

document.addEventListener('DOMContentLoaded', function() {
    initSidebarTabs();
    initUnitInfoTab();
});
