import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Detection } from '../lib/supabase';
import {
  Upload, Eye, LogOut, AlertCircle, CheckCircle,
  History, Trash2, Zap, Activity, Clock, Brain,
  TrendingUp, Shield
} from 'lucide-react';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<(Detection & { model_type?: string; inference_time_ms?: number }) | null>(null);
  const [history, setHistory] = useState<Detection[]>([]);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);


  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const { data, error } = await supabase
      .from('detections')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setHistory(data);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, JPEG)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:8000/api/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.detail || 'Prediction failed');
      }

      const data = await response.json();
      const imageUrl = URL.createObjectURL(selectedFile);

      const { data: detection, error: dbError } = await supabase
        .from('detections')
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          prediction: data.prediction,
          confidence: data.probability,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setResult({
        ...detection,
        model_type: data.model_type,
        inference_time_ms: data.inference_time_ms,
      });
      loadHistory();
    } catch (err: any) {
      setError(err.message || 'Failed to process image. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('detections')
      .delete()
      .eq('id', id);

    if (!error) {
      loadHistory();
      if (result?.id === id) {
        setResult(null);
      }
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const cataractCount = history.filter(h => h.prediction === 'cataract').length;
  const normalCount = history.filter(h => h.prediction === 'normal').length;

  return (
    <div className="min-h-screen">
      {/* ===== Navigation ===== */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-dark-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-quantum-cyan to-quantum-purple flex items-center justify-center shadow-lg shadow-quantum-purple/20">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-dark-900" />
              </div>
              <div>
                <span className="text-lg font-bold text-white tracking-tight">
                  Cataract Detection
                </span>

              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">

              <span className="text-sm text-slate-400 hidden sm:block">{user?.email}</span>
              <button
                id="logout-btn"
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== Main Content ===== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 animate-fade-in-up">
          <StatCard
            icon={<Activity className="w-4 h-4" />}
            label="Total Scans"
            value={history.length.toString()}
            color="cyan"
          />
          <StatCard
            icon={<AlertCircle className="w-4 h-4" />}
            label="Cataract Detected"
            value={cataractCount.toString()}
            color="red"
          />
          <StatCard
            icon={<CheckCircle className="w-4 h-4" />}
            label="Normal"
            value={normalCount.toString()}
            color="green"
          />
          <StatCard
            icon={<Brain className="w-4 h-4" />}
            label="Engine"
            value="QC-CNN"
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ===== Upload Section ===== */}
          <div className="lg:col-span-2 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="glass-card p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-quantum-cyan/20 to-quantum-purple/20 flex items-center justify-center border border-quantum-cyan/10">
                  <Upload className="w-5 h-5 text-quantum-cyan" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Upload Eye Image
                  </h2>
                  <p className="text-xs text-slate-500">Drag & drop or click to select</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Drop Zone */}
                <div
                  className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer group ${dragOver
                    ? 'border-quantum-cyan bg-quantum-cyan/5 scale-[1.02]'
                    : 'border-white/10 hover:border-quantum-cyan/30 hover:bg-white/[0.02]'
                    }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-quantum-cyan/10 transition-all duration-300 group-hover:scale-110">
                      <Upload className="w-8 h-8 text-slate-500 group-hover:text-quantum-cyan transition-colors" />
                    </div>
                    <span className="text-sm font-medium text-slate-300 mb-1">
                      {dragOver ? 'Drop your image here' : 'Click to upload or drag & drop'}
                    </span>
                    <span className="text-xs text-slate-500">
                      PNG, JPG, JPEG up to 10MB
                    </span>
                  </label>
                </div>

                {/* Preview + Detect Button */}
                {preview && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="relative rounded-xl overflow-hidden border border-white/5">
                      <img
                        src={preview}
                        alt="Fundus image preview"
                        className="w-full h-64 sm:h-72 object-contain bg-black/30"
                      />
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-xs text-slate-300 font-mono">
                        {selectedFile?.name}
                      </div>
                    </div>
                    <button
                      id="detect-btn"
                      onClick={handleUpload}
                      disabled={loading}
                      className="w-full btn-quantum flex items-center justify-center gap-3 py-4 text-base"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Analyzing image...</span>
                        </>
                      ) : (
                        <>
                          <Brain className="w-5 h-5" />
                          <span>Run QC-CNN Detection</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2.5 text-sm animate-slide-down">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {/* Result Display */}
                {result && (
                  <div
                    className={`rounded-2xl p-6 border animate-fade-in-up ${result.prediction === 'cataract'
                      ? 'bg-red-500/5 border-red-500/20'
                      : 'bg-emerald-500/5 border-emerald-500/20'
                      }`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${result.prediction === 'cataract'
                        ? 'bg-red-500/10'
                        : 'bg-emerald-500/10'
                        }`}>
                        {result.prediction === 'cataract' ? (
                          <AlertCircle className="w-6 h-6 text-red-400" />
                        ) : (
                          <CheckCircle className="w-6 h-6 text-emerald-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white">
                          {result.prediction === 'cataract'
                            ? 'Cataract Detected'
                            : 'Normal Eye'}
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">
                          {result.prediction === 'cataract'
                            ? 'The image shows signs of cataract. Please consult an ophthalmologist for proper diagnosis and treatment.'
                            : 'The image appears normal with no signs of cataract detected.'}
                        </p>
                      </div>
                    </div>

                    {/* Metrics Row */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/5 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingUp className="w-3.5 h-3.5 text-quantum-cyan" />
                          <span className="text-xs text-slate-500">Confidence</span>
                        </div>
                        <span className="text-lg font-bold text-white font-mono">
                          {(result.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Brain className="w-3.5 h-3.5 text-quantum-purple" />
                          <span className="text-xs text-slate-500">Model</span>
                        </div>
                        <span className="text-sm font-semibold text-white">
                          {result.model_type || 'QC-CNN'}
                        </span>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Clock className="w-3.5 h-3.5 text-quantum-pink" />
                          <span className="text-xs text-slate-500">Time</span>
                        </div>
                        <span className="text-sm font-semibold text-white font-mono">
                          {result.inference_time_ms ? `${result.inference_time_ms}ms` : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ===== History Sidebar ===== */}
          <div className="lg:col-span-1 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="glass-card p-6 sticky top-24">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <History className="w-4 h-4 text-quantum-cyan" />
                </div>
                <h3 className="text-base font-bold text-white">Recent Detections</h3>
              </div>

              <div className="space-y-3 max-h-[calc(100vh-240px)] overflow-y-auto pr-1">
                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                      <Eye className="w-6 h-6 text-slate-600" />
                    </div>
                    <p className="text-sm text-slate-500">
                      No detection history yet
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      Upload a fundus image to get started
                    </p>
                  </div>
                ) : (
                  history.map((item, index) => (
                    <div
                      key={item.id}
                      className="group relative bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all duration-200"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${item.prediction === 'cataract'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/10'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                            }`}
                        >
                          {item.prediction === 'cataract' ? (
                            <AlertCircle className="w-3 h-3" />
                          ) : (
                            <Shield className="w-3 h-3" />
                          )}
                          {item.prediction.toUpperCase()}
                        </span>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all duration-200 p-1 rounded-lg hover:bg-red-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-400 font-mono">
                          {(item.confidence * 100).toFixed(1)}% confidence
                        </p>
                        <p className="text-xs text-slate-600">
                          {new Date(item.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-quantum-cyan" />
              <span className="text-sm text-slate-500">
                QC-CNN Cataract Detection System
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <span>Govt. Model Engineering College, Thrikkakara</span>
              <span className="hidden sm:block">•</span>
              <span className="hidden sm:block">CSD415 Phase 1</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ===== Stat Card Component ===== */
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'cyan' | 'red' | 'green' | 'purple';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    cyan: 'text-quantum-cyan bg-quantum-cyan/10 border-quantum-cyan/10',
    red: 'text-red-400 bg-red-500/10 border-red-500/10',
    green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/10',
    purple: 'text-quantum-purple bg-quantum-purple/10 border-quantum-purple/10',
  };

  const iconColor = {
    cyan: 'text-quantum-cyan',
    red: 'text-red-400',
    green: 'text-emerald-400',
    purple: 'text-quantum-purple',
  };

  return (
    <div className={`glass-card p-4 group hover:scale-[1.02] transition-transform duration-200 border-l-2 ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={iconColor[color]}>{icon}</span>
        <span className="text-xs text-slate-500 font-medium">{label}</span>
      </div>
      <span className="text-2xl font-bold text-white">{value}</span>
    </div>
  );
}
