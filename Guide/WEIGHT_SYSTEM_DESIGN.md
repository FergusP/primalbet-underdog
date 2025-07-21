# **AURELIUS WEIGHT SYSTEM DESIGN**
*Fair and Fun Input-Driven Competition*

## **🎯 Core Philosophy**

The weight system is the heart of Aurelius - it determines who wins based on **strategic decision quality**, not reflexes or luck. Every input from players affects their final weight, which determines their probability of winning via VRF selection.

## **⚖️ Weight Calculation Formula**

```typescript
FINAL_WEIGHT = (BASE_WEIGHT + ENTRY_BONUS + INPUT_BONUSES) × MULTIPLIERS × LUCK_FACTOR

Where:
- BASE_WEIGHT = 1000 (everyone starts equal)
- ENTRY_BONUS = 50-300 (early bird advantage)
- INPUT_BONUSES = Sum of all strategic action bonuses
- MULTIPLIERS = Power-up and combo multipliers (1.0x - 3.0x)
- LUCK_FACTOR = 0.85x - 1.15x (prevents deterministic outcomes)
```

## **📊 Entry Timing System**

Entry timing creates strategic tension - join early for bonus weight vs waiting to see others' strategies.

```typescript
Entry Timing Bonuses:
- First 10 seconds: +300 weight ("Early Bird Supreme")
- 10-30 seconds: +200 weight ("Early Adopter")
- 30-60 seconds: +150 weight ("Strategic Entry")
- 60-75 seconds: +100 weight ("Standard Entry")
- 75-85 seconds: +50 weight ("Late Entry Penalty")
- 85-90 seconds: +0 weight ("Desperation Entry")

Visual Feedback:
- Show "Early Bird Bonus: +300!" when joining early
- Display countdown timer with bonus amounts
- Color-code bonuses: Gold (300), Silver (200), Bronze (150)
```

## **💎 Power-Up Weight System**

Each power-up purchase affects weight calculation differently based on timing and context.

### **Power-Up Base Effects**
```typescript
MOMENTUM_BOOST: {
  cost: 0.001 SOL,
  baseWeight: +100,
  perfectTiming: +50 bonus (during alliance formation),
  cooldown: 15 seconds,
  stackable: Yes (max 3)
}

RAGE_MODE: {
  cost: 0.002 SOL,
  baseMultiplier: 1.5x,
  perfectTiming: 2.0x (when betraying alliance),
  duration: 20 seconds,
  stackable: No
}

TACTICAL_EDGE: {
  cost: 0.0015 SOL,
  baseMultiplier: 1.3x,
  perfectTiming: 1.6x (during input combinations),
  duration: 15 seconds,
  stackable: Yes (effects compound)
}

GUARDIAN_SHIELD: {
  cost: 0.003 SOL,
  baseWeight: +150,
  specialEffect: "Betrayal immunity (no -100 penalty)",
  duration: One-time protection,
  stackable: No
}
```

### **Perfect Timing System**
Players get bonus weight for using power-ups at optimal moments:

```typescript
Perfect Timing Windows:
- MOMENTUM during alliance formation: +50% bonus weight
- RAGE before betrayal action: +33% multiplier bonus
- TACTICAL during input combinations: +30% efficiency bonus
- SHIELD when alliance target: +50% protection bonus

UI Indicators:
- Golden glow around power-up when perfect timing available
- "PERFECT TIMING!" notification on successful usage
- Timing bar showing optimal windows
```

## **🤝 Alliance & Betrayal System**

Social dynamics add depth and create dramatic moments.

### **Alliance Mechanics**
```typescript
Alliance Formation:
- Requires mutual agreement (both players press "Form Alliance")
- Instant weight bonus: +75 for both players
- Duration: Until one player betrays or game ends
- Visual: Golden link between allied players
- Max alliances per player: 2

Alliance Benefits:
- Shared power-up effects (20% of partner's bonuses)
- Protection from certain negative events
- Combo multiplier when purchasing power-ups together
```

### **Betrayal Mechanics**
```typescript
Betrayal System:
- Can betray alliance at any time after 30 seconds
- Betrayer gets: +50 weight bonus (risk reward)
- Betrayed gets: +100 weight compensation (victim protection)
- Cooldown: 45 seconds before forming new alliance
- Risk: If betrayal fails (rare event), -150 penalty

Betrayal Success Rates:
- Standard betrayal: 85% success rate
- With RAGE active: 95% success rate
- Against SHIELD protected: 0% success rate
- Victim has warning (5 second window to counter)
```

## **⚡ Combo & Synergy System**

Chaining actions creates exponential weight benefits.

### **Power-Up Combinations**
```typescript
2-Power Combos (1.5x bonus):
- "Momentum Rage": MOMENTUM + RAGE = 2.5x multiplier instead of 1.5x
- "Tactical Shield": TACTICAL + SHIELD = 1.8x + immunity
- "Shield Momentum": SHIELD + MOMENTUM = +250 weight + protection

3-Power Combos (2.0x bonus):
- "Triple Threat": MOMENTUM + RAGE + TACTICAL = 3.0x multiplier
- "Perfect Defense": MOMENTUM + SHIELD + TACTICAL = 2.5x + immunity

Legendary Combo (4-Power):
- "Ascension": All 4 power-ups = 4.0x multiplier + perfect timing on everything
```

### **Action Timing Combos**
```typescript
Sequential Input Bonuses:
- Alliance → Momentum: +25% weight bonus
- Momentum → Rage: +30% multiplier bonus
- Shield → Betrayal Attempt: +50% betrayal success rate
- Early Entry → Power-up Purchase: +20% efficiency

Timing Windows:
- Actions must occur within 10 seconds of each other
- Visual combo counter shows progress
- "COMBO!" notification on successful chains
```

## **🎲 Dynamic Weight Events**

Random events keep games unpredictable and exciting.

### **Underdog Mechanics**
```typescript
Underdog Protection:
- If player weight < 50% of average: +100% weight multiplier
- If player weight < 25% of average: +200% weight multiplier
- Visual: "UNDERDOG POWER!" aura effect
- Prevents runaway leaders from guaranteed wins
```

### **Chaos Events (5% chance per game)**
```typescript
"The Great Equalizer":
- All players reset to base 1000 weight
- Entry bonuses preserved
- Power-up effects reset
- Creates comeback opportunities

"Weight Surge":
- Random player gets +500 weight bonus
- Higher chance for players with <1500 weight
- Creates dramatic upsets

"Alliance Frenzy":
- All alliance bonuses doubled for 30 seconds
- Encourages cooperation
- Social gameplay emphasis
```

## **📈 Economic Weight Factors**

Spending SOL affects weight but creates risk/reward decisions.

### **Investment Scaling**
```typescript
Total SOL Spent Weight Bonuses:
- 0.001-0.003 SOL: +50 weight ("Cautious Investor")
- 0.004-0.007 SOL: +100 weight ("Strategic Spender")  
- 0.008-0.012 SOL: +200 weight ("High Roller")
- 0.013+ SOL: +300 weight ("All-In Gambler")

Risk Management:
- More spending = higher weight but bigger loss if losing
- Creates natural player-driven balance
- Encourages calculated risks
```

### **Market Dynamics**
```typescript
Power-Up Price Scaling:
- Base prices increase 10% each purchase in same game
- Creates urgency and strategic timing decisions
- Late purchasers pay premium but get "desperate bonus" (+25% effectiveness)

Prize Pool Impact:
- 90% of power-up purchases go to prize pool
- Higher spending = bigger reward for winner
- Creates positive feedback loop
```

## **🏆 Winner Selection Algorithm**

```typescript
VRF Weight Distribution:
1. Calculate final weight for each player
2. Create weight ranges (Player A: 0-2000, Player B: 2001-5500, etc.)
3. VRF selects random number in total range
4. Winner = player whose range contains the selected number

Example Game:
- Player A: 2000 weight (33% chance)
- Player B: 3500 weight (58% chance)  
- Player C: 500 weight (8% chance)
- Total: 6000 weight
- VRF picks: 4721 → Player B wins!

Transparency:
- Show all player weights after game ends
- Display VRF number and proof
- Players can verify fairness independently
```

## **🎮 Player Psychology & Engagement**

### **Skill vs Luck Balance**
```typescript
Weight Distribution:
- Player Strategy: 70% of outcome (good decisions matter)
- Timing & Efficiency: 20% of outcome (execution quality)  
- Random Luck Factor: 10% of outcome (keeps it exciting)

This ensures:
- Skilled players win more often (long-term advantage)
- Casual players can still win (short-term hope)
- No guaranteed outcomes (maintains tension)
```

### **Feedback Systems**
```typescript
Real-Time Weight Display:
- Show relative advantage: "Your Odds: 65%" 
- Weight change notifications: "+100 MOMENTUM BONUS!"
- Probability updates: "Odds increased to 72%!"
- Never show exact weights (maintains mystery)

Post-Game Analysis:
- Full weight breakdown with explanations
- "What if" scenarios showing missed opportunities
- Strategy tips for next game
- Leaderboard with weight efficiency stats
```

## **⚡ Implementation Example**

```typescript
// Weight calculation system
export class WeightCalculator {
  calculateFinalWeight(player: Player, game: Game): number {
    let weight = BASE_WEIGHT; // 1000
    
    // Entry timing bonus
    weight += this.calculateEntryBonus(player.joinTime, game.startTime);
    
    // Power-up bonuses
    for (const powerup of player.powerupHistory) {
      const bonus = this.calculatePowerupWeight(powerup, player, game);
      weight += bonus.baseWeight;
      weight *= bonus.multiplier;
    }
    
    // Alliance bonuses
    weight += this.calculateAllianceWeight(player.alliances);
    
    // Betrayal effects
    weight += this.calculateBetrayalWeight(player.betrayals, player.betrayed);
    
    // Combo bonuses
    weight *= this.calculateComboMultipliers(player.actionHistory);
    
    // Underdog protection
    if (this.isUnderdog(player, game)) {
      weight *= this.getUnderdogMultiplier(player, game);
    }
    
    // Luck factor (0.85x - 1.15x)
    weight *= (0.85 + Math.random() * 0.3);
    
    return Math.max(100, Math.floor(weight)); // Minimum 100 weight
  }
}
```

## **🎯 Balancing Principles**

1. **Early Entry Advantage**: Balanced by information disadvantage
2. **Spending Power**: Higher risk for higher reward
3. **Social Dynamics**: Cooperation vs competition tension
4. **Timing Mastery**: Skill-based execution rewards
5. **Comeback Mechanics**: Underdog protection prevents runaway games
6. **Controlled Randomness**: Enough luck to stay exciting, enough skill to reward good play

This weight system creates a game that's easy to understand but deep in strategy, fair in competition but exciting in outcome, and rewarding for both casual and serious players.