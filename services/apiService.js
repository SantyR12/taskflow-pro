class APIService {
    constructor() {
        if (APIService.instance) {
            return APIService.instance;
        }
        this.baseURL = 'https://jsonplaceholder.typicode.com';
        this.token = null;
        this.user = null;
        
        APIService.instance = this;
    }

    setAuth(user, token) {
        this.token = token;
        this.user = user;
    }
    
    async get(endpoint) {
        const response = await fetch(`${this.baseURL}/${endpoint}`);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        return response.json();
    }
}

const apiServiceInstance = new APIService();
export default apiServiceInstance;