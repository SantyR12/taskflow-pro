import { store } from '../store/index.js'; // es el objeto redux que es el almacen central de la app
import { loginSuccess } from '../store/authSlice.js'; // es la accion del redix de authSlice para acutlaizar el estado de autenticacion
import apiService from '../services/apiService.js'; // contiene el metodo para realizar peticiones a la API 

export const renderLogin = () => { // define la funcion que sera la responsable de renderizar el formulario de login
    const container = document.getElementById('login-container'); // obtiene la referencia al elemento HTML donde se mostrara el formulario de login
    container.innerHTML = ` 
        <h2>Iniciar Sesión</h2>
        <form id="login-form">
            <input type="email" id="email" value="Sincere@april.biz" required placeholder="Email">
            <button type="submit">Login (ID 1)</button>
        </form>
        <p>Usar: Sincere@april.biz (JSONPlaceholder User ID 1)</p>
    `; // Inicia la asignacion del contenido HTML dentro del contenedor 
        
        document.getElementById('login-form').addEventListener('submit', async (e) => { // Agrega un listener al formulario con ID, la funcion es asincrona porque hara una peticion a la API
            e.preventDefault(); // Evita el comportamiento por defecto 
            const email = document.getElementById('email').value; 
            
            try { // 
                const users = await apiService.get(`users?email=${email}`); // Llama de forma asincrona al servicion de API buscando el usuario por email
                if (users.length > 0) { 
                    const user = users[0]; 
                    store.dispatch(loginSuccess({ user, token: 'fake-token-123' })); // JSON Web Token simulado
                } else {
                    alert('Usuario no encontrado.');
                }
            } catch (error) {
                console.error('Error durante el login:', error);
                alert('Error de API durante el login.');
            }
        });
    };
