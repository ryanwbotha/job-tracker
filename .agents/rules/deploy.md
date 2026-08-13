---
name: deploy-command
description: When user asks to deploy, output the deployment command and full path.
trigger: always_on
---

When the user asks to deploy, DO NOT execute the deployment yourself. Instead, output the following command so the user can paste it into their terminal:

```bash
cd "/Users/ryanbotha/Job Search Activity Tracker" && npm run build && npx -y firebase-tools@latest deploy
```
