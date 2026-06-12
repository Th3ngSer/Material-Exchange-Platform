# Material Xchange Platform 🔄

A secure, full-stack, cloud-native peer-to-peer (P2P) campus utility marketplace built for university students to exchange, lend, borrow, or sell educational materials and equipment safely within the campus community.

🌐 **Live Frontend Application:** [https://material-exchange-platform.pages.dev/](https://material-exchange-platform.pages.dev/)  
💻 **Live Backend Gateway REST API:** [https://material-exchange-platform.onrender.com/](https://material-exchange-platform.onrender.com/)

---

## 🏗️ System Architecture Overview

The system utilizes a fully decoupled, hybrid network cloud architecture designed to isolate responsibilities, optimize data routing, and guarantee real-time synchronization.

* **Frontend Client Layer (Cloudflare Pages):** Built as a reactive Single Page Application (SPA) utilizing **Vue 3 (Composition API), Vite, TypeScript, Pinia**, and **Tailwind CSS**. Compiles into static data chunks delivered globally at edge speeds.
* **Application & Gateways Core (Render):** An enterprise-grade REST API and real-time Event-Driven server engineered with **NestJS** and **TypeScript**. Manages business rules, cryptographic route guard walls, and bidirectional server sockets.
* **Distributed Storage Engine (MongoDB Atlas & Cloudinary):**
    * **MongoDB Atlas:** Distributed, document-oriented datastore housing optimized models for users, posts, and real-time interactions.
    * **Cloudinary CDN API:** External object blob-storage pipeline that ingests, optimizes, and serves binary media streams (item images), rendering the core application servers completely **ephemeral and lightweight**.

---

## 🛠️ Key Technical Features & Implementations

### 1. Cryptographic Identity & Access Management (IAM)
* **Stateless Token-Based Authentication:** Implemented a secure registration and login pipeline using **JSON Web Tokens (JWT)**.
* **HTTP Request Interception:** Frontend clients capture issued cryptographic signatures and securely inject them inside outbound HTTP requests using custom `Authorization: Bearer <token>` headers to guarantee stateless request validation.

### 2. Administrative Engine & Role-Based Access Control (RBAC)
* **Administrative Firewall System:** Outfitted with robust backend route interceptors (`JwtAuthGuard` and `AdminGuard`) that screen incoming socket traffic and API payloads down to the byte. Unauthorized actions trigger instantaneous `403 Forbidden` exceptions before accessing the persistence database layer.
* **Accountability Audit Trail:** Backed by an automated `ActivityLogService` tracking high-privilege operations (deleting posts, restricting malicious user spaces) inside an immutable log schema.

### 3. Peer-to-Peer (P2P) Transaction State Machine
* **Strict Structural Lifecycle Enforcer:** Built out a transaction routing core that forces item lifecycle fields through explicit sequential states: `PENDING` $\rightarrow$ `ACCEPTED` $\rightarrow$ `COMPLETED` or `CANCELLED`.
* **Lending Two-Way Pipeline:** Extended tracking features to handle asset turn-ins via specialized asynchronous handlers (`confirmHandover` and `confirmReturn`) with built-in rollback support to maintain total system atomicity.

### 4. Hybrid Real-Time Event Bus Networking
* **Dual Communication Architecture:** Standard configurations utilize structured **REST APIs** for one-shot workflows (posts browsing, logins, updates). 
* ** Bidirectional WebSockets (Socket.io):** Instantly moves active discussion routes into persistent full-duplex TCP tunnels for low-latency chat messaging and real-time transaction state badge updates without requiring manual browser refreshing.

---

## 🧰 Tech Stack Matrix

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend Framework** | Vue 3 (Composition API), Vite, TypeScript |
| **State Management & Styles** | Pinia, Tailwind CSS |
| **Backend Core Framework** | NestJS, TypeScript, Multer Stream API |
| **Database Ecosystem** | MongoDB Atlas, Mongoose ODM |
| **Media Delivery Cloud** | Cloudinary CDN Asset Storage |
| **Hosting & DevSecOps** | Cloudflare Pages (Frontend), Render (Backend), Git |

---

## 🚀 Local Development Environment Setup

### Prerequisites
* Node.js (v18+ recommended)
* npm or yarn

### 1. Clone the Shared Codebase
```bash
git clone [https://github.com/Th3ngSer/Material-Exchange-Platform.git](https://github.com/Th3ngSer/Material-Exchange-Platform.git)
cd Material-Exchange-Platform
