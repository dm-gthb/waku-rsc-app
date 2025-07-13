# waku-rsc-app

waku-rsc-app is a full-stack web application for managing projects, built with [Waku](https://github.com/wakujs/waku) – the minimal React framework.

**Demo**: [https://waku-project.dmbx.workers.dev/](https://waku-project.dmbx.workers.dev/)

## Motivation

This project was created to explore:

- The potential of React Server Components in a full-stack context
- Waku’s minimal API for building apps without heavy tooling
- The capabilities of Waku using only React — external state management libraries were avoided

## Tech

- Waku
- React
- Cloudflare D1
- Cloudflare Workers
- Drizzle
- Zod
- Tailwind CSS

## Features

- Create, update, and delete projects, tasks, and subtasks
- Optimistic UI updates
- Nested data management
- Modern form workflows using React 19 features
- Custom email/password authentication with session cookies

## How to explore the app

You can either sign up for a new account or use the demo credentials below to quickly explore the app without creating an account:

- **Email**: `demo@example.com`
- **Password**: `demo123`

The demo user can browse pre-created projects and tasks, and mark tasks as complete or incomplete. Other actions such as creating, editing, or deleting items are restricted to keep the demo clean.
