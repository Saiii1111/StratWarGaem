// characters/cavalry.js
class Cavalry {
    constructor(x, y, team, canvas, baseUnitSize) {
        this.x = x;
        this.y = y;
        this.team = team;
        this.type = 'cavalry';
        
        const sizeMultiplier = Math.min(canvas.width, canvas.height) / 800;
        
        // STATS
        this.radius = baseUnitSize * 1.1 * sizeMultiplier;
        this.health = 120;
        this.maxHealth = 120;
        this.attackPower = 16;
        this.attackCooldown = 500;
        this.maxSpeed = 2.8 * sizeMultiplier;
        this.turnSpeed = 0.08;
        this.baseSpeed = 1.2 * sizeMultiplier;
        this.currentSpeed = this.baseSpeed;
        
        // Charge properties
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
            gradient.addColorStop(0, '#e74c3c');
            gradient.addColorStop(1, '#c0392b');
        } else {
            gradient.addColorStop(0, '#3498db');
            gradient.addColorStop(1, '#1a5276');
        }
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw cavalry with horse
        ctx.save();
        ctx.translate(this.x, this.y);
        
        if (this.team === 'blue') {
            ctx.rotate(this.facingAngle + Math.PI); // Faces LEFT
        } else {
            ctx.rotate(this.facingAngle); // Faces RIGHT
        }
        
        // Horse body
        let bodyWidth = this.radius * 1.2;
        let bodyHeight = this.radius * 0.8;
        let headX = this.team === 'blue' ? -bodyWidth : bodyWidth;
        
        ctx.beginPath();
        ctx.ellipse(0, 0, bodyWidth, bodyHeight, 0, 0, Math.PI * 2);
        ctx.fillStyle = this.team === 'red' ? '#e74c3c' : '#3498db';
        ctx.fill();
        
        // Horse head
        ctx.beginPath();
        ctx.arc(headX, 0, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = this.team === 'red' ? '#c0392b' : '#2980b9';
        ctx.fill();
        
        // Charge effects
        if (this.isCharging) {
            // Dust trail
            let dustX = this.team === 'blue' ? bodyWidth : -bodyWidth;
            for (let i = 0; i < 3; i++) {
                let dustOffset = this.team === 'blue' ? bodyWidth + i * 5 : -bodyWidth - i * 5;
                ctx.beginPath();
                ctx.arc(dustOffset, 0, this.radius * 0.3 * (1 - i * 0.3), 0, Math.PI * 2);
                ctx.fillStyle = `rgba(149, 165, 166, ${0.7 - i * 0.2})`;
                ctx.fill();
            }
            
            // Speed lines
            ctx.strokeStyle = `rgba(255, 255, 255, 0.6)`;
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                let startX = this.team === 'blue' ? bodyWidth + i * 8 : -bodyWidth - i * 8;
                let endX = this.team === 'blue' ? bodyWidth * 1.5 + i * 15 : -bodyWidth * 1.5 - i * 15;
                
                ctx.beginPath();
                ctx.moveTo(startX, -this.radius * 0.5);
                ctx.lineTo(endX, -this.radius * 0.5 - i * 2);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(startX, this.radius * 0.5);
                ctx.lineTo(endX, this.radius * 0.5 + i * 2);
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
        
        // Charge cooldown indicator
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
    
    updateAI(enemies, allies, gameRunning, getDirectionalDamageMultiplier, attackEffects, damageTexts, highestSingleDamage) {
        if (!gameRunning || enemies.length === 0) return;
        
        let closestEnemy = enemies.reduce((a, b) => this.distanceTo(a) < this.distanceTo(b) ? a : b);
        let distToEnemy = this.distanceTo(closestEnemy);
        let now = performance.now();
        
        const speed = Math.hypot(this.velX, this.velY);
        this.currentVelocity = speed;
        const canCharge = (now - this.lastCharge >= this.chargeCooldown) && (distToEnemy >= this.minChargeDistance);
        
        // Charge logic
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
                        if (finalDamage > highestSingleDamage.value) highestSingleDamage.value = finalDamage;
                        
                        damageTexts.push({
                            x: closestEnemy.x, y: closestEnemy.y - closestEnemy.radius - 8,
                            damage: finalDamage, isHeal: false, isCritical: isCritical || !this.hasUsedFirstCharge
                        });
                        
                        attackEffects.push({
                            x: closestEnemy.x, y: closestEnemy.y,
                            team: this.team,
                            isCritical: true,
                            draw: function(ctx) {
                                ctx.beginPath();
                                ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
                                ctx.fillStyle = this.team === 'red' ? 'rgba(231, 76, 60, 0.8)' : 'rgba(52, 152, 219, 0.8)';
                                ctx.fill();
                                return true;
                            }
                        });
                        
                        if (!this.hasUsedFirstCharge) this.hasUsedFirstCharge = true;
                        this.isCharging = false;
                        this.chargeBoost = 0;
                        this.chargeTarget = null;
                    }
                }
            }
            return;
        }
        
        // Normal movement and attack
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
        
        if (dist <= touchDistance) {
            let now = performance.now();
            if (now - this.lastAttack >= this.attackCooldown) {
                const damageMultiplier = getDirectionalDamageMultiplier(this, closestEnemy);
                const actualDamage = Math.floor(this.attackPower * damageMultiplier);
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
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Cavalry;
}
