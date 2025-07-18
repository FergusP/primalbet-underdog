# **DESIGN CHANGE PROTOCOL**
*How to Update Game Design & Keep Everyone Aligned*

## **🎯 Purpose**
This document serves as the definitive guide for making game design changes in Aurelius. Follow this protocol to ensure all changes are properly documented and communicated.

---

## **📋 Change Categories & Required Updates**

### **Category 1: GAMEPLAY MECHANICS**
Changes to core game rules, combat, movement, or game flow.

**Examples:**
- Damage values (5-8 → 10-15)
- Movement speed (2 → 3 squares/second)
- Attack range (1 → 2 cells)
- Game phase durations
- Power-up effects

**Required Updates:**
```yaml
PRIMARY:
  - AURELIUS_GAME_DESIGN.md:
    - Section 6: Game Mechanics
    - Section 6.3: Combat System
    - Section 6.4: Time Limit
    
SECONDARY:
  - INTERFACE_CONTRACT.md:
    - Phaser Game Constants
    - Related WebSocket events
    
NOTIFY: Partner A (affects server calculations)
```

### **Category 2: VISUAL & UI**
Changes to appearance, animations, or user interface.

**Examples:**
- Arena size (600px → 800px)
- Sprite designs
- HUD layout
- Animation timing
- Visual effects

**Required Updates:**
```yaml
PRIMARY:
  - AURELIUS_GAME_DESIGN.md:
    - Section 6.1: Arena Field
    - Section 8: User Interface
    
SECONDARY:
  - INTERFACE_CONTRACT.md:
    - ARENA_CONFIG constants
    - UI-related events (if any)
    
NOTIFY: Partner B (primary), Partner A (if affects game logic)
```

### **Category 3: ECONOMY & BLOCKCHAIN**
Changes to fees, rewards, or on-chain mechanics.

**Examples:**
- Entry fee (0.002 → 0.005 SOL)
- Prize distribution (95% → 90% to winner)
- Treasury fees
- Bonus multipliers

**Required Updates:**
```yaml
PRIMARY:
  - AURELIUS_GAME_DESIGN.md:
    - Section 5: Fund Management
    - Section 10: Monetization
    
CRITICAL:
  - INTERFACE_CONTRACT.md:
    - Account structures
    - Instruction parameters
    
NOTIFY: Partner A (critical - affects smart contracts)
```

### **Category 4: TECHNICAL ARCHITECTURE**
Changes to system communication or data structures.

**Examples:**
- New WebSocket events
- API endpoint changes
- Data structure modifications
- State management changes

**Required Updates:**
```yaml
CRITICAL:
  - INTERFACE_CONTRACT.md:
    - ALL relevant sections
    - Version bump required
    
SECONDARY:
  - AURELIUS_GAME_DESIGN.md:
    - Section 3: Technical Architecture
    - Section 11: ProofNetwork Integration
    
NOTIFY: Both partners immediately - requires coordination
```

### **Category 5: NEW FEATURES**
Adding entirely new gameplay elements or systems.

**Examples:**
- New power-up types
- Tournament mode
- Spectator betting
- Achievement system

**Required Updates:**
```yaml
ALL DOCUMENTS:
  - AURELIUS_GAME_DESIGN.md:
    - Add new sections
    - Update affected sections
    
  - INTERFACE_CONTRACT.md:
    - New events/data structures
    - Version bump
    
  - PROJECT_MANAGEMENT.md:
    - Add tasks for both partners
    - Update task counts
    
NOTIFY: Both partners - requires planning discussion
```

---

## **🔄 Step-by-Step Change Process**

### **Step 1: Identify Change Category**
Determine which category your change falls into using the guide above.

### **Step 2: Create Design Branch**
```bash
# Format: design/category-description
git checkout -b design/combat-damage-increase
git checkout -b design/new-powerup-freeze
git checkout -b design/ui-arena-resize
```

### **Step 3: Update Documents in Order**

**Order of Updates:**
1. **AURELIUS_GAME_DESIGN.md** - Update the vision first
2. **INTERFACE_CONTRACT.md** - Update technical specs (if needed)
3. **PROJECT_MANAGEMENT.md** - Add new tasks (if needed)
4. **DESIGN_CHANGE_LOG.md** - Log the change (create if doesn't exist)

### **Step 4: Validate Changes**

**Checklist:**
- [ ] All affected sections updated?
- [ ] Constants match between documents?
- [ ] Interface contract still valid?
- [ ] No breaking changes without version bump?
- [ ] Partner tasks clearly defined?

### **Step 5: Commit with Structured Message**

```bash
git commit -m "design: [CATEGORY] Brief description

Changes:
- What changed and why
- Old value → New value

Docs updated:
- GAME_DESIGN.md: sections X, Y
- INTERFACE_CONTRACT.md: constants Z

Affects:
- Partner A: combat calculations
- Partner B: damage display"
```

### **Step 6: Notify Partner**

Use this template:
```markdown
🎮 DESIGN CHANGE: [Category] - Title

**Summary:** Brief description of change

**Details:**
- Specific change 1: old → new
- Specific change 2: old → new

**Documents Updated:**
- [Link to GAME_DESIGN.md changes]
- [Link to INTERFACE_CONTRACT.md changes]

**Your Action Required:**
- Partner A: Update X in server code
- Partner B: Update Y in UI code

**Reason:** Why this change improves the game

**Branch:** `design/your-branch-name`
```

---

## **📊 Quick Decision Matrix**

| Question | Yes → | No → |
|----------|-------|------|
| Does it change how systems communicate? | Update INTERFACE_CONTRACT.md | Skip INTERFACE_CONTRACT.md |
| Does it affect game balance? | Update GAME_DESIGN.md Section 6 | Check if visual only |
| Does it change on-chain logic? | CRITICAL: Discuss with Partner A first | Proceed with updates |
| Does it add new features? | Update all 3 docs + discuss | Just update GAME_DESIGN.md |
| Does it only change visuals? | Update GAME_DESIGN.md only | Re-evaluate the change |

---

## **⚠️ Critical Rules**

### **RULE 1: Interface Contract is Sacred**
- ANY change to INTERFACE_CONTRACT.md requires both partners' approval
- Breaking changes require version increment
- Test with mocks before implementing

### **RULE 2: Communication is Key**
- Notify BEFORE implementing if it affects partner's code
- Notify AFTER implementing if it's information only
- When in doubt, over-communicate

### **RULE 3: Document Everything**
- Every change needs a commit message
- Major changes need a design doc
- Keep a DESIGN_CHANGE_LOG.md for history

---

## **🤖 AI Assistant Instructions**

When I mention a game design change:

1. **Ask clarifying questions:**
   - What specific values/mechanics are changing?
   - Why is this change being made?
   - Have you discussed with your partner?

2. **Identify the category** from this document

3. **List all documents** that need updating based on the category

4. **Provide the exact sections** to update in each document

5. **Generate the notification message** for the partner

6. **Suggest any potential impacts** not mentioned

7. **Remind about critical rules** if applicable

---

## **📝 Change Log Template**

Create a `DESIGN_CHANGE_LOG.md` to track all changes:

```markdown
# Design Change Log

## [Date] - Category: Change Title
- **Changed:** What was modified
- **Reason:** Why it was changed  
- **Docs Updated:** List of documents
- **Partner Impact:** What each partner needs to do
- **Commit:** Link to commit
```

---

## **🚀 Quick Reference Commands**

```bash
# When starting a design change
./scripts/design-change.sh [category] [description]

# Check what docs need updating
grep -r "old_value" *.md

# Validate interface contract
npm run validate:interface

# Notify partner (if using Discord webhook)
./scripts/notify-partner.sh "Change description"
```

---

*Remember: Good documentation prevents integration headaches!*