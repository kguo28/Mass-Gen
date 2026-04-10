# Living Field Guide

This repository supports the Living Field Guide project, a platform for organizing change concept cards and implementation resources for healthcare teams. It separates platform logic from content so the system can scale more cleanly as the project grows.

## Folder Structure
- `platform/`: engine logic, rendering, workflow tools, and AI integration
- `content/`: change concept cards, schemas, and other content modules

## Running Locally
Local setup instructions will be added as the project evolves.

## Reflection

Separating platform from content matters because the system logic can evolve independently from the change concept cards and implementation materials. This makes the Living Field Guide easier to maintain, update, and expand without rewriting core functionality every time content changes.

One challenge in keeping these layers decoupled is that new features may tempt developers to hard-code assumptions about specific cards or workflows into the platform layer. As the project grows, maintaining clear interfaces and shared schemas will be important so content stays flexible while the platform remains reusable.
