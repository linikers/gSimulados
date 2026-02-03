# Projeto: gSimulados

Plataforma avançada de simulados para vestibulares, focada em automação via IA e gestão acadêmica.

## Visão Geral

O `gSimulados` é um ecossistema projetado para facilitar a ingestão de questões de vestibulares (via PDFs no Google Drive) e a geração de simulados personalizados para alunos, utilizando modelos de IA de última geração (Google Gemini).

## Stack Tecnológica

- **Monorepo**: Yarn Workspaces
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Frontend**: React, Vite, Material-UI (MUI v5)
- **IA**: Google Gemini 1.5 Flash (via Gemini Vision Service)
- **Infraestrutura**: Fly.io (Backend), Vercel (Frontend)

## Arquitetura

- `apps/api`: Servidor REST API.
- `apps/web`: Aplicação Single Page (SPA).
- `packages/shared`: Tipos TypeScript e utilitários comuns.
- `docs/`: Documentação técnica e guias.
