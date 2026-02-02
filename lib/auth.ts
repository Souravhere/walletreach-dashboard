export const setToken = (token: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('walletreach_token', token);
    }
};

export const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('walletreach_token');
    }
    return null;
};

export const removeToken = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('walletreach_token');
    }
};

export const setUser = (user: any) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('walletreach_user', JSON.stringify(user));
    }
};

export const getUser = (): any | null => {
    if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('walletreach_user');
        return userStr ? JSON.parse(userStr) : null;
    }
    return null;
};

export const removeUser = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('walletreach_user');
    }
};

export const isAuthenticated = (): boolean => {
    return !!getToken();
};

export const isSuperAdmin = (): boolean => {
    const user = getUser();
    return user?.role === 'super_admin';
};

export const isOperator = (): boolean => {
    const user = getUser();
    return user?.role === 'operator' || user?.role === 'super_admin';
};

export const logout = () => {
    removeToken();
    removeUser();
    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
};
