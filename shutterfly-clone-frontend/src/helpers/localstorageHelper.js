export const LocalStorage = {
    setItem(key, payload) {
        return localStorage.setItem(key, JSON.stringify(payload));
    },
    getItem(key) {
        const data = localStorage.getItem(key);
        const result = data ? JSON.parse(data) : null
        return result;
    },
    removeItem(key) {
       localStorage.removeItem(key);
       return true;
    },
    clearStorage() {
        localStorage.clear();
        return true;
    }
}