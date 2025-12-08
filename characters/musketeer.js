// characters/musketeer.js
class Musketeer {
    constructor(x, y, team, canvas, baseUnitSize, MUSKET_RANGE, BAYONET_RANGE) {
        this.x = x;
        this.y = y;
        this.team = team;
        this.type = 'musketeer';
        
        const sizeMultiplier = Math.min(canvas.width, canvas.height) / 800;
        
        // STATS
        this.radius = baseUnitSize * 0.9 * sizeMultiplier;
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
        
        // Common properties
        this.lastAttack = 0;
        this.velX = 0;
        this.velY = 0;
        this.id = Math.random().toString(36).substr(2, 9);
        this.facingAngle = team === 'blue' ? Math.PI : 0;
        this.lastHealth = this.health;
        this.totalDamageDealt = 0;
        this.kills = 0;
    }
    
    draw(ctx) {
        if (Math.abs(this.velX) > 0.1 || Math.abs(this.velY) > 0.1) {
            this.facingAngle = Math.atan2(this.velY, this.velX);
        }
        
        const gradient = ctx.createRadialGradient(
            this.x - 3, this.y - 3, 3, 
            this.x, this.y, this.radius
        );
        
        if (this.team === 'red') {
            gradient.addColorStop(0, '#ff9f80');
            gradient.addColorStop(1, '#d35400');
        } else {
            gradient.addColorStop(0, '#80bfff');
            gradient.addColorStop(1, '#1a5276');
        }
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw musket
        ctx.save();
        ctx.translate(this.x, this.y);
        
        if (this.team === 'blue') {
            ctx.rotate(this.facingAngle + Math.PI); // Faces LEFT
        } else {
            ctx.rotate(this.facingAngle); // Faces RIGHT
        }
        
        // Musket barrel
        let musketStart = this.team === 'blue' ? this.radius * 0.6 : -this.radius * 0.6;
        let musketEnd = this.team === 'blue' ? -this.radius * 0.8 : this.radius * 0.8;
        let barrelPos = this.team === 'blue' ? -this.radius * 0.8 : this.radius * 0.8;
        
        ctx.beginPath();
        ctx.moveTo(musketStart, 0);
        ctx.lineTo(musketEnd, 0);
        ctx.strokeStyle = this.isCharging ? '#2c3e50' : '#34495e';
        ctx.lineWidth = this.isCharging ? 4 : 3;
        ctx.stroke();
        
        if (this.isCharging) {
            ctx.beginPath();
            ctx.moveTo(barrelPos, 0);
            ctx.lineTo(barrelPos + (this.team === 'blue' ? -8 : 8), 0);
            ctx.strokeStyle = '#7f8c8d';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(barrelPos + (this.team === 'blue' ? -8 : 8), 0);
            ctx.lineTo(barrelPos + (this.team === 'blue' ? -4 : 4), -3);
            ctx.lineTo(barrelPos + (this.team === 'blue' ? -4 : 4), 3);
            ctx.closePath();
            ctx.fillStyle = '#bdc3c7';
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(barrelPos, 0, 3, 0, Math.PI * 2);
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
        
        // Health bar
        const barWidth = this.radius * 2;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 8, barWidth, 4);
        
        const healthPercent = this.health / this.maxHealth;
        let healthColor;
        if (healthPercent > 0.6) healthColor = '#2ecc71';
        else if (healthPercent > 0.3) healthColor = '#f39c12';
        else healthColor = '#e74c3c';
        
        ctx.fillStyle = healthColor;
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 8, barWidth * healthPercent, 4);
        
        // Reload indicator
        if (!this.isCharging) {
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
    
    applySeparation(alliesAndEnemies, mapPadding, canvas) {
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
        this.x = Math.max(mapPadding + this.radius, Math.min(canvas.width - mapPadding - this.radius, this.x));
        this.y = Math.max(mapPadding + this.radius, Math.min(canvas.height - mapPadding - this.radius, this.y));
    }
    
    updateAI(enemies, allies, gameRunning, getDirectionalDamageMultiplier, attackEffects, damageTexts, musketEffects, highestSingleDamage) {
        if (!gameRunning || enemies.length === 0) return;
        
        let closestEnemy = enemies.reduce((a, b) => this.distanceTo(a) < this.distanceTo(b) ? a : b);
        let distToEnemy = this.distanceTo(closestEnemy);
        
        if (distToEnemy < this.bayonetRange) {
            // Bayonet charge
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
                    if (actualDamage > highestSingleDamage.value) highestSingleDamage.value = actualDamage;
                    
                    damageTexts.push({
                        x: closestEnemy.x, y: closestEnemy.y - closestEnemy.radius - 8,
                        damage: actualDamage, isHeal: false, isCritical: isCritical
                    });
                    
                    attackEffects.push({
                        x: closestEnemy.x + (Math.random() - 0.5) * 8,
                        y: closestEnemy.y + (Math.random() - 0.5) * 8,
                        team: this.team,
                        isCritical: isCritical,
                        draw: function(ctx) {
                            ctx.beginPath();
                            ctx.arc(this.x, this.y, isCritical ? 6 : 4, 0, Math.PI * 2);
                            ctx.fillStyle = this.team === 'red' ?
                                (isCritical ? 'rgba(231, 76, 60, 0.8)' : 'rgba(192, 57, 43, 0.8)') :
                                (isCritical ? 'rgba(52, 152, 219, 0.8)' : 'rgba(41, 128, 185, 0.8)');
                            ctx.fill();
                            return true;
                        }
                    });
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
                // Shoot
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
                        if (actualDamage > highestSingleDamage.value) highestSingleDamage.value = actualDamage;
                        
                        damageTexts.push({
                            x: closestEnemy.x, y: closestEnemy.y - closestEnemy.radius - 8,
                            damage: actualDamage, isHeal: false, isCritical: isCritical
                        });
                        
                        attackEffects.push({
                            x: closestEnemy.x + (Math.random() - 0.5) * 8,
                            y: closestEnemy.y + (Math.random() - 0.5) * 8,
                            team: this.team,
                            isCritical: isCritical,
                            draw: function(ctx) {
                                ctx.beginPath();
                                ctx.arc(this.x, this.y, isCritical ? 6 : 4, 0, Math.PI * 2);
                                ctx.fillStyle = this.team === 'red' ?
                                    (isCritical ? 'rgba(231, 76, 60, 0.8)' : 'rgba(192, 57, 43, 0.8)') :
                                    (isCritical ? 'rgba(52, 152, 219, 0.8)' : 'rgba(41, 128, 185, 0.8)');
                                ctx.fill();
                                return true;
                            }
                        });
                    } else {
                        damageTexts.push({
                            x: closestEnemy.x, y: closestEnemy.y - closestEnemy.radius - 8,
                            damage: 0, isHeal: false, isCritical: false, isMiss: true
                        });
                    }
                    
                    musketEffects.push({
                        startX: this.x, startY: this.y,
                        targetX: closestEnemy.x, targetY: closestEnemy.y,
                        hit: !miss,
                        progress: 0, speed: 0.12, life: 1.0,
                        color: !miss ? '#f39c12' : '#95a5a6'
                    });
                    
                    this.lastShot = now;
                }
            } else {
                // Move closer
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
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Musketeer;
}
