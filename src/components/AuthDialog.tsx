import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { authService, User } from '@/lib/auth';

declare global {
  interface Window {
    google?: any;
    Telegram?: any;
    VK?: any;
  }
}

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess: (user: User) => void;
}

const AuthDialog = ({ open, onOpenChange, onAuthSuccess }: AuthDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!open) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
          callback: handleGoogleResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInButton'),
          { theme: 'outline', size: 'large', width: 350 }
        );
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [open]);

  const handleGoogleResponse = async (response: any) => {
    setLoading(true);
    setError('');
    try {
      const data = await authService.loginWithGoogle(response.credential);
      onAuthSuccess(data.user);
      onOpenChange(false);
    } catch (err) {
      setError('Ошибка авторизации через Google');
    } finally {
      setLoading(false);
    }
  };

  const handleTelegramLogin = () => {
    const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME;
    if (!botUsername) {
      setError('Telegram авторизация не настроена');
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;
    
    const container = document.getElementById('telegramLoginButton');
    if (container) {
      container.innerHTML = '';
      container.appendChild(script);
    }

    (window as any).onTelegramAuth = async (user: any) => {
      setLoading(true);
      setError('');
      try {
        const data = await authService.loginWithTelegram(user);
        onAuthSuccess(data.user);
        onOpenChange(false);
      } catch (err) {
        setError('Ошибка авторизации через Telegram');
      } finally {
        setLoading(false);
      }
    };
  };

  const handleVKLogin = () => {
    const appId = import.meta.env.VITE_VK_APP_ID;
    if (!appId) {
      setError('VK авторизация не настроена');
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://vk.com/js/api/openapi.js?169';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.VK) {
        window.VK.init({ apiId: appId });
        window.VK.Auth.login(async (response: any) => {
          if (response.session) {
            setLoading(true);
            setError('');
            try {
              const data = await authService.loginWithVK({
                uid: response.session.user.id,
                first_name: response.session.user.first_name,
                last_name: response.session.user.last_name,
                photo: response.session.user.photo
              });
              onAuthSuccess(data.user);
              onOpenChange(false);
            } catch (err) {
              setError('Ошибка авторизации через VK');
            } finally {
              setLoading(false);
            }
          }
        });
      }
    };
  };

  useEffect(() => {
    if (open) {
      handleTelegramLogin();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Войти в аккаунт</DialogTitle>
          <DialogDescription className="text-center">
            Выберите удобный способ авторизации
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div id="googleSignInButton" className="flex justify-center"></div>

          <Separator className="my-4">
            <span className="bg-background px-2 text-muted-foreground text-xs">или</span>
          </Separator>

          <div id="telegramLoginButton" className="flex justify-center"></div>

          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2"
            onClick={handleVKLogin}
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 48 48" fill="currentColor">
              <path d="M25.73 34.91C14.57 34.91 8.12 27.11 7.85 14.5h5.64c.19 9.39 4.32 13.38 7.6 14.21v-14.21h5.3v8.13c3.24-.35 6.61-3.97 7.76-8.13h5.3c-.88 4.99-4.56 8.67-7.18 10.19 2.62 1.27 6.79 4.45 8.38 10.22h-5.85c-1.23-3.82-4.29-6.79-8.33-7.2v7.2h-.74z"/>
            </svg>
            Войти через ВКонтакте
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Авторизуясь, вы принимаете условия использования сервиса
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
