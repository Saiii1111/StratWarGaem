// script.js
// Game Constants
const MUSKET_RANGE = 150;
const BAYONET_RANGE = 60;
const BASE_UNIT_SIZE = 20;
const MAP_PADDING = 20;

// Game State
const gameState = {
    placingMode: "soldier",
    gameRunning: false,
    circles: [],
    mouseX: 0,
    mouseY: 0,
    showGhost: true,
    attackEffects: [],
    musketEffects: [],
    healingEffects: [],
    damageTexts: [],
    gameSpeed: 1.0,
    battleStartTime: 0,
    battleDuration: 0,
    originalCircles: [],
    totalKills: 0,
    highestSingleDamage: 0
};

// DOM Elements
let canvas, ctx, notification, gameOverModal, winnerTextEl;
let playAgainHeaderBtn, startPauseBtn;
let redCountEl, blueCountEl, totalCountEl, battleTimeEl, gameStatusEl;
let finalTimeEl, remainingUnitsEl, totalKillsEl, highestDamageEl;

// =============== GAME INITIALIZATION ===============
function initGame() {
    // Get DOM elements
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    notification = document.getElementById("notification");
    gameOverModal = document.getElementById("gameOverModal");
    winnerTextEl = document.getElementById("winnerText");
    playAgainHeaderBtn = document.getElementById("playAgainHeaderBtn");
    startPauseBtn = document.getElementById("startPauseBtn");
    
    redCountEl = document.getElementById("redCount");
    blueCountEl = document.getElementById("blueCount");
    totalCountEl = document.getElementById("totalCount");
    battleTimeEl = document.getElementById("battleTime");
    gameStatusEl = document.getElementById("gameStatus");
    finalTimeEl = document.getElementById("finalTime");
    remainingUnitsEl = document.getElementById("remainingUnits");
    totalKillsEl = document.getElementById("totalKills");
    highestDamageEl = document.getElementById("highestDamage");
    
    // Setup canvas
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize UI
    updateActiveButton();
    updateStartPauseButton();
    showNotification('Click to place units', 'info');
    
    // Start game loop
    requestAnimationFrame(gameLoop);
}

// =============== CANVAS FUNCTIONS ===============
function resizeCanvas() {
    const container = canvas.parentElement;
    const header = document.querySelector('.header');
    const sidebar = document.querySelector('.sidebar');
    
    if (window.innerWidth >= 768) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    } else {
        const availableHeight = window.innerHeight - header.offsetHeight - sidebar.offsetHeight;
        canvas.width = container.clientWidth;
        canvas.height = Math.max(300, availableHeight);
    }
}

// =============== UI FUNCTIONS ===============
function updateActiveButton() {
    document.querySelectorAll('.unit-controls button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === gameState.placingMode) {
            btn.classList.add('active');
        }
    });
}

function showNotification(message, type = 'info') {
    notification.textContent = message;
    notification.className = 'notification';
    
    if (type === 'error') notification.classList.add('error');
    else if (type === 'warning') notification.classList.add('warning');
    else if (type === 'info') notification.classList.add('info');
    
    notification.classList.add('show');
    
    setTimeout(() => notification.classList.remove('show'), 2000);
}

function updateStartPauseButton() {
    if (gameState.gameRunning) {
        startPauseBtn.innerHTML = '<span class="icon">⏸️</span><span class="text">Pause</span>';
        startPauseBtn.classList.add('pause');
    } else {
        startPauseBtn.innerHTML = '<span class="icon">▶️</span><span class="text">Start</span>';
        startPauseBtn.classList.remove('pause');
    }
}

// =============== EVENT LISTENERS ===============
function setupEventListeners() {
    // Canvas events
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleCanvasClick);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    
    // Unit buttons
    document.querySelectorAll('.unit-controls button').forEach(btn => {
        if (btn.dataset.type) {
            btn.onclick = () => { 
                gameState.placingMode = btn.dataset.type; 
                showNotification(`Placing: ${btn.querySelector('.text').textContent}`, 'info'); 
                gameState.showGhost = true; 
                updateActiveButton();
            };
        }
    });
    
    // Control buttons
    document.getElementById("deleteTool").onclick = () => { 
        gameState.placingMode = "delete"; 
        showNotification("Delete Tool", 'warning'); 
        gameState.showGhost = false; 
        updateActiveButton();
    };
    
    document.getElementById("deleteAllBtn").onclick = () => {
        if (gameState.circles.length > 0) {
            gameState.circles = [];
            showNotification('All units deleted', 'warning');
        } else {
            showNotification('No units to delete', 'info');
        }
    };
    
    document.getElementById("startPauseBtn").onclick = toggleGameRunning;
    document.getElementById("autoPlaceBtn").onclick = autoPlaceUnits;
    playAgainHeaderBtn.onclick = playAgain;
}

// =============== INPUT HANDLERS ===============
function getCanvasMousePos(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let clientX, clientY;
    
    if (event.type.includes('touch')) { 
        clientX = event.touches[0].clientX; 
        clientY = event.touches[0].clientY; 
    } else { 
        clientX = event.clientX; 
        clientY = event.clientY; 
    }
    
    return { 
        x: (clientX - rect.left) * scaleX, 
        y: (clientY - rect.top) * scaleY 
    };
}

function handleMouseMove(e) {
    const pos = getCanvasMousePos(e);
    gameState.mouseX = pos.x;
    gameState.mouseY = pos.y;
}

function handleTouchMove(e) {
    e.preventDefault();
    const pos = getCanvasMousePos(e);
    gameState.mouseX = pos.x;
    gameState.mouseY = pos.y;
}

function handleTouchStart(e) {
    e.preventDefault();
    const pos = getCanvasMousePos(e);
    handleCanvasClick(pos.x, pos.y);
}

function handleCanvasClick(x, y) {
    if (gameState.gameRunning) return;
    
    const radius = BASE_UNIT_SIZE * (Math.min(canvas.width, canvas.height) / 800);
    const withinBounds = x > MAP_PADDING + radius && 
                         x < canvas.width - MAP_PADDING - radius && 
                         y > MAP_PADDING + radius && 
                         y < canvas.height - MAP_PADDING - radius;
    
    if (!withinBounds) { 
        showNotification('Cannot place outside battlefield', 'warning'); 
        return; 
    }

    if (gameState.placingMode === "delete") {
        const beforeCount = gameState.circles.length;
        gameState.circles = gameState.circles.filter(c => 
            Math.hypot(c.x - x, c.y - y) > c.radius
        );
        if (gameState.circles.length < beforeCount) {
            showNotification('Unit deleted', 'warning');
        }
    } else {
        const type = gameState.placingMode;
        const team = x < canvas.width/2 ? 'red' : 'blue';
        const blocked = gameState.circles.some(c => 
            Math.hypot(c.x - x, c.y - y) < (c.radius + radius) * 0.8
        );
        
        if (!blocked) { 
            gameState.circles.push(new Circle(x, y, team, type)); 
            showNotification(`${type} placed`, 'info'); 
        } else { 
            showNotification('Space occupied', 'warning'); 
        }
    }
}

// =============== GAME CONTROL FUNCTIONS ===============
function toggleGameRunning() {
    if (gameState.circles.length === 0) { 
        showNotification('Place units first', 'warning'); 
        return; 
    }
    
    if (!gameState.gameRunning) {
        // Start game
        if (gameState.battleStartTime === 0) saveOriginalPlacements();
        gameState.gameRunning = true; 
        gameState.showGhost = false;
        if (gameState.battleStartTime === 0) gameState.battleStartTime = performance.now();
        showNotification("Battle started", 'info');
        gameStatusEl.textContent = "Running";
    } else {
        // Pause game
        gameState.gameRunning = false; 
        gameState.showGhost = true; 
        showNotification("Battle paused", 'warning');
        gameStatusEl.textContent = "Paused";
    }
    
    updateStartPauseButton();
}

function autoPlaceUnits() {
    gameState.circles = []; 
    const padding = MAP_PADDING + 30;
    
    // Red Team - Balanced composition
    for (let i = 0; i < 4; i++) {
        gameState.circles.push(new Circle(
            padding + Math.random() * (canvas.width/2 - padding*2),
            padding + Math.random() * (canvas.height - padding*2),
            'red', 'soldier'
        ));
    }
    
    // Add specialized units for red team
    const redUnits = [
        [40, canvas.height/2 - 60, 'tank'],
        [80, canvas.height/2 + 60, 'tank'],
        [60, canvas.height/3, 'healer'],
        [100, canvas.height*2/3, 'healer'],
        [120, canvas.height/4, 'musketeer'],
        [140, canvas.height*3/4, 'musketeer'],
        [160, canvas.height/5, 'cavalry'],
        [180, canvas.height*4/5, 'cavalry']
    ];
    
    redUnits.forEach(([xOffset, y, type]) => {
        gameState.circles.push(new Circle(padding + xOffset, y, 'red', type));
    });
    
    // Blue Team - Balanced composition
    for (let i = 0; i < 4; i++) {
        gameState.circles.push(new Circle(
            canvas.width/2 + padding + Math.random() * (canvas.width/2 - padding*2),
            padding + Math.random() * (canvas.height - padding*2),
            'blue', 'soldier'
        ));
    }
    
    // Add specialized units for blue team
    const blueUnits = [
        [-40, canvas.height/2 - 60, 'tank'],
        [-80, canvas.height/2 + 60, 'tank'],
        [-60, canvas.height/3, 'healer'],
        [-100, canvas.height*2/3, 'healer'],
        [-120, canvas.height/4, 'musketeer'],
        [-140, canvas.height*3/4, 'musketeer'],
        [-160, canvas.height/5, 'cavalry'],
        [-180, canvas.height*4/5, 'cavalry']
    ];
    
    blueUnits.forEach(([xOffset, y, type]) => {
        gameState.circles.push(new Circle(canvas.width - padding + xOffset, y, 'blue', type));
    });
    
    showNotification('Auto-placed armies', 'info');
}

function saveOriginalPlacements() {
    gameState.originalCircles = gameState.circles.map(circle => ({
        x: circle.x, 
        y: circle.y, 
        team: circle.team, 
        type: circle.type,
        health: circle.maxHealth, 
        maxHealth: circle.maxHealth, 
        radius: circle.radius,
        hasUsedFirstCharge: circle.type === 'cavalry' ? circle.hasUsedFirstCharge : undefined
    }));
    gameState.totalKills = 0; 
    gameState.highestSingleDamage = 0;
}

function restoreOriginalPlacements() {
    gameState.circles = []; 
    gameState.attackEffects = []; 
    gameState.musketEffects = []; 
    gameState.healingEffects = []; 
    gameState.damageTexts = [];
    
    gameState.originalCircles.forEach(original => {
        const circle = new Circle(original.x, original.y, original.team, original.type);
        circle.health = original.maxHealth; 
        circle.maxHealth = original.maxHealth;
        if (original.type === 'cavalry' && original.hasUsedFirstCharge === false) {
            circle.hasUsedFirstCharge = false;
            circle.lastCharge = performance.now() - circle.chargeCooldown - 10000;
        }
        gameState.circles.push(circle);
    });
    
    gameState.gameRunning = false; 
    gameState.showGhost = true; 
    gameState.battleStartTime = 0; 
    gameState.battleDuration = 0;
    gameState.totalKills = 0; 
    gameState.highestSingleDamage = 0; 
    playAgainHeaderBtn.style.display = 'none';
    updateStartPauseButton();
}

function playAgain() { 
    gameOverModal.style.display = 'none'; 
    restoreOriginalPlacements(); 
    gameState.placingMode = "soldier"; 
    updateActiveButton(); 
    showNotification('Game reset', 'info'); 
}

// =============== DRAWING FUNCTIONS ===============
function drawMap() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const redGradient = ctx.createLinearGradient(0, 0, canvas.width/2, 0);
    redGradient.addColorStop(0, 'rgba(231, 76, 60, 0.1)');
    redGradient.addColorStop(1, 'rgba(231, 76, 60, 0.05)');
    ctx.fillStyle = redGradient;
    ctx.fillRect(0, 0, canvas.width/2, canvas.height);
    
    const blueGradient = ctx.createLinearGradient(canvas.width, 0, canvas.width/2, 0);
    blueGradient.addColorStop(0, 'rgba(52, 152, 219, 0.1)');
    blueGradient.addColorStop(1, 'rgba(52, 152, 219, 0.05)');
    ctx.fillStyle = blueGradient;
    ctx.fillRect(canvas.width/2, 0, canvas.width/2, canvas.height);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = 'rgba(231, 76, 60, 0.8)';
    ctx.font = 'bold 18px "Segoe UI", system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔴 RED', canvas.width/4, 25);
    
    ctx.fillStyle = 'rgba(52, 152, 219, 0.8)';
    ctx.fillText('🔵 BLUE', canvas.width*3/4, 25);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.rect(MAP_PADDING, MAP_PADDING, canvas.width - MAP_PADDING*2, canvas.height - MAP_PADDING*2);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawGhost() {
    if (!gameState.showGhost || gameState.placingMode === "delete") return;
    
    let color, radius = BASE_UNIT_SIZE * (Math.min(canvas.width, canvas.height) / 800);
    let team = gameState.mouseX < canvas.width/2 ? "red" : "blue";
    let type = gameState.placingMode;
    
    if (type === "soldier") { 
        color = team === "red" ? "rgba(231, 76, 60, 0.6)" : "rgba(52, 152, 219, 0.6)"; 
    } else if (type === "tank") { 
        color = team === "red" ? "rgba(231, 76, 60, 0.6)" : "rgba(52, 152, 219, 0.6)"; 
        radius = BASE_UNIT_SIZE * 1.3 * (Math.min(canvas.width, canvas.height) / 800); 
    } else if (type === "healer") { 
        color = team === "red" ? "rgba(231, 76, 60, 0.6)" : "rgba(52, 152, 219, 0.6)"; 
    } else if (type === "musketeer") { 
        color = team === "red" ? "rgba(231, 76, 60, 0.6)" : "rgba(52, 152, 219, 0.6)"; 
        radius = BASE_UNIT_SIZE * 0.9 * (Math.min(canvas.width, canvas.height) / 800); 
    } else if (type === "cavalry") { 
        color = team === "red" ? "rgba(231, 76, 60, 0.6)" : "rgba(52, 152, 219, 0.6)"; 
        radius = BASE_UNIT_SIZE * 1.1 * (Math.min(canvas.width, canvas.height) / 800); 
    }
    
    const withinBounds = gameState.mouseX > MAP_PADDING + radius && 
                         gameState.mouseX < canvas.width - MAP_PADDING - radius && 
                         gameState.mouseY > MAP_PADDING + radius && 
                         gameState.mouseY < canvas.height - MAP_PADDING - radius;
    let blocked = gameState.circles.some(c => 
        Math.hypot(c.x - gameState.mouseX, c.y - gameState.mouseY) < (c.radius + radius) * 0.8
    );
    
    if (blocked || !withinBounds) color = "rgba(231, 76, 60, 0.8)";
    
    ctx.beginPath();
    ctx.arc(gameState.mouseX, gameState.mouseY, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    
    if (type === "healer") {
        ctx.beginPath();
        ctx.moveTo(gameState.mouseX - radius/2, gameState.mouseY);
        ctx.lineTo(gameState.mouseX + radius/2, gameState.mouseY);
        ctx.moveTo(gameState.mouseX, gameState.mouseY - radius/2);
        ctx.lineTo(gameState.mouseX, gameState.mouseY + radius/2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 2;
        ctx.stroke();
    } else if (type === "musketeer") {
        ctx.beginPath();
        ctx.moveTo(gameState.mouseX - radius, gameState.mouseY);
        ctx.lineTo(gameState.mouseX + radius, gameState.mouseY);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(gameState.mouseX + radius, gameState.mouseY, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fill();
    } else if (type === "cavalry") {
        ctx.beginPath();
        ctx.arc(gameState.mouseX + radius * 0.7, gameState.mouseY, radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fill();
    }
}

// =============== GAME CLASSES ===============
class DamageText {
    constructor(x, y, damage, isHeal = false, isCritical = false, isMiss = false) {
        this.x = x; 
        this.y = y; 
        this.damage = damage; 
        this.isHeal = isHeal; 
        this.isCritical = isCritical; 
        this.isMiss = isMiss;
        this.life = 1.0; 
        this.velocityY = -1;
    }
    
    update() { 
        this.y += this.velocityY; 
        this.life -= 0.02; 
        return this.life > 0; 
    }
    
    draw() {
        ctx.font = this.isCritical ? 'bold 16px Arial' : 'bold 13px Arial';
        let color;
        
        if (this.isMiss) { 
            color = `rgba(155, 155, 155, ${this.life})`; 
            ctx.fillStyle = color; 
            ctx.textAlign = 'center'; 
            ctx.fillText("MISS", this.x, this.y); 
        } else if (this.isHeal) { 
            color = `rgba(46, 204, 113, ${this.life})`; 
            ctx.fillStyle = color; 
            ctx.textAlign = 'center'; 
            ctx.fillText('+' + this.damage, this.x, this.y); 
        } else if (this.isCritical) { 
            color = `rgba(231, 76, 60, ${this.life})`; 
            ctx.fillStyle = color; 
            ctx.textAlign = 'center'; 
            ctx.fillText('-' + this.damage, this.x, this.y); 
        } else { 
            color = `rgba(245, 125, 128, ${this.life})`; 
            ctx.fillStyle = color; 
            ctx.textAlign = 'center'; 
            ctx.fillText('-' + this.damage, this.x, this.y); 
        }
    }
}

class MusketEffect {
    constructor(startX, startY, targetX, targetY, hit = true) {
        this.startX = startX; 
        this.startY = startY; 
        this.targetX = targetX; 
        this.targetY = targetY; 
        this.hit = hit;
        this.progress = 0; 
        this.speed = 0.12; 
        this.life = 1.0; 
        this.color = hit ? '#f39c12' : '#95a5a6';
    }
    
    update() { 
        this.progress += this.speed; 
        this.life -= 0.015; 
        return this.progress <= 1.0 && this.life > 0; 
    }
    
    draw() {
        const currentX = this.startX + (this.targetX - this.startX) * this.progress;
        const currentY = this.startY + (this.targetY - this.startY) * this.progress;
        
        ctx.beginPath(); 
        ctx.arc(currentX, currentY, this.hit ? 4 : 3, 0, Math.PI * 2); 
        ctx.fillStyle = this.color; 
        ctx.fill();
        
        ctx.beginPath(); 
        ctx.arc(currentX, currentY, this.hit ? 8 : 6, 0, Math.PI * 2); 
        ctx.fillStyle = this.hit ? `rgba(243, 156, 18, ${0.3 * this.life})` : `rgba(149, 165, 166, ${0.3 * this.life})`; 
        ctx.fill();
        
        if (this.progress < 0.1) { 
            ctx.beginPath(); 
            ctx.arc(this.startX, this.startY, 10 * (1 - this.progress * 10), 0, Math.PI * 2); 
            ctx.fillStyle = `rgba(255, 200, 100, ${0.7 * this.life})`; 
            ctx.fill(); 
        }
    }
}

class HealingEffect {
    constructor(startX, startY, targetX, targetY, amount) {
        this.startX = startX; 
        this.startY = startY; 
        this.targetX = targetX; 
        this.targetY = targetY; 
        this.amount = amount;
        this.progress = 0; 
        this.speed = 0.08; 
        this.life = 1.0; 
        this.color = '#2ecc71'; 
        this.healingUnitId = null;
    }
    
    update() { 
        this.progress += this.speed; 
        this.life -= 0.01; 
        return this.progress <= 1.0 && this.life > 0; 
    }
    
    draw() {
        const currentX = this.startX + (this.targetX - this.startX) * this.progress;
        const currentY = this.startY + (this.targetY - this.startY) * this.progress;
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.01);
        
        ctx.beginPath(); 
        ctx.moveTo(this.startX, this.startY); 
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = `rgba(46, 204, 113, ${0.7 * this.life})`; 
        ctx.lineWidth = 4 + pulse; 
        ctx.lineCap = 'round'; 
        ctx.stroke();
        
        ctx.strokeStyle = `rgba(46, 204, 113, ${0.3 * this.life})`; 
        ctx.lineWidth = 10; 
        ctx.stroke();
        
        ctx.beginPath(); 
        ctx.arc(currentX, currentY, 6, 0, Math.PI * 2); 
        ctx.fillStyle = `rgba(46, 204, 113, ${this.life})`; 
        ctx.fill();
        
        if (this.healingUnitId && this.progress > 0.8) {
            const healingUnit = gameState.circles.find(c => c.id === this.healingUnitId);
            if (healingUnit) { 
                ctx.beginPath(); 
                ctx.arc(healingUnit.x, healingUnit.y, healingUnit.radius + 3, 0, Math.PI * 2); 
                ctx.strokeStyle = `rgba(46, 204, 113, ${0.5 * this.life})`; 
                ctx.lineWidth = 3; 
                ctx.stroke(); 
            }
        }
    }
}

class AttackEffect {
    constructor(x, y, team, isCritical = false) {
        this.x = x; 
        this.y = y; 
        this.team = team; 
        this.isCritical = isCritical;
        this.radius = isCritical ? 6 : 4; 
        this.maxRadius = isCritical ? 20 : 15; 
        this.duration = isCritical ? 300 : 200; 
        this.startTime = performance.now();
    }
    
    draw() {
        const elapsed = performance.now() - this.startTime;
        const progress = elapsed / this.duration;
        if (progress >= 1) return false;
        
        const currentRadius = this.radius + (this.maxRadius - this.radius) * progress;
        const alpha = 1 - progress;
        
        ctx.beginPath(); 
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        if (this.isCritical) { 
            ctx.fillStyle = this.team === 'red' ? `rgba(231, 76, 60, ${alpha})` : `rgba(52, 152, 219, ${alpha})`; 
        } else { 
            ctx.fillStyle = this.team === 'red' ? `rgba(192, 57, 43, ${alpha})` : `rgba(41, 128, 185, ${alpha})`; 
        }
        ctx.fill(); 
        return true;
    }
}

// =============== CIRCLE (UNIT) CLASS ===============
class Circle {
    constructor(x, y, team, type = 'soldier') {
        this.x = x; 
        this.y = y; 
        this.team = team; 
        this.type = type;
        const sizeMultiplier = Math.min(canvas.width, canvas.height) / 800;
        
        // Unit stats based on type
        if (type === 'soldier') {
            this.radius = BASE_UNIT_SIZE * sizeMultiplier; 
            this.health = 100; 
            this.maxHealth = 100;
            this.attackPower = team === 'red' ? 10 : 12; 
            this.attackCooldown = 600;
            this.maxSpeed = 1.8 * sizeMultiplier; 
            this.turnSpeed = 0.15;
        } else if (type === 'tank') {
            this.radius = BASE_UNIT_SIZE * 1.4 * sizeMultiplier; 
            this.health = 200; 
            this.maxHealth = 200;
            this.attackPower = team === 'red' ? 18 : 20; 
            this.attackCooldown = 800;
            this.maxSpeed = 1.0 * sizeMultiplier; 
            this.turnSpeed = 0.1;
        } else if (type === 'healer') {
            this.radius = BASE_UNIT_SIZE * sizeMultiplier; 
            this.health = 80; 
            this.maxHealth = 80;
            this.attackPower = 0; 
            this.healPower = 6; 
            this.healCooldown = 300;
            this.maxSpeed = 1.5 * sizeMultiplier; 
            this.turnSpeed = 0.12;
            this.healRange = 60; 
            this.currentHealTarget = null;
        } else if (type === 'musketeer') {
            this.radius = BASE_UNIT_SIZE * 0.9 * sizeMultiplier; 
            this.health = 60; 
            this.maxHealth = 60;
            this.attackPower = 25; 
            this.attackCooldown = 1200;
            this.maxSpeed = 1.6 * sizeMultiplier; 
            this.turnSpeed = 0.13;
            this.shootingRange = MUSKET_RANGE * sizeMultiplier; 
            this.bayonetRange = BAYONET_RANGE * sizeMultiplier;
            this.isCharging = false; 
            this.missChance = 0.35; 
            this.lastShot = 0;
        } else if (type === 'cavalry') {
            this.radius = BASE_UNIT_SIZE * 1.1 * sizeMultiplier; 
            this.health = 120; 
            this.maxHealth = 120;
            this.attackPower = team === 'red' ? 15 : 17; 
            this.attackCooldown = 500;
            this.maxSpeed = 2.8 * sizeMultiplier; 
            this.turnSpeed = 0.08;
            this.baseSpeed = 1.2 * sizeMultiplier; 
            this.currentSpeed = this.baseSpeed;
            this.isCharging = false; 
            this.chargeSpeed = this.maxSpeed; 
            this.chargeDamageMultiplier = 1.0;
            this.chargeCooldown = 25000; 
            this.lastCharge = 0; 
            this.chargeDuration = 2000;
            this.chargeStartTime = 0; 
            this.chargeTarget = null; 
            this.minChargeDistance = 50;
            this.currentVelocity = 0; 
            this.chargeBoost = 0; 
            this.hasUsedFirstCharge = false;
            this.lastCharge = performance.now() - this.chargeCooldown - 10000;
        }
        
        // Common properties
        this.lastAttack = 0; 
        this.lastHeal = 0; 
        this.velX = 0; 
        this.velY = 0;
        this.id = Math.random().toString(36).substr(2, 9); 
        this.facingAngle = 0;
        this.lastHealth = this.health; 
        this.totalDamageDealt = 0; 
        this.kills = 0;
    }

    draw() {
        if (Math.abs(this.velX) > 0.1 || Math.abs(this.velY) > 0.1) {
            this.facingAngle = Math.atan2(this.velY, this.velX);
        }
        
        const gradient = ctx.createRadialGradient(
            this.x - 3, this.y - 3, 3, 
            this.x, this.y, this.radius
        );
        
        // Set colors based on team and type
        if (this.team === 'red') {
            if (this.type === 'tank') { 
                gradient.addColorStop(0, '#ff7979'); 
                gradient.addColorStop(1, '#c0392b'); 
            } else if (this.type === 'healer') { 
                gradient.addColorStop(0, '#f8c471'); 
                gradient.addColorStop(1, '#e67e22'); 
            } else if (this.type === 'musketeer') { 
                gradient.addColorStop(0, '#ff9f80'); 
                gradient.addColorStop(1, '#d35400'); 
            } else if (this.type === 'cavalry') { 
                gradient.addColorStop(0, '#e74c3c'); 
                gradient.addColorStop(1, '#c0392b'); 
            } else { 
                gradient.addColorStop(0, '#ff6b6b'); 
                gradient.addColorStop(1, '#e74c3c'); 
            }
        } else {
            if (this.type === 'tank') { 
                gradient.addColorStop(0, '#7ed6df'); 
                gradient.addColorStop(1, '#2980b9'); 
            } else if (this.type === 'healer') { 
                gradient.addColorStop(0, '#81ecec'); 
                gradient.addColorStop(1, '#00cec9'); 
            } else if (this.type === 'musketeer') { 
                gradient.addColorStop(0, '#80bfff'); 
                gradient.addColorStop(1, '#1a5276'); 
            } else if (this.type === 'cavalry') { 
                gradient.addColorStop(0, '#3498db'); 
                gradient.addColorStop(1, '#1a5276'); 
            } else { 
                gradient.addColorStop(0, '#74b9ff'); 
                gradient.addColorStop(1, '#3498db'); 
            }
        }
        
        // Draw unit body
        ctx.beginPath(); 
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); 
        ctx.fillStyle = gradient; 
        ctx.fill();
        
        // Draw unit-specific details
        this.drawUnitDetails();
        
        // Draw health bar
        this.drawHealthBar();
        
        // Draw special effects (reload bar for musketeer, charge cooldown for cavalry)
        this.drawSpecialEffects();
    }

    drawUnitDetails() {
        if (this.type === 'healer') {
            ctx.beginPath();
            ctx.moveTo(this.x - this.radius/2, this.y);
            ctx.lineTo(this.x + this.radius/2, this.y);
            ctx.moveTo(this.x, this.y - this.radius/2);
            ctx.lineTo(this.x, this.y + this.radius/2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else if (this.type === 'musketeer') {
            ctx.save(); 
            ctx.translate(this.x, this.y); 
            ctx.rotate(this.facingAngle);
            
            ctx.beginPath(); 
            ctx.moveTo(-this.radius, 0); 
            ctx.lineTo(this.radius, 0);
            ctx.strokeStyle = this.isCharging ? '#2c3e50' : '#34495e'; 
            ctx.lineWidth = this.isCharging ? 4 : 3; 
            ctx.stroke();
            
            if (this.isCharging) {
                ctx.beginPath(); 
                ctx.moveTo(this.radius, 0); 
                ctx.lineTo(this.radius + 8, 0);
                ctx.strokeStyle = '#7f8c8d'; 
                ctx.lineWidth = 2; 
                ctx.stroke();
                
                ctx.beginPath(); 
                ctx.moveTo(this.radius + 8, 0); 
                ctx.lineTo(this.radius + 4, -3); 
                ctx.lineTo(this.radius + 4, 3); 
                ctx.closePath();
                ctx.fillStyle = '#bdc3c7'; 
                ctx.fill();
            } else { 
                ctx.beginPath(); 
                ctx.arc(this.radius, 0, 3, 0, Math.PI * 2); 
                ctx.fillStyle = '#34495e'; 
                ctx.fill(); 
            }
            
            ctx.restore();
            
            if (this.isCharging) { 
                ctx.beginPath(); 
                ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2); 
                ctx.strokeStyle = 'rgba(231, 76, 60, 0.7)'; 
                ctx.lineWidth = 2; 
                ctx.stroke(); 
            }
        } else if (this.type === 'cavalry') {
            ctx.save(); 
            ctx.translate(this.x, this.y); 
            ctx.rotate(this.facingAngle);
            
            // Draw horse body
            ctx.beginPath(); 
            ctx.ellipse(0, 0, this.radius * 1.2, this.radius * 0.8, 0, 0, Math.PI * 2);
            ctx.fillStyle = this.team === 'red' ? '#e74c3c' : '#3498db'; 
            ctx.fill();
            
            // Draw horse head
            ctx.beginPath(); 
            ctx.arc(this.radius * 1.2, 0, this.radius * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = this.team === 'red' ? '#c0392b' : '#2980b9'; 
            ctx.fill();
            
            // Draw charge effects
            if (this.isCharging) {
                for (let i = 0; i < 3; i++) { 
                    ctx.beginPath(); 
                    ctx.arc(-this.radius * 1.5 - i * 5, 0, this.radius * 0.3 * (1 - i * 0.3), 0, Math.PI * 2); 
                    ctx.fillStyle = `rgba(149, 165, 166, ${0.7 - i * 0.2})`; 
                    ctx.fill(); 
                }
                
                ctx.strokeStyle = `rgba(255, 255, 255, 0.6)`; 
                ctx.lineWidth = 2;
                for (let i = 0; i < 3; i++) {
                    ctx.beginPath(); 
                    ctx.moveTo(-this.radius * 1.5 - i * 8, -this.radius * 0.5); 
                    ctx.lineTo(-this.radius * 2 - i * 15, -this.radius * 0.5 - i * 2); 
                    ctx.stroke();
                    ctx.beginPath(); 
                    ctx.moveTo(-this.radius * 1.5 - i * 8, this.radius * 0.5); 
                    ctx.lineTo(-this.radius * 2 - i * 15, this.radius * 0.5 + i * 2); 
                    ctx.stroke();
                }
                
                if (!this.hasUsedFirstCharge) { 
                    ctx.beginPath(); 
                    ctx.arc(0, 0, this.radius + 15, 0, Math.PI * 2); 
                    ctx.strokeStyle = 'rgba(46, 204, 113, 0.8)'; 
                    ctx.lineWidth = 3; 
                    ctx.stroke(); 
                }
            }
            
            ctx.restore();
            
            // Draw charge cooldown indicator
            if (!this.isCharging && this.hasUsedFirstCharge) {
                const now = performance.now(); 
                const chargeProgress = Math.min(1, (now - this.lastCharge) / this.chargeCooldown);
                if (chargeProgress < 1) { 
                    ctx.beginPath(); 
                    ctx.arc(this.x, this.y, this.radius + 10, -Math.PI/2, -Math.PI/2 + (Math.PI * 2 * chargeProgress)); 
                    ctx.strokeStyle = 'rgba(155, 89, 182, 0.7)'; 
                    ctx.lineWidth = 3; 
                    ctx.stroke(); 
                }
            }
        }
    }

    drawHealthBar() {
        const barWidth = this.radius * 2;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; 
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 8, barWidth, 4);
        
        let healthColor; 
        const healthPercent = this.health / this.maxHealth;
        if (healthPercent > 0.6) healthColor = '#2ecc71';
        else if (healthPercent > 0.3) healthColor = '#f39c12';
        else healthColor = '#e74c3c';
        
        ctx.fillStyle = healthColor; 
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 8, barWidth * healthPercent, 4);
    }

    drawSpecialEffects() {
        if (this.type === 'musketeer' && !this.isCharging) {
            const now = performance.now(); 
            const reloadProgress = Math.min(1, (now - this.lastShot) / this.attackCooldown);
            if (reloadProgress < 1) { 
                ctx.beginPath(); 
                ctx.arc(this.x, this.y, this.radius + 8, -Math.PI/2, -Math.PI/2 + (Math.PI * 2 * reloadProgress)); 
                ctx.strokeStyle = 'rgba(52, 152, 219, 0.7)'; 
                ctx.lineWidth = 3; 
                ctx.stroke(); 
            }
        }
    }

    distanceTo(other) { 
        return Math.hypot(this.x - other.x, this.y - other.y); 
    }

    applySeparation(alliesAndEnemies) {
        let pushX = 0, pushY = 0;
        for (let other of alliesAndEnemies) {
            if (other === this) continue;
            let dx = this.x - other.x, dy = this.y - other.y;
            let dist = Math.hypot(dx, dy);
            let minDist = this.radius + other.radius + 2;
            if (dist < minDist && dist > 0) {
                let force = (minDist - dist) / minDist;
                pushX += dx / dist * force * 1.5;
                pushY += dy / dist * force * 1.5;
            }
        }
        this.x += pushX; 
        this.y += pushY;
        this.x = Math.max(MAP_PADDING + this.radius, Math.min(canvas.width - MAP_PADDING - this.radius, this.x));
        this.y = Math.max(MAP_PADDING + this.radius, Math.min(canvas.height - MAP_PADDING - this.radius, this.y));
    }

    updateAI(enemies, allies) {
        if (!gameState.gameRunning) return;
        this.applySeparation([...enemies, ...allies]);

        // CAVALRY AI
        if (this.type === 'cavalry') {
            this.updateCavalryAI(enemies, allies);
            return;
        }

        // MUSKETEER AI
        if (this.type === 'musketeer') {
            this.updateMusketeerAI(enemies, allies);
            return;
        }

        // HEALER AI
        if (this.type === 'healer') {
            this.updateHealerAI(allies, enemies);
            return;
        }

        // DEFAULT COMBAT AI for soldiers and tanks
        this.updateCombatAI(enemies);
    }

    updateCavalryAI(enemies, allies) {
        if (enemies.length === 0) return;
        let closestEnemy = enemies.reduce((a, b) => this.distanceTo(a) < this.distanceTo(b) ? a : b);
        let distToEnemy = this.distanceTo(closestEnemy);
        let now = performance.now();
        const speed = Math.hypot(this.velX, this.velY); 
        this.currentVelocity = speed;
        const canCharge = (now - this.lastCharge >= this.chargeCooldown) && (distToEnemy >= this.minChargeDistance);
        
        if (canCharge && !this.isCharging) {
            this.isCharging = true; 
            this.chargeStartTime = now; 
            this.chargeTarget = closestEnemy; 
            this.lastCharge = now;
            this.chargeBoost = 1.0;
        }
        
        if (this.isCharging) {
            const chargeElapsed = now - this.chargeStartTime;
            if (chargeElapsed >= this.chargeDuration || closestEnemy.health <= 0) {
                this.isCharging = false; 
                this.chargeBoost = 0; 
                this.chargeTarget = null;
                if (!this.hasUsedFirstCharge) this.hasUsedFirstCharge = true;
            } else {
                const chargeProgress = chargeElapsed / this.chargeDuration;
                this.chargeBoost = 1.0 + (chargeProgress * 1.8);
                let dx = this.chargeTarget.x - this.x, dy = this.chargeTarget.y - this.y;
                let dist = Math.hypot(dx, dy);
                if (dist > 0) {
                    const desiredX = dx / dist; 
                    const desiredY = dy / dist;
                    this.velX = desiredX * this.baseSpeed * this.chargeBoost; 
                    this.velY = desiredY * this.baseSpeed * this.chargeBoost;
                    this.x += this.velX; 
                    this.y += this.velY;
                }
                let touchDistance = this.radius + closestEnemy.radius + 5;
                if (distToEnemy <= touchDistance) {
                    let speedDamageMultiplier = 1.0;
                    const chargeSpeed = this.currentVelocity * this.chargeBoost;
                    if (chargeSpeed >= 17 && chargeSpeed <= 18) speedDamageMultiplier = 1.45;
                    else if (chargeSpeed >= 13 && chargeSpeed <= 16) speedDamageMultiplier = 1.15;
                    if (now - this.lastAttack >= this.attackCooldown * 0.3) {
                        const damageMultiplier = getDirectionalDamageMultiplier(this, closestEnemy) * speedDamageMultiplier;
                        const actualDamage = Math.floor(this.attackPower * damageMultiplier);
                        const isCritical = damageMultiplier > 1.5 || speedDamageMultiplier > 1.3;
                        const finalDamage = !this.hasUsedFirstCharge ? Math.floor(actualDamage * 1.5) : actualDamage;
                        closestEnemy.health -= finalDamage; 
                        this.lastAttack = now; 
                        this.totalDamageDealt += finalDamage;
                        if (finalDamage > gameState.highestSingleDamage) gameState.highestSingleDamage = finalDamage;
                        gameState.damageTexts.push(new DamageText(closestEnemy.x, closestEnemy.y - closestEnemy.radius - 8, finalDamage, false, isCritical || !this.hasUsedFirstCharge));
                        gameState.attackEffects.push(new AttackEffect(closestEnemy.x, closestEnemy.y, this.team, true));
                        if (!this.hasUsedFirstCharge) this.hasUsedFirstCharge = true;
                        this.isCharging = false; 
                        this.chargeBoost = 0; 
                        this.chargeTarget = null;
                    }
                }
            }
            return;
        }
        
        // Normal movement toward enemy
        let dx = closestEnemy.x - this.x, dy = closestEnemy.y - this.y;
        let dist = Math.hypot(dx, dy);
        let desiredX = dx / dist, desiredY = dy / dist;
        let touchDistance = this.radius + closestEnemy.radius + 1;
        
        if (dist > touchDistance) {
            let speed = this.baseSpeed;
            this.velX += (desiredX * speed - this.velX) * this.turnSpeed;
            this.velY += (desiredY * speed - this.velY) * this.turnSpeed;
            this.x += this.velX; 
            this.y += this.velY;
        } else { 
            this.velX *= 0.7; 
            this.velY *= 0.7; 
        }
        
        // Attack if close enough
        if (dist <= touchDistance) {
            let now = performance.now();
            if (now - this.lastAttack >= this.attackCooldown) {
                const damageMultiplier = getDirectionalDamageMultiplier(this, closestEnemy);
                const actualDamage = Math.floor(this.attackPower * damageMultiplier);
                const isCritical = damageMultiplier > 1.5;
                closestEnemy.health -= actualDamage; 
                this.lastAttack = now; 
                this.totalDamageDealt += actualDamage;
                if (actualDamage > gameState.highestSingleDamage) gameState.highestSingleDamage = actualDamage;
                gameState.damageTexts.push(new DamageText(closestEnemy.x, closestEnemy.y - closestEnemy.radius - 8, actualDamage, false, isCritical));
                gameState.attackEffects.push(new AttackEffect(closestEnemy.x + (Math.random() - 0.5) * 8, closestEnemy.y + (Math.random() - 0.5) * 8, this.team, isCritical));
            }
        }
    }

    updateMusketeerAI(enemies, allies) {
        if (enemies.length === 0) return;
        let closestEnemy = enemies.reduce((a, b) => this.distanceTo(a) < this.distanceTo(b) ? a : b);
        let distToEnemy = this.distanceTo(closestEnemy);
        
        if (distToEnemy < this.bayonetRange) {
            // Bayonet charge mode
            this.isCharging = true;
            let dx = closestEnemy.x - this.x, dy = closestEnemy.y - this.y;
            let dist = Math.hypot(dx, dy);
            if (dist > 0) {
                const desiredX = dx / dist; 
                const desiredY = dy / dist;
                const chargeSpeed = this.maxSpeed * 1.1;
                this.velX += (desiredX * chargeSpeed - this.velX) * this.turnSpeed;
                this.velY += (desiredY * chargeSpeed - this.velY) * this.turnSpeed;
                this.x += this.velX; 
                this.y += this.velY;
            }
            let touchDistance = this.radius + closestEnemy.radius + 1;
            if (distToEnemy <= touchDistance) {
                let now = performance.now();
                if (now - this.lastAttack >= this.attackCooldown * 0.5) {
                    const damageMultiplier = getDirectionalDamageMultiplier(this, closestEnemy);
                    const actualDamage = Math.floor(this.attackPower * 0.7 * damageMultiplier);
                    const isCritical = damageMultiplier > 1.5;
                    closestEnemy.health -= actualDamage; 
                    this.lastAttack = now; 
                    this.totalDamageDealt += actualDamage;
                    if (actualDamage > gameState.highestSingleDamage) gameState.highestSingleDamage = actualDamage;
                    gameState.damageTexts.push(new DamageText(closestEnemy.x, closestEnemy.y - closestEnemy.radius - 8, actualDamage, false, isCritical));
                    gameState.attackEffects.push(new AttackEffect(closestEnemy.x + (Math.random() - 0.5) * 8, closestEnemy.y + (Math.random() - 0.5) * 8, this.team, isCritical));
                }
            }
        } else {
            // Shooting mode
            if (this.isCharging) { 
                this.isCharging = false; 
                this.lastShot = performance.now(); 
            }
            this.velX *= 0.9; 
            this.velY *= 0.9;
            let dx = closestEnemy.x - this.x, dy = closestEnemy.y - this.y;
            this.facingAngle = Math.atan2(dy, dx);
            
            if (distToEnemy <= this.shootingRange) {
                // In shooting range
                let now = performance.now();
                if (now - this.lastShot >= this.attackCooldown) {
                    const miss = Math.random() < this.missChance;
                    if (!miss) {
                        const damageMultiplier = getDirectionalDamageMultiplier(this, closestEnemy);
                        const actualDamage = Math.floor(this.attackPower * damageMultiplier);
                        const isCritical = damageMultiplier > 1.5;
                        closestEnemy.health -= actualDamage; 
                        this.totalDamageDealt += actualDamage; 
                        this.lastShot = now;
                        if (actualDamage > gameState.highestSingleDamage) gameState.highestSingleDamage = actualDamage;
                        gameState.damageTexts.push(new DamageText(closestEnemy.x, closestEnemy.y - closestEnemy.radius - 8, actualDamage, false, isCritical));
                        gameState.attackEffects.push(new AttackEffect(closestEnemy.x + (Math.random() - 0.5) * 8, closestEnemy.y + (Math.random() - 0.5) * 8, this.team, isCritical));
                    } else { 
                        gameState.damageTexts.push(new DamageText(closestEnemy.x, closestEnemy.y - closestEnemy.radius - 8, 0, false, false, true)); 
                    }
                    gameState.musketEffects.push(new MusketEffect(this.x, this.y, closestEnemy.x, closestEnemy.y, !miss));
                    this.lastShot = now;
                }
            } else {
                // Move toward enemy to get in range
                if (distToEnemy > 0) {
                    const desiredX = dx / distToEnemy; 
                    const desiredY = dy / distToEnemy;
                    this.velX += (desiredX * this.maxSpeed * 0.7 - this.velX) * this.turnSpeed;
                    this.velY += (desiredY * this.maxSpeed * 0.7 - this.velY) * this.turnSpeed;
                    this.x += this.velX; 
                    this.y += this.velY;
                }
            }
        }
    }

    updateHealerAI(allies, enemies) {
        // Find allies that need healing (prioritize combat units, not other healers)
        let healingCandidates = [];
        
        for (let ally of allies) {
            if (ally === this || ally.health <= 0) continue;
            
            // Calculate healing priority score
            let priority = 0;
            const healthPercent = ally.health / ally.maxHealth;
            
            // Base priority: lower health = higher priority
            priority += (1 - healthPercent) * 100;
            
            // Combat unit bonus (don't prioritize other healers)
            if (ally.type !== 'healer') {
                priority += 50; // Combat units get bonus priority
                
                // Tank bonus (high value unit)
                if (ally.type === 'tank') priority += 30;
                
                // Cavalry bonus (mobile unit)
                if (ally.type === 'cavalry') priority += 20;
                
                // Check if ally is actively engaged in combat
                const closeEnemies = enemies.filter(e => this.distanceTo(e) < 100);
                if (closeEnemies.length > 0) {
                    priority += 40; // Bonus for units in combat
                }
            } else {
                // Penalize healing other healers (only heal them if they're critically low)
                priority -= 80;
            }
            
            // Distance penalty (closer is better)
            const distance = this.distanceTo(ally);
            priority -= distance * 0.5;
            
            // Only add if they need healing (< 90% health)
            if (healthPercent < 0.9) {
                healingCandidates.push({
                    ally: ally,
                    priority: priority,
                    healthPercent: healthPercent,
                    distance: distance
                });
            }
        }
        
        // Sort by priority (highest first)
        healingCandidates.sort((a, b) => b.priority - a.priority);
        
        if (healingCandidates.length > 0) {
            let target = healingCandidates[0].ally;
            let distToTarget = this.distanceTo(target);
            
            if (distToTarget > this.healRange + 5) {
                // Move toward target
                let dx = target.x - this.x, dy = target.y - this.y;
                let dist = Math.hypot(dx, dy);
                if (dist > 0) {
                    const desiredX = dx / dist; 
                    const desiredY = dy / dist;
                    const moveSpeed = Math.min(this.maxSpeed, distToTarget - this.healRange) * 0.7;
                    this.velX += (desiredX * moveSpeed - this.velX) * this.turnSpeed;
                    this.velY += (desiredY * moveSpeed - this.velY) * this.turnSpeed;
                    this.x += this.velX; 
                    this.y += this.velY;
                }
            } else {
                // Within healing range, slow down and heal
                this.velX *= 0.8; 
                this.velY *= 0.8;
                let now = performance.now();
                if (now - this.lastHeal >= this.healCooldown) {
                    const healAmount = Math.min(this.healPower, target.maxHealth - target.health);
                    if (healAmount > 0) {
                        target.health += healAmount; 
                        this.lastHeal = now;
                        const healEffect = new HealingEffect(this.x, this.y, target.x, target.y, healAmount);
                        healEffect.healingUnitId = target.id; 
                        gameState.healingEffects.push(healEffect);
                        gameState.damageTexts.push(new DamageText(target.x, target.y - target.radius - 10, healAmount, true));
                    }
                }
            }
        } else {
            // No one needs healing, stay safe behind the front lines
            if (allies.length > 1) {
                // Find average position of combat units (excluding healers)
                let combatAllies = allies.filter(a => a !== this && a.type !== 'healer');
                if (combatAllies.length > 0) {
                    let avgX = 0, avgY = 0;
                    combatAllies.forEach(ally => { 
                        avgX += ally.x; 
                        avgY += ally.y; 
                    });
                    avgX /= combatAllies.length; 
                    avgY /= combatAllies.length;
                    
                    // Move to a safe position behind the combat units
                    let dx = avgX - this.x, dy = avgY - this.y;
                    let dist = Math.hypot(dx, dy);
                    if (dist > this.healRange * 0.7) {
                        const desiredX = dx / dist; 
                        const desiredY = dy / dist;
                        this.velX += (desiredX * this.maxSpeed * 0.4 - this.velX) * this.turnSpeed;
                        this.velY += (desiredY * this.maxSpeed * 0.4 - this.velY) * this.turnSpeed;
                    }
                    this.x += this.velX; 
                    this.y += this.velY;
                }
            }
        }
    }

    updateCombatAI(enemies) {
        if (enemies.length === 0) return;
        let target = enemies.reduce((a, b) => this.distanceTo(a) < this.distanceTo(b) ? a : b);
        let dx = target.x - this.x, dy = target.y - this.y;
        let dist = Math.hypot(dx, dy);
        let desiredX = dx / dist, desiredY = dy / dist;
        let touchDistance = this.radius + target.radius + 1;
        
        if (dist > touchDistance) {
            let speed = this.maxSpeed;
            this.velX += (desiredX * speed - this.velX) * this.turnSpeed;
            this.velY += (desiredY * speed - this.velY) * this.turnSpeed;
            this.x += this.velX; 
            this.y += this.velY;
        } else { 
            this.velX *= 0.7; 
            this.velY *= 0.7; 
        }

        if (dist <= touchDistance && this.type !== 'healer') {
            let now = performance.now();
            if (now - this.lastAttack >= this.attackCooldown) {
                const damageMultiplier = getDirectionalDamageMultiplier(this, target);
                const actualDamage = Math.floor(this.attackPower * damageMultiplier);
                const isCritical = damageMultiplier > 1.5;
                target.health -= actualDamage; 
                this.lastAttack = now; 
                this.totalDamageDealt += actualDamage;
                if (actualDamage > gameState.highestSingleDamage) gameState.highestSingleDamage = actualDamage;
                gameState.damageTexts.push(new DamageText(target.x, target.y - target.radius - 8, actualDamage, false, isCritical));
                gameState.attackEffects.push(new AttackEffect(target.x + (Math.random() - 0.5) * 8, target.y + (Math.random() - 0.5) * 8, this.team, isCritical));
            }
        }
    }
}

// =============== GAME FUNCTIONS ===============
function getDirectionalDamageMultiplier(attacker, target) {
    const dx = target.x - attacker.x;
    const dy = target.y - attacker.y;
    const attackAngle = Math.atan2(dy, dx);
    const targetAngle = Math.atan2(target.velY, target.velX);
    
    let angleDiff = attackAngle - targetAngle;
    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
    
    const absAngleDiff = Math.abs(angleDiff);
    if (absAngleDiff < Math.PI / 6) return 1.0;
    else if (absAngleDiff > (5 * Math.PI) / 6) return 2.0;
    else return 1.25;
}

// =============== GAME LOOP ===============
function gameLoop() {
    // Clear and draw map
    drawMap();
    
    // Draw ghost unit for placement
    drawGhost();
    
    // Filter and update effects
    gameState.attackEffects = gameState.attackEffects.filter(effect => effect.draw());
    gameState.musketEffects = gameState.musketEffects.filter(effect => effect.update());
    gameState.musketEffects.forEach(effect => effect.draw());
    gameState.healingEffects = gameState.healingEffects.filter(effect => effect.update());
    gameState.healingEffects.forEach(effect => effect.draw());
    gameState.damageTexts = gameState.damageTexts.filter(text => text.update());
    gameState.damageTexts.forEach(text => text.draw());
    
    // Separate teams
    const redTeam = gameState.circles.filter(c => c.team === "red");
    const blueTeam = gameState.circles.filter(c => c.team === "blue");
    
    // Update and draw all circles
    for (let c of gameState.circles) {
        let allies = gameState.circles.filter(x => x.team === c.team && x.health > 0);
        let enemies = gameState.circles.filter(x => x.team !== c.team && x.health > 0);
        
        for (let i = 0; i < gameState.gameSpeed; i++) {
            c.updateAI(enemies, allies);
        }
        
        c.draw();
        
        // Track kills
        if (c.health <= 0 && c.lastHealth > 0) {
            gameState.totalKills++;
        }
        c.lastHealth = c.health;
    }
    
    // Remove dead units
    gameState.circles = gameState.circles.filter(c => c.health > 0);
    
    // Update UI stats
    const redAlive = gameState.circles.filter(c => c.team === "red" && c.health > 0);
    const blueAlive = gameState.circles.filter(c => c.team === "blue" && c.health > 0);
    
    redCountEl.textContent = redAlive.length;
    blueCountEl.textContent = blueAlive.length;
    totalCountEl.textContent = gameState.circles.length;
    
    // Update battle timer
    if (gameState.gameRunning) {
        gameState.battleDuration = Math.floor((performance.now() - gameState.battleStartTime) / 1000);
        battleTimeEl.textContent = gameState.battleDuration + 's';
        
        // Check for game over
        if (redAlive.length === 0 || blueAlive.length === 0) {
            gameState.gameRunning = false;
            const winner = redAlive.length > 0 ? 'red' : 'blue';
            
            // Update victory modal
            winnerTextEl.textContent = `${winner === 'red' ? '🔴 Red' : '🔵 Blue'} Team Victory!`;
            winnerTextEl.className = `winner-text ${winner === 'red' ? 'winner-red' : 'winner-blue'}`;
            finalTimeEl.textContent = gameState.battleDuration;
            remainingUnitsEl.textContent = winner === 'red' ? redAlive.length : blueAlive.length;
            totalKillsEl.textContent = gameState.totalKills;
            highestDamageEl.textContent = gameState.highestSingleDamage;
            
            // Show modal and play again button
            gameOverModal.style.display = 'flex';
            playAgainHeaderBtn.style.display = 'flex';
            
            showNotification(`${winner === 'red' ? 'Red' : 'Blue'} wins!`, 'info');
            updateStartPauseButton();
        }
    }
    
    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// =============== START GAME ===============
// Initialize game when page loads
window.addEventListener('DOMContentLoaded', initGame);
