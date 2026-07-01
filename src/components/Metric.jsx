import { useEffect, useState } from "react";

export function Metric({ label, value, icon: Icon }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    const duration = 650;
    const startTime = performance.now();

    function animate(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(Math.round(target * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <div className="metric-card">
      <div className="metric-icon">
        {Icon && <Icon size={20} strokeWidth={1.8} />}
      </div>

      <span>{label}</span>

      <strong>{displayValue}</strong>

      <div className="metric-track">
        <i />
      </div>
    </div>
  );
}