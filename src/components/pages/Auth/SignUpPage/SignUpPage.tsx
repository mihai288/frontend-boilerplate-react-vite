import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthFormShell from '../AuthFormShell';
import { signUp } from '@services/auth';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get('password') ?? '');
    const confirmPassword = String(formData.get('confirmPassword') ?? '');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    try {
      await signUp({
        name: `${String(formData.get('firstName') ?? '').trim()} ${String(formData.get('lastName') ?? '').trim()}`.trim(),
        email: String(formData.get('email') ?? ''),
        password,
      });

      navigate('/login', { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to create account');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthFormShell title="Create your account">
      <form className="auth-form__fields" onSubmit={handleSubmit}>
        <div className="auth-form__split">
          <div className="auth-form__row">
            <label htmlFor="firstName">First name</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              placeholder="First"
              required
            />
          </div>
          <div className="auth-form__row">
            <label htmlFor="lastName">Last name</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Last"
              required
            />
          </div>
        </div>

        <div className="auth-form__row">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="auth-form__row">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a password"
            required
          />
        </div>

        <div className="auth-form__row">
          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            required
          />
        </div>

        {errorMessage ? <p className="auth-form__error">{errorMessage}</p> : null}

        <div className="auth-form__actions">
          <button type="submit" className="auth-form__submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>

          <p className="auth-form__switch">
            <span>Already have an account?</span>
            <Link to="/login" className="auth-form__switch-link">
              Log in
            </Link>
          </p>
        </div>
      </form>
    </AuthFormShell>
  );
}
