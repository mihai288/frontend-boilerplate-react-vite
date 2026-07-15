import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthFormShell from '../AuthFormShell';
import { login } from '@services/auth';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const session = await login({
        email: String(formData.get('email') ?? ''),
        password: String(formData.get('password') ?? ''),
      });

      setSession(session);
      navigate('/main', { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to log in');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthFormShell title="LOG IN">
      <form className="auth-form__fields" onSubmit={handleSubmit}>
        <div className="auth-form__row">
          <label htmlFor="loginEmail">Email</label>
          <input id="loginEmail" name="email" type="email" placeholder="you@example.com" required />
        </div>

        <div className="auth-form__row">
          <label htmlFor="loginPassword">Password</label>
          <input
            id="loginPassword"
            name="password"
            type="password"
            placeholder="Enter your password"
            required
          />
        </div>

        {errorMessage ? <p className="auth-form__error">{errorMessage}</p> : null}

        <div className="auth-form__actions">
          <button type="submit" className="auth-form__submit" disabled={isSubmitting}>
            {isSubmitting ? 'LOGGING IN...' : 'LOG IN'}
          </button>
        </div>
      </form>
    </AuthFormShell>
  );
}
