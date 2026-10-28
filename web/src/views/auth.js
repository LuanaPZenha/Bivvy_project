import { AuthApi, setSession } from '../lib/api.js';
import { navigate } from '../lib/router.js';
import { escapeHtml } from './layout.js';

export function renderLogin() {
  return {
    html: `
      <form class="panel stack auth-card" id="auth-form">
        <h1 class="page-title">Welcome back</h1>
        <p class="muted">Sign in to rent, buy, and manage gear.</p>
        <div class="field"><label for="email">Email</label><input id="email" type="email" autocomplete="email" inputmode="email" enterkeyhint="next" value="demo@bivvy.test" /></div>
        <div class="field"><label for="password">Password</label><input id="password" type="password" autocomplete="current-password" enterkeyhint="go" value="BivvyDemo123" /></div>
        <button class="btn" type="submit" id="submit">Sign in</button>
        <div id="status"></div>
        <p class="muted">No account? <a href="#/register" data-link="/register">Create one</a></p>
      </form>
    `,
    bind(root) {
      root.querySelector('#auth-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const status = root.querySelector('#status');
        status.textContent = 'Signing in…';
        try {
          const data = await AuthApi.login({
            email: root.querySelector('#email').value,
            password: root.querySelector('#password').value,
          });
          setSession(data);
          navigate('/profile');
        } catch (err) {
          status.innerHTML = `<span class="error">${escapeHtml(err.message)}</span>`;
        }
      });
    },
  };
}

export function renderRegister() {
  return {
    html: `
      <form class="panel stack auth-card" id="auth-form">
        <h1 class="page-title">Create account</h1>
        <p class="muted">Join Bivvy to list gear or book your next trip.</p>
        <div class="field"><label for="name">Name</label><input id="name" autocomplete="name" enterkeyhint="next" /></div>
        <div class="field"><label for="email">Email</label><input id="email" type="email" autocomplete="email" inputmode="email" enterkeyhint="next" /></div>
        <div class="field"><label for="password">Password</label><input id="password" type="password" autocomplete="new-password" enterkeyhint="go" placeholder="At least 8 characters" /></div>
        <label class="check"><input id="terms" type="checkbox" /> I accept the terms</label>
        <button class="btn gold" type="submit" id="submit">Create account</button>
        <div id="status"></div>
        <p class="muted">Already have an account? <a href="#/login" data-link="/login">Sign in</a></p>
      </form>
    `,
    bind(root) {
      root.querySelector('#auth-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const status = root.querySelector('#status');
        status.textContent = 'Creating…';
        try {
          const data = await AuthApi.register({
            name: root.querySelector('#name').value,
            email: root.querySelector('#email').value,
            password: root.querySelector('#password').value,
            acceptTerms: root.querySelector('#terms').checked,
          });
          setSession(data);
          navigate('/profile');
        } catch (err) {
          status.innerHTML = `<span class="error">${escapeHtml(err.message)}</span>`;
        }
      });
    },
  };
}
