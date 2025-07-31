// Combat Scene Performance Patch
// This file contains minimal optimizations that can be applied to CombatScene
// without breaking existing functionality

export class CombatPerformancePatch {
  // Event throttling helper
  static createEventThrottler(emitInterval: number = 100) {
    let lastEmit = 0;
    let eventQueue: Map<string, any> = new Map();
    
    return {
      queue(eventName: string, detail: any) {
        eventQueue.set(eventName, detail);
      },
      
      flush(currentTime: number) {
        if (currentTime - lastEmit < emitInterval) return;
        
        eventQueue.forEach((detail, eventName) => {
          window.dispatchEvent(new CustomEvent(eventName, { detail }));
        });
        
        eventQueue.clear();
        lastEmit = currentTime;
      },
      
      forceFlush() {
        eventQueue.forEach((detail, eventName) => {
          window.dispatchEvent(new CustomEvent(eventName, { detail }));
        });
        eventQueue.clear();
      }
    };
  }
  
  // Distance caching helper
  static createDistanceCache(cacheTime: number = 50) {
    let cachedDistance = 0;
    let lastCalculation = 0;
    
    return {
      getDistance(currentTime: number, calculateFn: () => number): number {
        if (currentTime - lastCalculation > cacheTime) {
          cachedDistance = calculateFn();
          lastCalculation = currentTime;
        }
        return cachedDistance;
      }
    };
  }
  
  // State change detector
  static createStateTracker() {
    const previousState: any = {};
    
    return {
      hasChanged(key: string, value: any): boolean {
        if (previousState[key] !== value) {
          previousState[key] = value;
          return true;
        }
        return false;
      },
      
      hasPositionChanged(key: string, x: number, y: number, threshold: number = 2): boolean {
        const prev = previousState[key] || { x: 0, y: 0 };
        const changed = Math.abs(x - prev.x) > threshold || Math.abs(y - prev.y) > threshold;
        if (changed) {
          previousState[key] = { x, y };
        }
        return changed;
      }
    };
  }
}

// Example usage in CombatScene:
/*
// Add these to class properties:
private eventThrottler = CombatPerformancePatch.createEventThrottler();
private distanceCache = CombatPerformancePatch.createDistanceCache();
private stateTracker = CombatPerformancePatch.createStateTracker();

// In update method:
update(time: number, delta: number) {
  // ... existing code ...
  
  // Use cached distance
  const distance = this.distanceCache.getDistance(time, () => 
    Phaser.Math.Distance.Between(
      this.monster.x,
      this.monster.y,
      this.player.x,
      this.player.y
    )
  );
  
  // Throttle sprite position events
  if (this.stateTracker.hasPositionChanged('player', this.player.x, this.player.y) ||
      this.stateTracker.hasPositionChanged('monster', this.monster.x, this.monster.y)) {
    this.eventThrottler.queue('sprite-positions', { ... });
  }
  
  // Flush events periodically
  this.eventThrottler.flush(time);
}

// In methods that emit state:
emitGameState() {
  if (this.stateTracker.hasChanged('playerHealth', this.playerHealth) ||
      this.stateTracker.hasChanged('monsterHealth', this.monsterHealth) ||
      this.stateTracker.hasChanged('currentSpears', this.currentSpears)) {
    this.eventThrottler.queue('combat-state-update', { ... });
  }
}
*/