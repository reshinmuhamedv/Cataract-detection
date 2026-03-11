import { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, UserPlus, Zap, CheckCircle } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-quantum-purple/5 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 rounded-full bg-quantum-cyan/5 blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="w-full max-w-md relative animate-fade-in-up">
        {/* Card */}
        <div className="glass-card p-8 space-y-8">
          {/* Logo Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-quantum-purple to-quantum-pink shadow-lg shadow-quantum-pink/20 animate-pulse-glow">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Create Account
              </h1>
              <p className="mt-2 text-sm text-slate-400 flex items-center justify-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-quantum-purple" />
                Join the QC-CNN Detection Platform
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm animate-slide-down">
              {error}
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-slide-down">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              Account created successfully! Redirecting...
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="signup-email" className="block text-sm font-medium text-slate-300">
                Email Address
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-quantum"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="signup-password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-quantum"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-slate-300">
                Confirm Password
              </label>
              <input
                id="signup-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="input-quantum"
                placeholder="••••••••"
              />
            </div>

            <button
              id="signup-submit"
              type="submit"
              disabled={loading || success}
              className="w-full btn-quantum flex items-center justify-center gap-2.5 py-3.5 text-base"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-quantum-purple hover:text-quantum-cyan font-medium transition-colors duration-300"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Bottom badge */}
        <div className="mt-6 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Quantum-Enhanced Security
          </span>
        </div>
      </div>
    </div>
  );
}
