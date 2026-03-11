# System Architecture: Cataract Detection Using QC-CNN

## Overview

This document describes the architecture of the Cataract Detection System, which implements a hybrid Quantum-Classical Convolutional Neural Network (QC-CNN) approach for automated cataract detection from fundus images.

## Architecture Components

### 1. Frontend Layer (React + TypeScript)

```
┌─────────────────────────────────────────┐
│           User Interface                │
├─────────────────────────────────────────┤
│  • Authentication (Login/Signup)        │
│  • Image Upload Component               │
│  • Prediction Display                   │
│  • Detection History                    │
└─────────────────────────────────────────┘
```

**Technologies:**
- React 18 with TypeScript for type safety
- React Router for navigation
- Tailwind CSS for responsive design
- Supabase JS client for authentication

**Key Components:**
- `AuthContext`: Manages authentication state
- `ProtectedRoute`: Route guards for authenticated pages
- `Dashboard`: Main application interface
- `Login/Signup`: Authentication forms

### 2. Backend Layer (FastAPI + Python)

```
┌─────────────────────────────────────────┐
│         FastAPI REST API                │
├─────────────────────────────────────────┤
│  • Image Upload Endpoint                │
│  • Preprocessing Pipeline               │
│  • CNN Model Inference                  │
│  • Response Formatting                  │
└─────────────────────────────────────────┘
```

**Technologies:**
- FastAPI for high-performance API
- TensorFlow/Keras for deep learning
- PIL for image processing
- Uvicorn ASGI server

**Key Endpoints:**
- `POST /api/predict`: Image classification
- `GET /health`: Health check
- `GET /`: API status

### 3. Database Layer (Supabase/PostgreSQL)

```
┌─────────────────────────────────────────┐
│           Supabase Database             │
├─────────────────────────────────────────┤
│  auth.users (Built-in)                  │
│  └─ User authentication data            │
│                                         │
│  public.detections                      │
│  ├─ id (UUID)                           │
│  ├─ user_id (UUID) → auth.users        │
│  ├─ image_url (TEXT)                    │
│  ├─ prediction (TEXT)                   │
│  ├─ confidence (FLOAT)                  │
│  └─ created_at (TIMESTAMPTZ)           │
└─────────────────────────────────────────┘
```

**Security:**
- Row Level Security (RLS) enabled
- Users can only access their own records
- Policies for SELECT, INSERT, DELETE

## QC-CNN Model Architecture

### Theoretical Foundation

Based on the research paper "Cataract Detection Using QC-CNN", the model combines:
1. **Quantum Feature Extraction**: Uses quantum circuits for enhanced feature representation
2. **Classical CNN Layers**: Traditional convolutional layers for spatial feature extraction
3. **Hybrid Architecture**: Leverages advantages of both quantum and classical computing

### Current Implementation

The current implementation uses a classical CNN architecture that can be extended to incorporate quantum layers:

```
Input Image (224×224×3)
        ↓
┌──────────────────────┐
│  Conv Block 1        │
│  • Conv2D (32)       │
│  • BatchNorm         │
│  • MaxPool           │
│  • Dropout (0.25)    │
└──────────────────────┘
        ↓
┌──────────────────────┐
│  Conv Block 2        │
│  • Conv2D (64)       │
│  • BatchNorm         │
│  • MaxPool           │
│  • Dropout (0.25)    │
└──────────────────────┘
        ↓
┌──────────────────────┐
│  Conv Block 3        │
│  • Conv2D (128)      │
│  • BatchNorm         │
│  • MaxPool           │
│  • Dropout (0.3)     │
└──────────────────────┘
        ↓
┌──────────────────────┐
│  Conv Block 4        │
│  • Conv2D (256)      │
│  • BatchNorm         │
│  • MaxPool           │
│  • Dropout (0.3)     │
└──────────────────────┘
        ↓
┌──────────────────────┐
│  Global Avg Pooling  │
└──────────────────────┘
        ↓
┌──────────────────────┐
│  Dense Block 1       │
│  • Dense (512)       │
│  • BatchNorm         │
│  • Dropout (0.5)     │
└──────────────────────┘
        ↓
┌──────────────────────┐
│  Dense Block 2       │
│  • Dense (256)       │
│  • BatchNorm         │
│  • Dropout (0.5)     │
└──────────────────────┘
        ↓
┌──────────────────────┐
│  Output Layer        │
│  • Dense (1)         │
│  • Sigmoid           │
└──────────────────────┘
        ↓
  Binary Output
(Cataract / Normal)
```

### Key Features

**Preprocessing:**
1. Image resizing to 224×224 pixels
2. Normalization (pixel values → [0, 1])
3. RGB conversion if needed
4. Data augmentation during training:
   - Rotation (±20°)
   - Width/height shift (±20%)
   - Horizontal flip
   - Zoom (±20%)
   - Brightness adjustment

**Training Configuration:**
- Optimizer: Adam (learning rate: 0.0001)
- Loss Function: Binary Cross-entropy
- Metrics: Accuracy, Precision, Recall, AUC
- Callbacks:
  - ModelCheckpoint (save best model)
  - EarlyStopping (patience: 10)
  - ReduceLROnPlateau

**Model Performance Targets:**
- Accuracy: >90%
- Precision: High to minimize false positives
- Recall: High to minimize false negatives
- Inference Time: <5 seconds per image

## Data Flow

### 1. User Upload Flow

```
User selects image
      ↓
Frontend validates file type
      ↓
Image preview displayed
      ↓
User clicks "Detect"
      ↓
FormData with image sent to API
      ↓
Backend receives and validates
      ↓
Image preprocessing
      ↓
Model inference
      ↓
Prediction + confidence returned
      ↓
Result saved to database
      ↓
UI updated with result
```

### 2. Authentication Flow

```
User enters credentials
      ↓
Supabase Auth validates
      ↓
JWT token generated
      ↓
Token stored in local storage
      ↓
Auth state updated in context
      ↓
Protected routes accessible
      ↓
User ID used for database queries
```

### 3. History Retrieval Flow

```
Dashboard loads
      ↓
Query detections table
      ↓
Filter by user_id (RLS)
      ↓
Order by created_at DESC
      ↓
Limit 10 results
      ↓
Display in sidebar
```

## Security Architecture

### Authentication
- **Supabase Auth**: Industry-standard authentication
- **JWT Tokens**: Secure session management
- **Password Hashing**: Automatic by Supabase

### Authorization
- **Row Level Security (RLS)**: Database-level access control
- **User Isolation**: Users can only access their own data
- **API Authorization**: User ID verification on requests

### Data Protection
- **HTTPS**: Encrypted data transmission (production)
- **Input Validation**: File type and size checks
- **SQL Injection Prevention**: Parameterized queries via Supabase
- **XSS Prevention**: React's built-in protection

## Deployment Architecture

### Development
```
Frontend (localhost:5173) ←→ Backend (localhost:8000)
                                  ↓
                            Supabase (Cloud)
```

### Production
```
Frontend (CDN/Vercel) ←→ Backend (Cloud Server/AWS)
                              ↓
                        Supabase (Cloud)
                              ↓
                        Model Storage (S3/GCS)
```

## Extending to Quantum-Classical Hybrid

To implement the full QC-CNN as described in the research paper:

### 1. Quantum Layer Integration

```python
import pennylane as qml

# Define quantum device
dev = qml.device('default.qubit', wires=4)

@qml.qnode(dev)
def quantum_layer(inputs, weights):
    # Amplitude encoding
    qml.AmplitudeEmbedding(inputs, wires=range(4), normalize=True)

    # Parameterized quantum circuit
    for i in range(4):
        qml.RY(weights[i], wires=i)

    # Entanglement
    for i in range(3):
        qml.CNOT(wires=[i, i+1])

    # Measurement
    return [qml.expval(qml.PauliZ(i)) for i in range(4)]
```

### 2. Hybrid Model Structure

```
Classical CNN (Feature Extraction)
        ↓
Quantum Encoding (Amplitude Encoding)
        ↓
Quantum Circuit (Feature Enhancement)
        ↓
Measurement & Decoding
        ↓
Classical Dense Layers (Classification)
        ↓
Output
```

### 3. Benefits of Quantum Enhancement
- **Reduced Parameters**: Fewer qubits needed
- **Enhanced Features**: Quantum entanglement captures complex patterns
- **NISQ Compatible**: Works with current quantum hardware
- **Noise Resilient**: Training includes noisy data

## Performance Optimization

### Frontend
- Code splitting
- Lazy loading routes
- Image compression before upload
- Memoization of components

### Backend
- Model caching in memory
- Batch processing support
- Async request handling
- Connection pooling

### Database
- Indexed queries
- Optimized RLS policies
- Limited result sets
- Efficient pagination

## Monitoring and Logging

### Application Metrics
- Request latency
- Prediction accuracy
- Error rates
- User activity

### Model Metrics
- Inference time
- Confidence distribution
- Prediction counts
- False positive/negative rates

## Future Enhancements

1. **Quantum Implementation**: Full QC-CNN with PennyLane/Qiskit
2. **Multi-Disease Detection**: Extend to glaucoma, diabetic retinopathy
3. **Explainable AI**: Grad-CAM visualization
4. **Real-time Processing**: WebSocket support
5. **Mobile App**: React Native implementation
6. **Cloud Deployment**: AWS/GCP infrastructure
7. **Model Versioning**: Track model improvements
8. **A/B Testing**: Compare model versions

## References

- Project Report: "Cataract Detection Using QC-CNN" - CSD415 Phase 1
- Govt. Model Engineering College, Thrikkakara
- October 2025
