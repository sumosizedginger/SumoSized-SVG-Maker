---
name: Bug Report (2026 Engine Core)
about: Create a strict matrix replication bug or UI unhandled exception.
title: "[BUG] "
labels: bug, triage
assignees: sumosizedginger
---

## Description
*A concise summary of the bug.*

## Parameter Matrix (Critical for Debugging)
*Because the SVG engine is 100% deterministic, you MUST include the generation payload causing the breakage.*
```javascript
{
  generatorId: "quantum-core", // E.g., sacred-geometry
  seed: 424242,
  params: {
    // ... paste the exact JSON parameter block here
  }
}
```

## Reproduction Steps
1. Navigate to '...'
2. Set parameter '...' to '...'
3. Render is corrupted/UI crashes.

## Expected Vector Output
*What should the mathematical matrix have resolved to natively?*

## Environment
- **Browser/Node**: [e.g. Chrome 140 / Node v20.5.0]
- **OS**: [e.g. Windows 11]

## Additional Context
*Any CLI errors or browser JS exceptions generated in the console.*
