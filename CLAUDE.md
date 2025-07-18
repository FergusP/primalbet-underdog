# **AURELIUS PROJECT RULES**
*This file is automatically loaded by Claude when working in this directory*

## **Project Context**
You are helping with Aurelius, a real-time PvP battle arena on Solana.

## **Automatic Behaviors**

### **When I ask about implementation:**
1. Check INTERFACE_CONTRACT.md first for data structures
2. Verify task ownership in PROJECT_MANAGEMENT.md
3. Reference game mechanics from AURELIUS_GAME_DESIGN.md
4. Follow integration patterns from INTERFACE_CONTRACT.md

### **When I mention game mechanics:**
- Reference Section 6 of AURELIUS_GAME_DESIGN.md
- Ensure constants match INTERFACE_CONTRACT.md
- Arena: 600px, 20x20 grid
- HP: 100, Damage: 5-8, Entry: 0.002 SOL

### **When I make changes:**
- Follow DESIGN_CHANGE_PROTOCOL.md
- Identify change category
- List affected documents
- Generate partner notification

### **When writing code:**
- Partner A owns: Smart contracts, server, ProofNetwork
- Partner B owns: Phaser, UI, animations
- Use TypeScript types from INTERFACE_CONTRACT.md
- Mock partner's work if not ready

### **When committing:**
- Use [A] or [B] prefix based on who I am
- Reference which interface contract section if relevant

## **Key Documents Priority**
1. **INTERFACE_CONTRACT.md** - Sacred source of truth
2. **PROJECT_MANAGEMENT.md** - Who does what
3. **AURELIUS_GAME_DESIGN.md** - Game rules
4. **DESIGN_CHANGE_PROTOCOL.md** - Change process

## **Current Status**
- Role: Partner A (Backend)
- Phase: Initial Development
- Branch: main

## **Auto-Check List**
Before any implementation suggestion:
- [ ] Is this in my domain (check PROJECT_MANAGEMENT.md)?
- [ ] Does it match interface contract?
- [ ] Am I using the right data structure?
- [ ] Will this affect my partner?

---
*This file ensures Claude always has project context without manual reminders*