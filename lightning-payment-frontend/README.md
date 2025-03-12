
# Lightning Payment System

This is a **Lightning Network-based payment system** that enables organizations and users to create, manage, and process Bitcoin transactions efficiently. The system consists of a **Next.js frontend**, a **Nest.js backend**, and **LNBits integration** for Lightning Network payments.

## Project Structure
```
lightning-payment-system/
│── backend/lightning-payment-system # Nest.js backend
│── lightning-payment-frontend # Next.js frontend
```

## Prerequisites
To set up and run this project, ensure you have the following installed:
- **Node.js (v18+)**
- **MongoDB** (local or cloud instance)

## Installation & Setup

### 1. Clone the repository
```sh
 git clone https://github.com/your-repository/lightning-payment-system.git
 cd lightning-payment-system
```

### 2. Backend Setup (Nest.js)
#### Navigate to the backend directory:
```sh
 cd backend/lightning-payment-system
```
#### Install dependencies:
```sh
 npm install
```
#### Set up environment variables:
Create a **.env** file in the `backend` directory and configure the following:
```sh
LNBITS_BASE_URL=
LNBITS_X_API_KEY=
```

#### Run the backend server:
```sh
 npm run start
```

### 3. Frontend Setup (Next.js)
#### Navigate to the frontend directory:
```sh
 cd ../lightning-payment-frontend
```
#### Install dependencies:
```sh
 npm install
```

#### Run the frontend server:
```sh
 npm run dev
```
