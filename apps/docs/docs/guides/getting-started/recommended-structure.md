---
title: Recommendations
---

This project is not really dependent to any structure, ypu are dell to use what suits better to your needs. However, we can help you with some ideas:

```bash
my-project
├── .lumineer
├── src
│   ├── services
│   │   ├── first
│   │   │   ├── first.service.ts
│   │   │   ├── first.model.ts
│   │   │   └── messages
│   │   │       ├── some.message.ts
│   │   │       └── other.message.ts
│   │   └── second
│   │       ├── first.service.ts
│   │       ├── first.model.ts
│   │       └── messages
│   │           ├── some.message.ts
│   │           └── other.message.ts
│   └── main.ts
├── package.json
├── README.md
├── lumineer.config.js
└── tsconfig.json
```

Here we can have one service implementation (and dependencies) per folder.

This is inspired in other libraries and frameworks, but anything prevents you to create your own.
