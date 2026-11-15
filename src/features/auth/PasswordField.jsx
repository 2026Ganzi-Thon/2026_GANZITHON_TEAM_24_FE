import { useId, useState } from 'react';
import { Input } from '../../components/ui';
import './password-field.css';

export default function PasswordField({ placeholder = '비밀번호', ...props }) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-field">
      <Input
        {...props}
        id={id}
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        aria-label={placeholder}
        autoCapitalize="none"
        spellCheck={false}
      />
      <button
        type="button"
        className="password-field__toggle"
        aria-label={`${placeholder} ${visible ? '숨기기' : '보기'}`}
        aria-controls={id}
        onClick={() => setVisible(!visible)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" fillRule="evenodd" d="M1 12c2.2-4.4 6.2-7.5 11-7.5S20.8 7.6 23 12c-2.2 4.4-6.2 7.5-11 7.5S3.2 16.4 1 12Zm6.2 0a4.8 4.8 0 1 0 9.6 0 4.8 4.8 0 1 0-9.6 0Zm1.7 0a3.1 3.1 0 1 1 6.2 0 3.1 3.1 0 0 1-6.2 0Z" />
          {visible && <path d="M4 4l16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
        </svg>
      </button>
    </div>
  );
}
