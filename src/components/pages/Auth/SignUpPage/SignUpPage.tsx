import AuthFormShell from '../AuthFormShell';

export default function SignUpPage() {
  return (
    <AuthFormShell title="SIGN UP">
      <form className="auth-form__fields">
        <div className="auth-form__split">
          <div className="auth-form__row">
            <label htmlFor="firstName">First name</label>
            <input id="firstName" name="firstName" type="text" placeholder="Antonia" />
          </div>
          <div className="auth-form__row">
            <label htmlFor="lastName">Last name</label>
            <input id="lastName" name="lastName" type="text" placeholder="Rivera" />
          </div>
        </div>

        <div className="auth-form__row">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" placeholder="you@example.com" />
        </div>

        <div className="auth-form__row">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Create a strong password"
          />
        </div>

        <div className="auth-form__row">
          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Repeat your password"
          />
        </div>

        <div className="auth-form__actions">
          <button type="submit" className="auth-form__submit">
            SIGN UP
          </button>
        </div>
      </form>
    </AuthFormShell>
  );
}
