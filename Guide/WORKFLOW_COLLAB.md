# **AURELIUS DUAL-PLATFORM COLLABORATION WORKFLOW**
*Vibecoding for Web + Mobile Development*

## **🔄 Collaboration Workflow**

1. Initial Setup (Both Partners)

1. Fork/clone the repository
1. Create your feature branches:
   - Partner A: `feat/backend-foundation`
   - Partner B: `feat/web-foundation` + `feat/mobile-foundation`
1. Set up your local development environment
1. Review INTERFACE_CONTRACT.md together

1. Development Workflow

Partner A Workflow

Morning:

1. Pull latest from main
2. Check Discord/Telegram for updates
3. Work on current task (e.g., smart contracts)
4. Commit with prefix: [A] feat: Description

When reaching integration point:

1. Push to your branch
2. Message Partner B: "WebSocket events ready for testing"
3. Share endpoint/connection details
4. Continue with next independent task

End of day:

1. Push all commits
2. Update partner on:
   - What's ready to integrate
   - Any blockers
   - What you'll work on next

Partner B Workflow

Morning:

1. Pull latest from main
2. Check for Partner A updates
3. Sync shared code: `npm run sync:shared`
4. Work on platform tasks (web/mobile)
5. Commit with prefix: 
   - [B-Web] for web-specific
   - [B-Mobile] for mobile-specific
   - [B-Shared] for shared logic

When needing backend:

1. Use mock data based on INTERFACE_CONTRACT.md
2. Message Partner A: "Ready to test warrior spawn"
3. Continue with visual/UI tasks

End of day:

1. Push all commits
2. Share screenshots/videos of progress
3. List any integration needs

4. Integration Points & Checkpoints

graph LR
A[Partner A Task] -->|Ready| I[Integration Point]
B[Partner B Task] -->|Ready| I
I --> T[Test Together]
T --> M[Merge to Main]

Key Integration Points:

1. Wallet Connection - A provides endpoints, B connects UI
2. Game Entry - A handles transaction, B shows feedback
3. WebSocket Events - A sends events, B updates visuals
4. Combat System - A calculates damage, B shows animations
5. Game End - A determines winner, B displays results

6. Daily Sync Pattern

Async Updates (Recommended)
🌅 Partner A - 10:00 AM
✅ Completed: Smart contract entry logic
🚧 Working on: WebSocket server setup
❓ Need: Warrior spawn position format
🔗 Branch: feat/backend-foundation

🌅 Partner B - 10:30 AM
✅ Completed: Arena scene layout
🚧 Working on: Warrior sprites
💡 Position format: {x: 0-19, y: 0-19}
🔗 Branch: feat/frontend-foundation

5. Parallel Development Strategy

Partner A Can Work Independently On:

- Smart contract logic
- ProofNetwork integration
- Server infrastructure
- Database schemas
- API endpoints

Partner B Can Work Independently On:

**Web Platform:**
- Phaser game scenes
- Desktop UI components
- Keyboard controls
- Browser optimizations

**Mobile Platform:**
- React Native Skia rendering
- Touch controls
- Mobile UI adaptation
- Battery optimization

**Both Platforms:**
- Visual assets (different resolutions)
- Sound effects
- Shared game logic

Use Platform-Specific Mocks:

```typescript
// shared/mockData.ts
export const mockGameState = {
  warriors: [
    { id: '1', position: {x: 5, y: 5}, hp: 100 },
    { id: '2', position: {x: 15, y: 15}, hp: 80 }
  ],
  phase: 'battle'
};

// web/lib/mockSocket.ts
import { mockGameState } from './shared/mockData';
export const mockSocket = {
  on: (event, callback) => {
    setTimeout(() => callback(mockGameState), 16); // 60 FPS
  }
};

// mobile/lib/mockSocket.ts
import { mockGameState } from './shared/mockData';
export const mockSocket = {
  on: (event, callback) => {
    setTimeout(() => callback(mockGameState), 100); // 10 FPS
  }
};
```

6. Git Workflow

# Daily workflow

git checkout main
git pull origin main
git checkout your-feature-branch
git merge main # Stay updated

# When ready to share

git push origin your-feature-branch

# Create PR when integration ready

# Title: [A/B] Feature: Description

# Body:

# - What this adds

# - Integration notes

# - Testing steps

7. Testing Protocol

Before Integration:

- A: Test contracts with scripts
- B: Test UI with mock data

During Integration:

1. Set up screen share
2. A runs backend locally
3. B connects frontend
4. Test together
5. Document any issues

After Integration:

- Run full gameplay test
- Check all edge cases
- Verify on testnet

8. Conflict Resolution

If Interface Needs Change:

1. STOP coding
2. Discuss in call/chat
3. Update INTERFACE_CONTRACT.md
4. Both approve changes
5. Update code to match

If Blocked:
Partner A blocked on UI feedback?
→ Create CLI test version
→ Move to next backend task

Partner B blocked on API?
→ Use detailed mocks
→ Focus on polish/animations

9. Communication Templates

Integration Ready:
🟢 READY: WebSocket combat events

- Endpoint: ws://localhost:3001
- Events: combatEvent, warriorDamaged
- Test with: npm run test:combat
- See INTERFACE_CONTRACT.md line 120

Need Help:
🟡 HELP: Power-up collection logic

- What I tried: [explanation]
- Error/Issue: [description]
- Blocking: Can't test warrior buffs
- Suggestion: [your idea]

Daily EOD Update:
📊 EOD Update [Date]
✅ Done:

- Smart contract join logic
- Entry fee validation

🚧 Tomorrow:

- WebSocket server setup
- Game state management

🎯 Ready to integrate:

- Wallet connection flow

10. Success Metrics

Track daily:

- Tasks completed (per platform)
- Shared code synced
- Platform integration tested
- Cross-platform compatibility
- Code merged to main

Weekly:

- Full gameplay test
- Performance check
- Code review session
- Plan next features

## **📱 Platform-Specific Workflow**

### **Shared Code Workflow**
```bash
# When updating shared logic
1. cd shared && make changes
2. npm test # Test shared logic
3. npm run sync:shared # Copy to both platforms
4. cd web && npm test # Test web
5. cd mobile && npm test # Test mobile
6. git commit -m "[B-Shared] feat: Update battle logic"
```

### **Platform Testing Matrix**
| Task | Web | Mobile | Server |
|------|-----|---------|--------|
| Wallet Connect | Phantom | Solflare Mobile | ✓ |
| Game Render | 60 FPS | 30 FPS | N/A |
| Controls | Keyboard | Touch | ✓ |
| Network | Stable | Reconnect | ✓ |

### **Daily Platform Sync**
```
🌅 Platform Status - [Date]
✅ Web: Arena rendering at 60 FPS
✅ Mobile: Touch controls working
🔄 Shared: Battle logic v1.2 synced
⚠️ Issue: Mobile wallet connection
🎯 Next: Test cross-platform play
```

---

*This workflow ensures smooth development across both platforms while maintaining code quality and synchronization!*
