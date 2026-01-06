const AUTH_API = 'https://functions.poehali.dev/6aa2f63e-5ec4-4c47-b4ad-82d7858a3081';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async loginWithGoogle(credential: string): Promise<AuthResponse> {
    const response = await fetch(`${AUTH_API}?action=google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    });
    
    if (!response.ok) {
      throw new Error('Google authentication failed');
    }
    
    const data = await response.json();
    localStorage.setItem('authToken', data.token);
    return data;
  },

  async loginWithTelegram(authData: Record<string, string>): Promise<AuthResponse> {
    const response = await fetch(`${AUTH_API}?action=telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authData)
    });
    
    if (!response.ok) {
      throw new Error('Telegram authentication failed');
    }
    
    const data = await response.json();
    localStorage.setItem('authToken', data.token);
    return data;
  },

  async loginWithVK(userData: Record<string, any>): Promise<AuthResponse> {
    const response = await fetch(`${AUTH_API}?action=vk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      throw new Error('VK authentication failed');
    }
    
    const data = await response.json();
    localStorage.setItem('authToken', data.token);
    return data;
  },

  async verifySession(token: string): Promise<User | null> {
    try {
      const response = await fetch(`${AUTH_API}?action=verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      return data.user;
    } catch {
      return null;
    }
  },

  logout() {
    localStorage.removeItem('authToken');
  },

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
};
