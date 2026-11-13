import { useId } from 'react';

export default function Input({ label, error, id, className = '', ...props }) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className={`field ${className}`}>
      {label && (
        <label htmlFor={inputId} className="field__label">
          {label}
        </label>
      )}
      <input id={inputId} className={`field__input${error ? ' has-error' : ''}`} {...props} />
      {error && <p className="field__error">{error}</p>}
    </div>
  );
}
