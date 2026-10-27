import { AuthApi, setSession } from '../lib/api.js';
import { navigate } from '../lib/router.js';
import { escapeHtml } from './layout.js';

export function renderLogin() {
  return {
    html: `
      <section class="panel stack" style="max-width:460px;margin:24px auto">
        <h1 style="margin:0;font-family:Fraunces,serif">Welcome back</h1>
        <p class="muted">Sign in to rent, buy, and manage gear.</p>
        <div class="field"><label>Email</label><input id="email" type="email" value="demo@bivvy.test" /></div>
        <div class="field"><label>Password</label><input id="password" type="password" value="BivvyDemo123" /></div>
        <button class="btn" id="submit">Sign in</button>
        <div id="status"></div>
        <p class="muted">No account? <a href="#/register">Create one</a></p>
      </section>
    `,
    bind(root) {
      root.querySelector('#submit').addEventListener('click', async () => {
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
      <section class="panel stack" style="max-width:460px;margin:24px auto">
        <h1 style="margin:0;font-family:Fraunces,serif">Create account</h1>
        <p class="muted">Join Bivvy to list gear or book your next trip.</p>
        <div class="field"><label>Name</label><input id="name" /></div>
        <div class="field"><label>Email</label><input id="email" type="email" /></div>
        <div class="field"><label>Password</label><input id="password" type="password" placeholder="At least 8 characters" /></div>
        <label><input id="terms" type="checkbox" /> I accept the terms</label>
        <button class="btn gold" id="submit">Create account</button>
        <div id="status"></div>
        <p class="muted">Already have an account? <a href="#/login">Sign in</a></p>
      </section>
    `,
    bind(root) {
      root.querySelector('#submit').addEventListener('click', async () => {
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
