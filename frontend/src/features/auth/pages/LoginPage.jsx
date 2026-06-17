import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AuthCard, AuthInput, AuthButton, AuthLink, AuthDivider } from '../components/AuthCard';
import { authApi } from '../api/authApi';

export function LoginPage({ onSwitchToSignup, onLoginSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const newErrors = {
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
    };
    setErrors(newErrors);
    setTouched({ email: true, password: true });

    if (newErrors.email || newErrors.password) return;

    setIsLoading(true);
    try {
      const response = await authApi.login(formData);
      setIsLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess(response.user);
      }
    } catch (err) {
      setIsLoading(false);
      setApiError(err.message || 'Invalid email or password. Please try again.');
    }
  };

  return (
    <AuthCard
      title="Welcome back."
      description="Sign in to your account to continue."
    >
      {apiError && (
        <div
          style={{
            backgroundColor: 'var(--color-error-soft)',
            color: 'var(--color-error-deep)',
            padding: 'var(--space-sm)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-body-sm)',
            marginBottom: 'var(--space-md)',
            border: '1px solid var(--color-error)'
          }}
        >
          {apiError}
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <AuthInput
          label="Email"
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.email}
          touched={touched.email}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
        <AuthInput
          label="Password"
          type="password"
          name="password"
          id="password"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.password}
          touched={touched.password}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
        <div style={{ marginBottom: 'var(--space-lg)', textAlign: 'right' }}>
          <AuthLink href="/forgot-password" style={{ fontSize: 'var(--text-body-sm)' }}>
            Forgot password?
          </AuthLink>
        </div>
        <AuthButton type="submit" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </AuthButton>
      </form>

      <p style={{ textAlign: 'center', marginTop: 'var(--space-lg)', color: 'var(--color-body)', fontSize: 'var(--text-body-sm)' }}>
        Don't have an account?{' '}
        <AuthLink onClick={() => { navigate('/signup'); if (onSwitchToSignup) onSwitchToSignup(); }} style={{ fontWeight: 'var(--weight-semibold)' }}>
          Sign up
        </AuthLink>
      </p>
    </AuthCard>
  );
}