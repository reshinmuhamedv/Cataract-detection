# Project Structure

Complete guide to understanding the codebase organization.

## Directory Overview

```
cataract-detection/
├── backend/                    # FastAPI backend
│   ├── main.py                # API server and endpoints
│   ├── train_model.py         # CNN model training script
│   ├── quantum_example.py     # Quantum-classical hybrid example
│   ├── requirements.txt       # Python dependencies
│   ├── start.sh              # Backend startup script
│   ├── models/               # Trained model storage
│   └── data/                 # Training datasets (user-provided)
│
├── src/                       # React frontend source
│   ├── components/           # Reusable React components
│   │   └── ProtectedRoute.tsx
│   ├── contexts/             # React context providers
│   │   └── AuthContext.tsx
│   ├── lib/                  # Utility libraries
│   │   └── supabase.ts
│   ├── pages/                # Application pages
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   └── Dashboard.tsx
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # React entry point
│   ├── index.css             # Global styles
│   └── vite-env.d.ts         # TypeScript definitions
│
├── public/                    # Static assets
│
├── dist/                      # Production build output
│
├── .env                       # Environment variables (create this)
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── package.json              # Node.js dependencies
├── tsconfig.json             # TypeScript configuration
├── tsconfig.app.json         # App-specific TS config
├── tsconfig.node.json        # Node-specific TS config
├── vite.config.ts            # Vite build configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── eslint.config.js          # ESLint configuration
│
├── README.md                 # Main documentation
├── QUICKSTART.md             # Quick setup guide
├── ARCHITECTURE.md           # System architecture docs
├── SUPABASE_SETUP.md         # Supabase configuration guide
└── PROJECT_STRUCTURE.md      # This file
```

## Backend Structure (`/backend`)

### `main.py`
**Purpose:** FastAPI server with prediction endpoints

**Key Components:**
```python
app = FastAPI()                    # FastAPI application
load_model()                       # Load trained CNN model
preprocess_image()                 # Image preprocessing
make_prediction()                  # Model inference
@app.post("/api/predict")         # Prediction endpoint
```

**Endpoints:**
- `GET /` - API status
- `GET /health` - Health check
- `POST /api/predict` - Image classification

### `train_model.py`
**Purpose:** Train the CNN model for cataract detection

**Key Functions:**
```python
create_cataract_cnn_model()       # Define CNN architecture
train_model()                      # Training pipeline
```

**Usage:**
```bash
python train_model.py
```

### `quantum_example.py`
**Purpose:** Educational example of quantum-classical hybrid CNN

**Key Components:**
```python
quantum_circuit()                  # Quantum feature extraction
QuantumLayer()                     # Custom Keras layer
create_hybrid_qc_cnn()            # Hybrid model architecture
compare_models()                   # Compare classical vs quantum
```

**Usage:**
```bash
pip install pennylane
python quantum_example.py
```

### `requirements.txt`
Python dependencies:
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `tensorflow` - Deep learning
- `pillow` - Image processing
- `numpy` - Numerical operations

### `models/` (created during training)
- `cataract_model.h5` - Trained CNN model
- `cataract_model_best.h5` - Best model checkpoint
- `hybrid_qc_cnn.h5` - Quantum-classical model (optional)

### `data/` (user-provided)
Expected structure:
```
data/
├── train/
│   ├── cataract/
│   │   ├── img001.jpg
│   │   ├── img002.jpg
│   │   └── ...
│   └── normal/
│       ├── img001.jpg
│       └── ...
└── val/
    ├── cataract/
    └── normal/
```

## Frontend Structure (`/src`)

### Core Files

#### `main.tsx`
**Purpose:** Application entry point

```typescript
ReactDOM.render(<App />, document.getElementById('root'));
```

#### `App.tsx`
**Purpose:** Main application component with routing

**Routes:**
- `/` - Redirect to dashboard
- `/login` - Login page
- `/signup` - Signup page
- `/dashboard` - Main application (protected)

```typescript
<BrowserRouter>
  <AuthProvider>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
    </Routes>
  </AuthProvider>
</BrowserRouter>
```

### Components (`/src/components`)

#### `ProtectedRoute.tsx`
**Purpose:** Route guard for authenticated pages

**Functionality:**
- Checks authentication status
- Shows loading spinner while checking
- Redirects to login if not authenticated
- Renders children if authenticated

**Usage:**
```typescript
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

### Contexts (`/src/contexts`)

#### `AuthContext.tsx`
**Purpose:** Global authentication state management

**Exports:**
- `AuthProvider` - Wrapper component
- `useAuth()` - Hook to access auth state

**State:**
```typescript
{
  user: User | null,
  session: Session | null,
  loading: boolean,
  signUp: (email, password) => Promise,
  signIn: (email, password) => Promise,
  signOut: () => Promise
}
```

**Usage:**
```typescript
const { user, signOut } = useAuth();
```

### Library (`/src/lib`)

#### `supabase.ts`
**Purpose:** Supabase client configuration

**Exports:**
- `supabase` - Configured Supabase client
- `Detection` - TypeScript interface

**Usage:**
```typescript
import { supabase } from '../lib/supabase';

const { data } = await supabase
  .from('detections')
  .select('*');
```

### Pages (`/src/pages`)

#### `Login.tsx`
**Purpose:** User login page

**Features:**
- Email/password form
- Form validation
- Error handling
- Link to signup page

**State:**
- `email`: string
- `password`: string
- `error`: string
- `loading`: boolean

#### `Signup.tsx`
**Purpose:** User registration page

**Features:**
- Email/password/confirm password form
- Password validation (min 6 chars, match)
- Success message
- Auto-redirect after signup
- Link to login page

**State:**
- `email`: string
- `password`: string
- `confirmPassword`: string
- `error`: string
- `loading`: boolean
- `success`: boolean

#### `Dashboard.tsx`
**Purpose:** Main application interface

**Features:**
- **Image Upload**
  - Drag & drop interface
  - File type validation
  - Image preview
  - Size limit (10MB)

- **Prediction**
  - Loading state during inference
  - Confidence score display
  - Visual feedback (color-coded)
  - Result message

- **History Sidebar**
  - Last 10 detections
  - Color-coded results
  - Timestamps
  - Delete functionality

**State:**
- `selectedFile`: File | null
- `preview`: string | null
- `loading`: boolean
- `result`: Detection | null
- `history`: Detection[]
- `error`: string

**API Integration:**
```typescript
const response = await fetch('http://localhost:8000/api/predict', {
  method: 'POST',
  body: formData
});
```

## Configuration Files

### `package.json`
**Dependencies:**
- `react` - UI library
- `react-dom` - React DOM renderer
- `react-router-dom` - Routing
- `@supabase/supabase-js` - Supabase client
- `lucide-react` - Icons

**Scripts:**
```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
npm run typecheck # TypeScript type checking
```

### `tsconfig.json`
TypeScript configuration with references to:
- `tsconfig.app.json` - Application config
- `tsconfig.node.json` - Node/Vite config

### `vite.config.ts`
Vite build configuration:
```typescript
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react']
  }
});
```

### `tailwind.config.js`
Tailwind CSS configuration:
```javascript
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: []
};
```

## Environment Variables

### `.env` (create this)
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### `.env.example`
Template for environment variables (committed to git)

## Build Output

### `dist/` (generated by `npm run build`)
```
dist/
├── index.html                  # Entry HTML
├── assets/
│   ├── index-[hash].css       # Compiled CSS
│   └── index-[hash].js        # Compiled JavaScript
└── vite.svg                   # Favicon
```

## Documentation Files

### `README.md`
- Project overview
- Complete setup instructions
- API documentation
- Usage guide
- Deployment info

### `QUICKSTART.md`
- 5-minute setup guide
- Step-by-step instructions
- Troubleshooting
- Quick commands reference

### `ARCHITECTURE.md`
- System architecture
- Data flow diagrams
- Model architecture
- Quantum-classical hybrid explanation
- Performance optimization

### `SUPABASE_SETUP.md`
- Detailed Supabase configuration
- Environment variable setup
- Common issues and solutions
- Security best practices

### `PROJECT_STRUCTURE.md`
- This file
- Complete codebase organization
- File purposes and usage

## Development Workflow

### 1. Initial Setup
```bash
npm install
cd backend && pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with Supabase credentials
```

### 3. Start Development
```bash
# Terminal 1: Backend
cd backend && ./start.sh

# Terminal 2: Frontend
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm run preview  # Test production build
```

## Key Patterns and Conventions

### React Patterns
- **Functional components** with hooks
- **TypeScript** for type safety
- **Custom hooks** (`useAuth`)
- **Context** for global state
- **Protected routes** for authentication

### API Patterns
- **RESTful** endpoints
- **Async/await** for operations
- **Error handling** with try/catch
- **CORS** configuration
- **Validation** middleware

### Database Patterns
- **Row Level Security** for authorization
- **Foreign keys** for relationships
- **Indexes** for query performance
- **Policies** for access control

### Code Organization
- **Feature-based** structure
- **Separation of concerns**
- **Reusable components**
- **Type-safe** interfaces
- **Modular** design

## Adding New Features

### New Frontend Page
1. Create `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`
3. Add navigation link if needed

### New API Endpoint
1. Add route in `backend/main.py`
2. Define request/response models
3. Implement handler function
4. Add error handling

### New Database Table
1. Create migration in Supabase dashboard
2. Enable RLS
3. Add policies
4. Update TypeScript types in `supabase.ts`

### New Component
1. Create in `src/components/`
2. Export from component file
3. Import where needed
4. Document props with TypeScript

## Best Practices

### Frontend
- Use TypeScript interfaces
- Handle loading states
- Show error messages
- Validate user input
- Keep components focused
- Use semantic HTML

### Backend
- Validate all inputs
- Handle errors gracefully
- Use type hints
- Document functions
- Keep endpoints RESTful
- Implement proper logging

### Database
- Always use RLS
- Create meaningful indexes
- Use transactions when needed
- Validate before insert
- Handle errors properly

## Testing Checklist

- [ ] Authentication flow (signup, login, logout)
- [ ] Image upload and preview
- [ ] Prediction accuracy
- [ ] History display
- [ ] Error handling
- [ ] Loading states
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

## Performance Considerations

- **Frontend:** Code splitting, lazy loading, memoization
- **Backend:** Model caching, async operations, connection pooling
- **Database:** Indexed queries, limited results, efficient RLS

## Security Checklist

- [ ] RLS enabled on all tables
- [ ] Environment variables not committed
- [ ] User input validated
- [ ] Authentication required for protected routes
- [ ] HTTPS in production
- [ ] API rate limiting (production)
- [ ] Regular dependency updates

This structure is designed to be scalable, maintainable, and easy to understand for new developers joining the project.
