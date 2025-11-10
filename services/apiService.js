// services/apiService.js - Patrón Singleton
class APIService {
    constructor() {
        if (APIService.instance) {
            return APIService.instance;
        }
        // Configuración inicial
        this.baseURL = 'https://jsonplaceholder.typicode.com';
        this.token = null;
        this.user = null;
        
        APIService.instance = this;
    }

    // 1. Método clave para actualizar el Singleton después del login
    setAuth(user, token) {
        this.token = token;
        this.user = user;
    }
    
    // 2. Método genérico para peticiones (ej. para el login)
    async get(endpoint) {
        const response = await fetch(`${this.baseURL}/${endpoint}`);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        return response.json();
    }
    
    // El Singleton se encarga de manejar la configuración de red global
    // Puedes añadir aquí métodos para POST, PUT, DELETE, etc.
}

// Exporta la única instancia del servicio
const apiServiceInstance = new APIService();
export default apiServiceInstance;