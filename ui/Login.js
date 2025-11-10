import { store } from '../store/index.js';
import { loginSuccess } from '../store/authSlice.js';
import apiService from '../services/apiService.js';

export const renderLogin = () => {
    const container = document.getElementById('login-container');
    container.innerHTML = `
        <h2>Iniciar Sesión</h2>
        <form id="login-form">
            <input type="email" id="email" value="Sincere@april.biz" required placeholder="Email">
            <button type="submit">Login (ID 1)</button>
        </form>
        <p>Usar: Sincere@april.biz (JSONPlaceholder User ID 1)</p>
    `;
        
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            
            try {
                const users = await apiService.get(`users?email=${email}`);
                if (users.length > 0) {
                    const user = users[0];
                    store.dispatch(loginSuccess({ user, token: 'fake-token-123' }));
                } else {
                    alert('Usuario no encontrado.');
                }
            } catch (error) {
                console.error('Error durante el login:', error);
                alert('Error de API durante el login.');
            }
        });
    };
