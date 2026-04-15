import { Form } from '@adonisjs/inertia/react'

export default function Login() {
  return (
    <div className="form-container">
      <div>
        <h1>Login</h1>
        <p>Entre ton identifiant et ton mot de passe.</p>
      </div>

      <div>
        <Form route="session.store">
          {({ errors }) => (
            <>
              <div>
                <label htmlFor="email">Username</label>
                <input
                  type="text"
                  name="email"
                  id="email"
                  autoComplete="username"
                  placeholder="you@example.com"
                  data-invalid={errors.email ? 'true' : undefined}
                />
                {errors.email && <div>{errors.email}</div>}
              </div>

              <div>
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  autoComplete="current-password"
                />
                {errors.password ? <span>{errors.password}</span> : ''}
              </div>

              <div>
                <button type="submit" className="button">
                  Login
                </button>
              </div>
            </>
          )}
        </Form>
      </div>
    </div>
  )
}
