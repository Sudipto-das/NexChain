export function MeshGradient({
  className = '',
  style = {},
  animated = true,
}) {
  return (
    <div
      className={`mesh-gradient ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        ...style,
      }}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1400 800"
        preserveAspectRatio="none"
        style={{
          width: '100%',
          height: '100%',
          filter: 'blur(120px)',
          transform: 'scale(1.2)',
          transformOrigin: 'center',
        }}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="mesh-develop" cx="20%" cy="30%" r="60%" fx="20%" fy="30%">
            <stop offset="0%" stopColor="#007cf0" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00dfd8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="mesh-preview" cx="70%" cy="20%" r="55%" fx="70%" fy="20%">
            <stop offset="0%" stopColor="#7928ca" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ff0080" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="mesh-ship" cx="50%" cy="80%" r="65%" fx="50%" fy="80%">
            <stop offset="0%" stopColor="#ff4d4d" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f9cb28" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="mesh-cyan" cx="85%" cy="60%" r="40%" fx="85%" fy="60%">
            <stop offset="0%" stopColor="#50e3c2" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#50e3c2" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse
          cx="280"
          cy="240"
          rx="420"
          ry="320"
          fill="url(#mesh-develop)"
          style={{
            animation: animated ? 'float 20s ease-in-out infinite' : 'none',
            transformOrigin: 'center',
          }}
        />
        <ellipse
          cx="980"
          cy="160"
          rx="380"
          ry="280"
          fill="url(#mesh-preview)"
          style={{
            animation: animated ? 'float 22s ease-in-out infinite reverse' : 'none',
            transformOrigin: 'center',
          }}
        />
        <ellipse
          cx="700"
          cy="640"
          rx="450"
          ry="350"
          fill="url(#mesh-ship)"
          style={{
            animation: animated ? 'float 18s ease-in-out infinite' : 'none',
            transformOrigin: 'center',
          }}
        />
        <ellipse
          cx="1190"
          cy="480"
          rx="280"
          ry="220"
          fill="url(#mesh-cyan)"
          style={{
            animation: animated ? 'float 24s ease-in-out infinite reverse' : 'none',
            transformOrigin: 'center',
          }}
        />
        <style>{`
          @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(30px, -20px) scale(1.05); }
            50% { transform: translate(-20px, 30px) scale(0.98); }
            75% { transform: translate(-30px, -15px) scale(1.02); }
          }
        `}</style>
      </svg>
    </div>
  );
}