# QC-CNN Cataract Detection System

## Overview

A hybrid **Quantum-Classical Convolutional Neural Network (QC-CNN)** system for automated cataract detection from fundus images. This project combines the power of quantum computing with classical deep learning to achieve enhanced feature extraction and classification.

## Architecture

```
Frontend (React + TypeScript + Tailwind)
        ↕ REST API
Backend (FastAPI + TensorFlow + PennyLane)
        ↕
Database (Supabase / PostgreSQL)
```

### QC-CNN Model Architecture

```
Input Image (224×224×3)
        ↓
┌─ Conv Block 1 ─┐    Conv2D(32) → BatchNorm → MaxPool → Dropout(0.25)
┌─ Conv Block 2 ─┐    Conv2D(64) → BatchNorm → MaxPool → Dropout(0.25)
┌─ Conv Block 3 ─┐    Conv2D(128) → BatchNorm → MaxPool → Dropout(0.3)
┌─ Conv Block 4 ─┐    Conv2D(256) → BatchNorm → MaxPool → Dropout(0.3)
        ↓
  Global Average Pooling
        ↓
  Dense(16) — Quantum Encoding
        ↓
┌─ Quantum Layer ─┐
│  Amplitude Encoding (4 qubits)
│  Parameterized RY Rotations (2 layers)
│  CNOT Entanglement (ring topology)
│  Pauli-Z Measurement
└──────────────────┘
        ↓
  Dense(256) → BatchNorm → Dropout(0.5)
  Dense(128) → BatchNorm → Dropout(0.5)
        ↓
  Dense(1, sigmoid) → Binary Output (Cataract / Normal)
```

## Tech Stack

| Layer      | Technology                             |
|------------|----------------------------------------|
| Frontend   | React 18, TypeScript, Tailwind CSS     |
| Backend    | FastAPI, Python 3.10+                  |
| ML Model   | TensorFlow/Keras + PennyLane (Quantum) |
| Database   | Supabase (PostgreSQL + Auth)           |
| Dev Server | Vite (frontend), Uvicorn (backend)     |

## Project Structure

```
├── backend/
│   ├── quantum_layer.py         # PennyLane quantum circuit layer
│   ├── TrainQCCNN_Model.py      # QC-CNN training script
│   ├── TrainCNN_Model.py        # Legacy CNN training script
│   ├── api.py                   # FastAPI REST API server
│   ├── evaluate_model.py        # Model evaluation script
│   ├── requirements.txt         # Python dependencies
│   ├── Dataset/                 # Train/Test fundus images
│   └── Trained_models/          # Saved model files
├── src/
│   ├── App.tsx                  # React router setup
│   ├── main.tsx                 # App entry point
│   ├── index.css                # Quantum design system
│   ├── pages/
│   │   ├── Dashboard.tsx        # Main detection interface
│   │   ├── Login.tsx            # Authentication
│   │   └── Signup.tsx           # Registration
│   ├── components/
│   │   └── ProtectedRoute.tsx   # Auth guard
│   ├── contexts/
│   │   └── AuthContext.tsx      # Supabase auth state
│   └── lib/
│       └── supabase.ts          # Supabase client
├── supabase/                    # Database migrations
├── index.html                   # HTML entry point
├── package.json                 # Node dependencies
├── tailwind.config.js           # Tailwind theme
└── vite.config.ts               # Vite configuration
```

## Quick Start

See [QUICKSTART.md](QUICKSTART.md) for setup instructions.

## Features

- **QC-CNN Model**: Hybrid quantum-classical architecture using PennyLane
- **Real-time Detection**: Upload fundus images for instant AI analysis
- **User Authentication**: Supabase-powered login/signup
- **Detection History**: Track past predictions per user
- **Responsive UI**: Dark quantum-themed design with glassmorphism
- **Dual Mode Training**: Train in quantum or classical-only mode

## References

- "Cataract Detection Using QC-CNN" — CSD415 Phase 1
- Govt. Model Engineering College, Thrikkakara
- October 2025
