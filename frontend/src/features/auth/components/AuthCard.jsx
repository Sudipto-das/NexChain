import { MeshGradient } from '@/shared/components/MeshGradient';

export function AuthCard({
  title,
  description,
  children,
  className = '',
}) {
  return (
    <div
      className={`auth-card relative overflow-hidden ${className}`}
      style={{
        backgroundColor: 'var(--color-canvas-soft)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-xl)',
        boxShadow: 'var(--shadow-level-4)',
        border: '1px solid var(--color-hairline)',
        maxWidth: '400px',
        width: '100%',
      }}
    >
      <MeshGradient animated={false} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <h1 className="text-display-sm" style={{ marginBottom: 'var(--space-xs)' }}>
            {title}
          </h1>
          <p className="text-body-md" style={{ color: 'var(--color-body)' }}>
            {description}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}

export function AuthInput({
  label,
  type = 'text',
  id,
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required,
  autoComplete,
}) {
  const inputId = id || name;
  const showError = error && onBlur; // Show error only after blur

  return (
    <div className="auth-input-wrapper" style={{ marginBottom: 'var(--space-md)' }}>
      <label
        htmlFor={inputId}
        className="text-body-sm-strong"
        style={{
          display: 'block',
          marginBottom: 'var(--space-xxs)',
          color: 'var(--color-ink)',
        }}
      >
        {label}
      </label>
      <input
        type={type}
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="auth-input"
        style={{
          width: '100%',
          height: '48px',
          padding: '0 var(--space-sm)',
          fontSize: 'var(--text-body-md)',
          fontFamily: 'var(--font-sans)',
          color: 'var(--color-ink)',
          backgroundColor: 'var(--color-canvas)',
          border: '1px solid var(--color-hairline)',
          borderRadius: 'var(--radius-sm)',
          outline: 'none',
          transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--color-link)';
          e.target.style.boxShadow = '0 0 0 3px var(--color-link-bg-soft)';
        }}
        onBlur={(e) => {
          if (!showError) {
            e.target.style.borderColor = 'var(--color-hairline)';
            e.target.style.boxShadow = 'none';
          }
        }}
      />
      {showError && (
        <p className="text-caption" style={{ color: 'var(--color-error)', marginTop: 'var(--space-xxs)' }}>
          {error}
        </p>
      )}
    </div>
  );
}

export function AuthButton({
  children,
  type = 'submit',
  variant = 'primary',
  disabled,
  className = '',
  onClick,
  style = {},
}) {
  const baseStyle = {
    width: '100%',
    height: '48px',
    padding: '0 var(--space-sm)',
    fontSize: 'var(--text-button-lg)',
    fontFamily: 'var(--font-sans)',
    fontWeight: 'var(--weight-medium)',
    borderRadius: 'var(--radius-pill)',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background-color var(--transition-fast), opacity var(--transition-fast)',
    opacity: disabled ? 0.6 : 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-xs)',
    ...style,
  };

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-on-primary)',
    },
    secondary: {
      backgroundColor: 'var(--color-canvas)',
      color: 'var(--color-ink)',
      border: '1px solid var(--color-hairline)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-link)',
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`auth-button ${className}`}
      style={{ ...baseStyle, ...variantStyles[variant] }}
    >
      {children}
    </button>
  );
}

export function AuthLink({ children, href, onClick, className = '' }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="auth-link"
      style={{
        color: 'var(--color-link)',
        fontSize: 'var(--text-body-sm)',
        fontWeight: 'var(--weight-medium)',
        textDecoration: 'none',
        transition: 'color var(--transition-fast)',
        ...className,
      }}
      onMouseEnter={(e) => {
        e.target.style.color = 'var(--color-link-deep)';
        e.target.style.textDecoration = 'underline';
      }}
      onMouseLeave={(e) => {
        e.target.style.color = 'var(--color-link)';
        e.target.style.textDecoration = 'none';
      }}
    >
      {children}
    </a>
  );
}

export function AuthDivider({ children }) {
  return (
    <div
      className="auth-divider"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        margin: 'var(--space-lg) 0',
        color: 'var(--color-mute)',
        fontSize: 'var(--text-caption)',
      }}
    >
      <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-hairline)' }} />
      <span>{children}</span>
      <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-hairline)' }} />
    </div>
  );
}