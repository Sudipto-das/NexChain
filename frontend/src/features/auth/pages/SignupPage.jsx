import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AuthCard, AuthInput, AuthButton, AuthLink, AuthDivider } from '../components/AuthCard';
import { authApi } from '../api/authApi';

export function SignupPage({ onSwitchToLogin, onSignupSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
    referralCode: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        return '';
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
        return '';
      case 'mobileNumber':
        if (!value) return 'Mobile number is required';
        if (!/^\+?[0-9]{10,15}$/.test(value.replace(/[-\s]/g, ''))) {
          return 'Enter a valid mobile number (10-15 digits)';
        }
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
      fullName: validateField('fullName', formData.fullName),
      email: validateField('email', formData.email),
      mobileNumber: validateField('mobileNumber', formData.mobileNumber),
      password: validateField('password', formData.password),
    };

    setErrors(newErrors);
    setTouched({
      fullName: true,
      email: true,
      mobileNumber: true,
      password: true,
    });

    if (newErrors.fullName || newErrors.email || newErrors.mobileNumber || newErrors.password) {
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        password: formData.password,
      };
      if (formData.referralCode.trim()) {
        payload.referralCode = formData.referralCode.trim();
      }
      const response = await authApi.signup(payload);
      setIsLoading(false);
      if (onSignupSuccess) {
        onSignupSuccess(response.user);
      }
    } catch (err) {
      setIsLoading(false);
      setApiError(err.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <AuthCard
      title="Create your account."
      description="Join NexChain and start investing today."
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
          label="Full Name"
          type="text"
          name="fullName"
          id="fullName"
          value={formData.fullName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.fullName}
          touched={touched.fullName}
          placeholder="John Doe"
          required
          autoComplete="name"
        />
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
          label="Mobile Number"
          type="tel"
          name="mobileNumber"
          id="mobileNumber"
          value={formData.mobileNumber}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.mobileNumber}
          touched={touched.mobileNumber}
          placeholder="+1234567890"
          required
          autoComplete="tel"
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
          autoComplete="new-password"
        />
        <AuthInput
          label="Referral Code (Optional)"
          type="text"
          name="referralCode"
          id="referralCode"
          value={formData.referralCode}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="REF-12345"
        />

        <div style={{ height: 'var(--space-md)' }}></div>

        <AuthButton type="submit" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Sign up'}
        </AuthButton>
      </form>

      <p style={{ textAlign: 'center', marginTop: 'var(--space-lg)', color: 'var(--color-body)', fontSize: 'var(--text-body-sm)' }}>
        Already have an account?{' '}
        <AuthLink onClick={() => { navigate('/login'); if (onSwitchToLogin) onSwitchToLogin(); }} style={{ fontWeight: 'var(--weight-semibold)' }}>
          Sign in
        </AuthLink>
      </p>
    </AuthCard>
  );
}
