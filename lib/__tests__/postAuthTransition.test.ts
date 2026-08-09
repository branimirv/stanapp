import {
  clearPostAuthTransition,
  hasPostAuthTransition,
  markPostAuthTransition,
  takePostAuthTransition,
} from '@/lib/postAuthTransition';
import { useBootOverlayStore } from '@/stores/bootOverlayStore';

describe('postAuthTransition', () => {
  beforeEach(() => {
    useBootOverlayStore.setState({ visible: false });
    clearPostAuthTransition();
    useBootOverlayStore.setState({ visible: false });
  });

  afterEach(() => {
    clearPostAuthTransition();
  });

  it('shows the boot overlay when marked', () => {
    markPostAuthTransition({ toastMessage: 'ok' });
    expect(hasPostAuthTransition()).toBe(true);
    expect(useBootOverlayStore.getState().visible).toBe(true);
  });

  it('take consumes pending without hiding the overlay', () => {
    markPostAuthTransition({ toastMessage: 'ok' });
    expect(takePostAuthTransition()).toEqual({ toastMessage: 'ok' });
    expect(hasPostAuthTransition()).toBe(false);
    expect(useBootOverlayStore.getState().visible).toBe(true);
  });

  it('clear drops a pending mark and hides the overlay', () => {
    markPostAuthTransition({ toastMessage: 'ok' });
    clearPostAuthTransition();
    expect(hasPostAuthTransition()).toBe(false);
    expect(useBootOverlayStore.getState().visible).toBe(false);
  });
});
