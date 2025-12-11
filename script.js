* { 
    margin: 0; 
    padding: 0; 
    box-sizing: border-box; 
}

body { 
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: #0f0f0f;
    color: #ffffff;
    height: 100vh;
    overflow: hidden;
}

/* HEADER - ORIGINAL WORKING VERSION */
.header { 
    background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
    border-bottom: 1px solid #333;
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    min-height: 60px;
}

.header h1 { 
    color: #fff;
    font-size: 1.3rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
}

.header h1::before { content: "⚔️"; font-size: 1.4rem; }

.header-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: flex-end;
    flex: 1;
}

.unit-controls, .game-controls {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    padding: 4px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
}

.unit-controls {
    border: 1px solid #444;
    padding: 6px;
}

.game-controls {
    border: 1px solid #444;
    padding: 6px;
}

.header button { 
    background: #404040;
    border: none;
    padding: 10px 14px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.85rem;
    color: #fff;
    min-width: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    touch-action: manipulation;
    white-space: nowrap;
}

.header button:hover { 
    background: #4a4a4a;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
}
.header button:active { transform: translateY(0); }

.unit-btn { background: #e74c3c; }
.unit-btn:hover { background: #ec7063; }
.unit-btn.active { 
    background: #c0392b; 
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
    transform: translateY(0);
}

.special-btn { background: #3498db; }
.special-btn:hover { background: #5dade2; }
.cavalry-btn { background: #8e44ad; }
.cavalry-btn:hover { background: #9b59b6; }

.control-btn { background: #27ae60; }
.control-btn:hover { background: #2ecc71; }
.control-btn.pause { 
    background: #f39c12; 
    color: white;
}
.control-btn.pause:hover { background: #f4d03f; }

.danger-btn { background: #e67e22; }
.danger-btn:hover { background: #eb984e; }
.delete-all-btn { background: #c0392b; }
.delete-all-btn:hover { background: #e74c3c; }
.auto-btn { background: #9b59b6; }
.auto-btn:hover { background: #af7ac5; }
.play-again-header-btn { background: #1abc9c; }
.play-again-header-btn:hover { background: #48c9b0; }

/* MAIN CONTAINER - SIMPLE FIXED LAYOUT */
.main-container {
    display: flex;
    height: calc(100vh - 60px);
    background: #1a1a1a;
}

/* SIDEBAR - FIXED WIDTH */
.sidebar {
    width: 220px;
    background: #2d2d2d;
    border-right: 1px solid #333;
    padding: 12px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* Sidebar Tabs */
.sidebar-tabs {
    display: flex;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    padding: 4px;
    border: 1px solid #444;
    margin-bottom: 12px;
}

.sidebar-tab {
    flex: 1;
    background: #404040;
    border: none;
    padding: 8px 6px;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    color: #aaa;
    text-align: center;
}

.sidebar-tab:hover {
    background: #4a4a4a;
    color: #fff;
}

.sidebar-tab.active {
    background: #3498db;
    color: #fff;
}

/* Tab Content */
.sidebar-content {
    display: none;
    flex: 1;
    overflow-y: auto;
}

.sidebar-content.active {
    display: block;
}

/* Scrollbar */
.sidebar-content::-webkit-scrollbar {
    width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
}

.sidebar-content::-webkit-scrollbar-thumb {
    background: #3498db;
    border-radius: 3px;
}

/* Sidebar Sections */
.sidebar-section {
    background: #363636;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    margin-bottom: 12px;
}

.sidebar-section h3 {
    color: #fff;
    font-size: 0.95rem;
    margin-bottom: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
}

.stats-title::before { content: "📊"; }
.how-to-title::before { content: "❓"; }
.unit-info-title::before { content: "📋"; }

/* Battle Stats */
.stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    font-size: 0.85rem;
    border-bottom: 1px solid #404040;
}

.stat-row:last-child { border-bottom: none; }
.red-stat { color: #e74c3c; font-weight: 600; }
.blue-stat { color: #3498db; font-weight: 600; }
.green-stat { color: #27ae60; font-weight: 600; }

/* How to Play */
.how-to-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.instruction {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    padding: 10px;
    border-left: 3px solid #3498db;
}

.instruction strong {
    color: #fff;
    font-size: 0.85rem;
    display: block;
    margin-bottom: 5px;
}

.instruction p {
    color: #ccc;
    font-size: 0.75rem;
    line-height: 1.4;
    margin: 0;
}

/* Unit Info */
.unit-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 12px;
}

.unit-tab {
    flex: 1;
    background: #404040;
    border: none;
    padding: 6px 4px;
    border-radius: 4px;
    font-size: 0.7rem;
    cursor: pointer;
    color: #fff;
    text-align: center;
}

.unit-tab.active {
    background: #3498db;
}

.unit-tab[data-unit="soldier"].active { background: #e74c3c; }
.unit-tab[data-unit="tank"].active { background: #3498db; }
.unit-tab[data-unit="healer"].active { background: #f39c12; }
.unit-tab[data-unit="musketeer"].active { background: #d35400; }
.unit-tab[data-unit="cavalry"].active { background: #8e44ad; }

.unit-detail {
    display: none;
}

.unit-detail.active {
    display: block;
}

.unit-stat {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    font-size: 0.8rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.unit-stat:last-child {
    border-bottom: none;
}

.stat-value {
    color: #fff;
    font-weight: 600;
}

.unit-desc {
    margin-top: 10px;
    padding: 8px;
    background: rgba(52, 152, 219, 0.1);
    border-radius: 4px;
    font-size: 0.75rem;
    color: #ccc;
    line-height: 1.4;
}

/* GAME AREA - ORIGINAL WORKING VERSION */
.game-area {
    flex: 1;
    padding: 12px;
    background: #1a1a1a;
    display: flex;
}

#gameCanvas { 
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
    border: 1px solid #333;
}

/* NOTIFICATION - ORIGINAL */
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 16px;
    background: #27ae60;
    color: white;
    border-radius: 8px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
    z-index: 1500;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    max-width: 280px;
    font-weight: 600;
    font-size: 0.85rem;
    border-left: 4px solid rgba(255, 255, 255, 0.3);
}

.notification.show { transform: translateX(0); }
.notification.error { background: #e74c3c; }
.notification.warning { background: #f39c12; }
.notification.info { background: #3498db; }

/* MODAL - ORIGINAL */
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    z-index: 2000;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(5px);
    padding: 20px;
}

.modal-content {
    background: #2d2d2d;
    padding: 30px;
    border-radius: 16px;
    text-align: center;
    width: 100%;
    max-width: 500px;
    border: 3px solid #404040;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
    animation: modalAppear 0.3s ease-out;
}

@keyframes modalAppear {
    0% { transform: scale(0.9); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
}

.modal h2 { 
    font-size: 2.2rem; 
    margin-bottom: 20px; 
    color: #fff;
    font-weight: 800;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.winner-text {
    font-size: 1.8rem;
    font-weight: bold;
    margin: 25px 0;
    padding: 20px;
    border-radius: 12px;
    background: linear-gradient(135deg, #363636, #2d2d2d);
    border: 3px solid;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

.winner-red { 
    color: #ff6b6b; 
    border-color: #ff6b6b;
    background: linear-gradient(135deg, rgba(231, 76, 60, 0.2), rgba(192, 57, 43, 0.1));
    text-shadow: 0 2px 10px rgba(231, 76, 60, 0.5);
}

.winner-blue { 
    color: #74b9ff; 
    border-color: #74b9ff;
    background: linear-gradient(135deg, rgba(52, 152, 219, 0.2), rgba(41, 128, 185, 0.1));
    text-shadow: 0 2px 10px rgba(52, 152, 219, 0.5);
}

#battleStats {
    margin: 25px 0;
    font-size: 1.2rem;
    color: #ccc;
    background: rgba(0, 0, 0, 0.3);
    padding: 20px;
    border-radius: 10px;
    line-height: 1.8;
}

#battleStats span { font-weight: 700; color: #fff; }

.play-again-container { margin-top: 30px; }

.play-again-btn {
    background: linear-gradient(135deg, #27ae60, #2ecc71);
    border: none;
    padding: 18px 40px;
    border-radius: 12px;
    font-weight: 800;
    font-size: 1.3rem;
    cursor: pointer;
    transition: all 0.3s ease;
    color: white;
    width: 100%;
    max-width: 300px;
    box-shadow: 0 8px 25px rgba(46, 204, 113, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin: 0 auto;
}

.play-again-btn:hover {
    background: linear-gradient(135deg, #2ecc71, #27ae60);
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 15px 35px rgba(46, 204, 113, 0.6);
}

.play-again-btn:active { transform: translateY(-1px) scale(1.02); }

.damage-text {
    position: absolute;
    font-weight: 700;
    pointer-events: none;
    animation: floatUp 1s ease-out forwards;
    font-size: 14px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

@keyframes floatUp {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    50% { transform: translateY(-15px) scale(1.1); opacity: 0.8; }
    100% { transform: translateY(-30px) scale(1.2); opacity: 0; }
}

/* MOBILE RESPONSIVE */
@media (max-width: 768px) {
    .main-container {
        flex-direction: column;
        height: auto;
    }
    
    .sidebar {
        width: 100%;
        height: 200px;
        border-right: none;
        border-bottom: 1px solid #333;
        order: 2;
    }
    
    .game-area {
        order: 1;
        height: calc(100vh - 260px);
    }
    
    .header {
        flex-direction: column;
        align-items: stretch;
    }
    
    .header-controls {
        flex-direction: column;
        gap: 8px;
    }
    
    .unit-controls, .game-controls {
        justify-content: center;
    }
    
    .sidebar-tabs {
        margin-bottom: 8px;
    }
    
    .sidebar-tab {
        padding: 8px 4px;
        font-size: 0.75rem;
    }
}

@media (max-height: 500px) and (orientation: landscape) {
    .header { padding: 8px 12px; min-height: 50px; }
    .header h1 { font-size: 1.1rem; }
    .header button { padding: 8px 10px; font-size: 0.8rem; min-width: 60px; }
    .sidebar { padding: 8px; gap: 8px; }
    .sidebar-section { padding: 8px; }
    .modal-content { padding: 20px; }
    .winner-text { font-size: 1.4rem; padding: 15px; margin: 15px 0; }
}
