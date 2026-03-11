# QC-CNN Cataract Detection — Quick Start Guide

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **Supabase** account (for authentication and database)

---

## 1. Frontend Setup

```bash
# Install Node dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies (includes PennyLane for quantum computing)
pip install -r requirements.txt

# Start the API server
python -m uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

Backend API runs at: `http://localhost:8000`

---

## 3. Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 4. Supabase Database Setup

See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed database configuration.

The `detections` table schema:
```sql
CREATE TABLE detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  prediction text NOT NULL CHECK (prediction IN ('cataract', 'normal')),
  confidence float NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  created_at timestamptz DEFAULT now()
);
```

---

## 5. Training the QC-CNN Model

```bash
cd backend

# Train with quantum layer (QC-CNN)
python TrainQCCNN_Model.py --mode quantum --epochs 50 --batch-size 16

# Train classical CNN baseline (no quantum layer)
python TrainQCCNN_Model.py --mode classical --epochs 50 --batch-size 16
```

The trained model will be saved to `backend/Trained_models/`.

---

## 6. Evaluating the Model

```bash
cd backend

# Evaluate the best available model
python evaluate_model.py

# Evaluate a specific model file
python evaluate_model.py --model Trained_models/best_qccnn_model.keras
```

---

## 7. API Endpoints

| Method | Endpoint       | Description                    |
|--------|---------------|--------------------------------|
| GET    | `/`           | API information                |
| GET    | `/health`     | Health check / model status    |
| POST   | `/api/predict`| Image classification           |
| POST   | `/predict`    | Legacy endpoint (backward compat) |

### Example: Predict Endpoint

```bash
curl -X POST http://localhost:8000/api/predict \
  -F "file=@path/to/fundus_image.jpg"
```

Response:
```json
{
  "prediction": "cataract",
  "probability": 0.92,
  "model_type": "QC-CNN",
  "inference_time_ms": 245.67
}
```

---

## Dataset Structure

```
backend/Dataset/
├── Train/
│   ├── Cataract/    # Training cataract images
│   └── Normal/      # Training normal images
└── Test/
    ├── Cataract/    # Test cataract images
    └── Normal/      # Test normal images
```

---

## Troubleshooting

- **Model not loading**: Ensure you've trained a model first using `TrainQCCNN_Model.py`
- **PennyLane import error**: Install with `pip install pennylane pennylane-tf`
- **CORS errors**: The backend allows all origins by default in development
- **Supabase connection**: Verify your `.env` values match your Supabase project
