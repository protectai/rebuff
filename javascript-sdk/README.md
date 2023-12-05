<!-- markdownlint-configure-file {
  "MD013": {
    "code_blocks": false,
    "tables": false
  },
  "MD033": false,
  "MD041": false
} -->

<div align="center">

## Rebuff.ai

  <img width="250" src="https://imgur.com/ishzqSK.png" alt="Rebuff Logo">

### **Self-hardening prompt injection detector**

Rebuff is designed to protect AI applications from prompt injection (PI) attacks through a [multi-layered defense](#features).

[Playground](https://playground.rebuff.ai/) •
[Discord](https://discord.gg/R3U2XVNKeE) •
[Features](#features) •
[Installation](#installation) •
[Getting started](#getting-started) •
[Docs](https://docs.rebuff.ai)

</div>
<div align="center">

</div>

## Disclaimer

Rebuff is still a prototype and **cannot provide 100% protection** against prompt injection attacks!

## Features

Rebuff offers 4 layers of defense:

- Heuristics: Filter out potentially malicious input before it reaches the LLM.
- LLM-based detection: Use a dedicated LLM to analyze incoming prompts and identify potential attacks.
- VectorDB: Store embeddings of previous attacks in a vector database to recognize and prevent similar attacks in the future.
- Canary tokens: Add canary tokens to prompts to detect leakages, allowing the framework to store embeddings about the incoming prompt in the vector database and prevent future attacks.

## Roadmap

- [x] Prompt Injection Detection
- [x] Canary Word Leak Detection
- [x] Attack Signature Learning
- [x] JavaScript/TypeScript SDK
- [ ] Python SDK to have parity with TS SDK
- [ ] Local-only mode
- [ ] User Defined Detection Strategies
- [ ] Heuristics for adversarial suffixes

## Installation

```bash
npm i rebuff
```

## Getting started

Importing the Rebuff SDK:

```typescript
import { RebuffSdk } from "rebuff";
```

Importing the Rebuff API interface:

```typescript
import { RebuffApi } from "rebuff";
```

🚧🚧🚧 More Coming Soon 🚧🚧🚧
