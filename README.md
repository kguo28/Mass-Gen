# Mass-Gen: Living Field Guide

The Living Field Guide is a platform for translating healthcare improvement knowledge into actionable, site-specific implementation guidance. It combines a structured library of Change Concept Cards with an AI-powered coaching layer that helps care teams adopt and adapt evidence-based practices. The system is designed to keep clinical content and platform logic cleanly separated so each can evolve independently.

## Folder Structure

- **`platform/`** — All engine logic for the Living Field Guide, including rendering, workflow orchestration, and AI integration (RAG retrieval, Claude API coaching).
- **`content/`** — Condition modules and Change Concept Cards. This is where the structured clinical and operational knowledge lives, formalized against a machine-readable schema.

## Running Locally

_Setup instructions coming soon._

## Reflection

**Why does separating platform from content matter for a system like the Living Field Guide?**

Separating platform from content means the engine that renders, retrieves, and reasons over knowledge can evolve independently from the clinical knowledge itself. Clinicians and subject-matter experts can author or revise Change Concept Cards without touching code, and engineers can improve the platform without risking the integrity of validated clinical content. It also makes the system easier to scale to new conditions: adding a new care area becomes a content task, not an engineering project.

**What challenges do you anticipate in keeping these layers decoupled as the project grows?**

The biggest risk is schema drift — as new card types or fields get added to support edge cases, the platform may start making assumptions about content structure that leak coupling back in. Versioning becomes tricky too: if the schema evolves, older cards need to either be migrated or supported in parallel. Finally, AI integration blurs the line, because prompt templates and retrieval logic sit awkwardly between "platform" and "content" and will need clear ownership rules.
