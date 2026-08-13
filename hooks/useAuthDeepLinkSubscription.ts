import { useEffect } from 'react';
import { useRouter } from 'expo-router';

import {
  setPendingPostAuthRoute,
  subscribeToAuthDeepLinks,
} from '@/lib/authDeepLinks';
import { deepLinkPaths, routes } from '@/lib/routes';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';

/** Cold-start + warm auth deep links → toast, pending route, session, navigate. */
export function useAuthDeepLinkSubscription() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const showToast = useUiStore((state) => state.showToast);

  useEffect(() => {
    return subscribeToAuthDeepLinks((url, result) => {
      if (result.error) {
        showToast({ message: result.error, type: 'error' });
      }

      if (result.path === deepLinkPaths.resetPassword) {
        setPendingPostAuthRoute(routes.resetPassword);
      } else if (result.path === deepLinkPaths.invite || url.includes(deepLinkPaths.invite)) {
        setPendingPostAuthRoute(routes.invite);
      }

      // Session is also pushed via onAuthStateChange; setSession keeps store warm
      // if the listener races ahead of the auth event.
      if (result.session) {
        setSession(result.session);
      }

      if (result.path === deepLinkPaths.resetPassword) {
        router.replace(routes.resetPassword);
        return;
      }
      if (result.path === deepLinkPaths.invite || url.includes(deepLinkPaths.invite)) {
        router.replace(routes.invite);
      }
    });
  }, [router, setSession, showToast]);
}
