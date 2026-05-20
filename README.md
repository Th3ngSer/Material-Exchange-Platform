# ♻️ Material Exchange Platform (Full-Stack)

An enterprise-grade, full-stack marketplace application designed for users to trade, exchange, or recycle materials smoothly. This platform features robust user authentication, real-time item tracking, a modern user dashboard, and containerized deployment infrastructure.

## 🚀 Tech Stack

- **Backend:** NestJS (TypeScript), MongoDB via Mongoose, JWT Authentication, Multer for file uploads.
- **Frontend:** Vue 3 (Vite), Pinia (State Management), Tailwind CSS v4, Axios.
- **DevOps:** Docker, Docker Compose (Multi-container architecture with localized MongoDB Replica Sets).

---

## 🛠️ Key Features

- **Secure Authentication:** Complete registration and login system protected with JSON Web Tokens (JWT).
- **Material Marketplace:** Full CRUD implementation allowing users to create, view, edit, and delete item exchange listings.
- **Item Tracking Engine:** Specialized tracking schemas with automatic atomic counter generation to trace the history and status of exchanged materials.
- **Interactive Messaging:** Integrated service structures prepared for peer-to-peer user communications.
- **Dynamic Profile Management:** Interactive custom user dashboards with support for custom avatar image uploads and multi-faceted settings.

---

## 📦 Project Setup

### 1. Database & Infrastructure
Spin up the pre-configured local MongoDB environment using Docker:
```bash
cd backend
docker-compose -f docker-compose.mongo.yml up -d
