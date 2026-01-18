# 🌟 NGO Registration & Donation Management System

A full-stack web application that allows users to register, donate securely using a sandbox payment gateway, and track donation history, while administrators monitor users, payments, and analytics in real time.

This project was developed as part of the **NSS Open Project 2026** with a strong focus on secure data handling, ethical payment verification, and transparency.

---

## 🚀 Live Demo

Website link: https://ngo-frontend-tan.vercel.app/

Backend API: https://ngo-backend-sska.onrender.com  

> ⚠️ Payments run in **Razorpay Sandbox (Test Mode)**.  
> No real money is deducted.

---

## 🛠️ Tech Stack

### Frontend
- Next.js (React + TypeScript)
- Tailwind CSS
- Axios
- Lucide Icons

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- JWT Authentication
- Bcrypt Password Hashing

### Payment Gateway
- Razorpay Sandbox (Test Mode)

---

## ✨ Features

### 👤 User Features
- Secure registration and login
- Profile management (name and password)
- Razorpay sandbox donation flow
- Donation history with status tracking:
  - ✅ SUCCESS
  - ⏳ PENDING
  - ❌ FAILED

### 🛡️ Admin Features
- Secure admin authentication
- Dashboard analytics:
  - Total users
  - Total donations
  - Total amount collected
- Donation filtering:
  - Status
  - Date range
  - Amount range
- User and admin listing
- CSV export functionality
- Admin profile update

### 💳 Payment Integrity
- Each donation is created immediately with **PENDING** status.
- Payment is marked **SUCCESS only after Razorpay signature verification**.
- Failed or incomplete payments remain recorded.
- No fake or forced payment success logic exists.

---

## 💳 Payment Instructions (Important)

This project uses **Razorpay Sandbox mode for testing.**

⚠️ Avoid card payments during testing — some cards may fail or require verification.

✅ Recommended:

Use NETBANKING inside Razorpay popup.
Choose any test bank and complete payment.


No real money is deducted.

---

## 🧩 System Architecture
Frontend (Next.js)
|
| REST APIs (Axios)
↓
Backend (Node.js + Express)
|
| MongoDB Atlas
↓
Database
|
| Razorpay Sandbox API
↓
Payment Gateway


- Frontend handles UI, routing, and role-based navigation.
- Backend manages authentication, business logic, and payment verification.
- MongoDB stores users and donations independently.
- Razorpay validates payments using cryptographic signatures.

---

## 🗃️ Database Schema

### Users Collection
- name
- email
- password (bcrypt hashed)
- role (USER / ADMIN)
- createdAt

### Donations Collection
- user (reference to Users)
- amount
- status (PENDING / SUCCESS / FAILED)
- razorpayOrderId
- createdAt

Registration data is stored independently of donation success.

---

## 🔐 Security Practices

- Password hashing using bcrypt
- JWT-based authentication
- Role-based API protection
- Razorpay signature verification
- Environment variable protection for secrets

---

## 🧪 Local Setup

### Backend

cd backend
npm install
npm run dev

Create .env file:

MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
RAZORPAY_KEY_ID=your_test_key
RAZORPAY_KEY_SECRET=your_test_secret

Frontend
cd frontend
npm install
npm run dev

📦** Deployment**

Backend deployed on Render
Frontend deployed on Vercel
Environment variables configured on both platforms

Video Demo: https://youtu.be/OrIivoi4pcM
