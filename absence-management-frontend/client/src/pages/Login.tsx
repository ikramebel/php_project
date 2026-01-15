import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { userAPI } from '@/lib/api';
import { apiRequest } from '@/lib/api';


export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      
      const data = await userAPI.login(email, password) as any;

      if (!data.token) {
        setError('Login failed. Please try again.');
        toast.error('Invalid credentials');
        return;
      }

      
      localStorage.setItem('auth_token', data.token);

      
      const userData = await apiRequest('/users/me');

      
      localStorage.setItem('user_id', userData.id);
      localStorage.setItem('user_name', userData.name);
      localStorage.setItem('user_prenom', userData.prenom);
      localStorage.setItem('user_email', userData.email);
      localStorage.setItem('user_role', userData.role);
      if (userData.enseignant_id) {
        localStorage.setItem('enseignant_id', userData.enseignant_id);
      }

      
      login(data.token, userData);

      
      switch (userData.role) {
        case 'admin':
          setLocation('/admin/dashboard');
          break;
        case 'enseignant':
          setLocation('/teacher/dashboard');
          break;
        case 'etudiant':
          setLocation('/student/dashboard');
          break;
        default:
          setLocation('/student/dashboard');
      }

      toast.success('Login successful!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center px-4 py-12">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
            <span className="text-2xl font-bold text-primary-foreground">ES</span>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">ENSA Safi</h1>
          <p className="text-muted-foreground">Système de Gestion des Absences</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Bienvenue</h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Adresse Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre.email@uca.ac.ma"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Utilisez votre email institutionnel (email@uca.ac.ma)
                </p>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:opacity-90 text-primary-foreground font-semibold py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Info Text */}
              <p className="text-xs text-center text-muted-foreground pt-2">
                Your role (Admin, Teacher, or Student) determines your dashboard access
              </p>
            </form>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2025 ENSA Safi. All rights reserved.
        </p>
      </div>
    </div>
  );
}
