import { APP_SCHEME, deepLinkPaths, deepLinks, routes } from '@/lib/routes';

describe('deepLinks', () => {
  it('composes the app scheme with auth route paths', () => {
    expect(APP_SCHEME).toBe('stanapp');
    expect(deepLinkPaths.invite).toBe('invite');
    expect(deepLinkPaths.resetPassword).toBe('reset-password');
    expect(deepLinks.invite).toBe(`${APP_SCHEME}:/${routes.invite}`);
    expect(deepLinks.resetPassword).toBe(`${APP_SCHEME}:/${routes.resetPassword}`);
  });
});
