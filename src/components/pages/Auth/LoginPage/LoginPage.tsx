import AuthFormShell from '../AuthFormShell';

export default function LoginPage() {
  return (
    <AuthFormShell title="LOG IN">
      <form className="auth-form__fields">
        <div className="auth-form__row">
          <label htmlFor="loginEmail">Email</label>
          <input id="loginEmail" name="email" type="email" placeholder="you@example.com" />
        </div>

        <div className="auth-form__row">
          <label htmlFor="loginPassword">Password</label>
          <input
            id="loginPassword"
            name="password"
            type="password"
            placeholder="Enter your password"
          />
        </div>

        <div className="auth-form__actions">
          <button type="submit" className="auth-form__submit">
            LOG IN
          </button>
        </div>
      </form>
    </AuthFormShell>
  );
}
