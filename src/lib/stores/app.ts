import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// Theme management
export const theme = writable<'light' | 'dark' | 'system'>('system');
export const isDarkMode = writable(false);

// Navigation state
export const sidebarOpen = writable(false);
export const currentRoute = writable('');

// App state
export const isOnline = writable(true);
export const isInstalled = writable(false);
export const showInstallPrompt = writable(false);

// Loading states
export const globalLoading = writable(false);

// Notifications
export const notifications = writable<Array<{
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timeout?: number;
}>>([]);

class AppStore {
  constructor() {
    if (browser) {
      this.initializeTheme();
      this.initializeOnlineStatus();
      this.initializePWA();
    }
  }

  private initializeTheme(): void {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      theme.set(savedTheme);
    }

    // Watch for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateDarkMode = () => {
      theme.subscribe(currentTheme => {
        let isDark = false;
        
        if (currentTheme === 'dark') {
          isDark = true;
        } else if (currentTheme === 'system') {
          isDark = mediaQuery.matches;
        }
        
        isDarkMode.set(isDark);
        
        // Apply theme to document
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        // Save to localStorage
        localStorage.setItem('theme', currentTheme);
      });
    };

    updateDarkMode();
    mediaQuery.addEventListener('change', updateDarkMode);
  }

  private initializeOnlineStatus(): void {
    isOnline.set(navigator.onLine);
    
    window.addEventListener('online', () => isOnline.set(true));
    window.addEventListener('offline', () => isOnline.set(false));
  }

  private initializePWA(): void {
    // Check if app is installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      isInstalled.set(true);
    }

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      showInstallPrompt.set(true);
      
      // Store the event for later use
      (window as any).deferredPrompt = e;
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      isInstalled.set(true);
      showInstallPrompt.set(false);
      this.addNotification({
        type: 'success',
        message: 'App installed successfully!',
        timeout: 5000
      });
    });
  }

  setTheme(newTheme: 'light' | 'dark' | 'system'): void {
    theme.set(newTheme);
  }

  toggleSidebar(): void {
    sidebarOpen.update(open => !open);
  }

  closeSidebar(): void {
    sidebarOpen.set(false);
  }

  async installApp(): Promise<void> {
    const deferredPrompt = (window as any).deferredPrompt;
    
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the deferredPrompt
    (window as any).deferredPrompt = null;
    showInstallPrompt.set(false);
  }

  addNotification(notification: {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timeout?: number;
  }): void {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    notifications.update(current => [...current, newNotification]);
    
    // Auto-remove after timeout
    if (notification.timeout) {
      setTimeout(() => {
        this.removeNotification(id);
      }, notification.timeout);
    }
  }

  removeNotification(id: string): void {
    notifications.update(current => current.filter(n => n.id !== id));
  }

  clearAllNotifications(): void {
    notifications.set([]);
  }
}

export const appStore = new AppStore();

// Derived stores
export const currentThemeClass = derived(
  [theme, isDarkMode],
  ([$theme, $isDarkMode]) => {
    if ($theme === 'dark' || ($theme === 'system' && $isDarkMode)) {
      return 'dark';
    }
    return 'light';
  }
);