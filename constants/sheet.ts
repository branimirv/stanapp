import { Platform } from 'react-native';

/** Bottom inset for bottom-sheet style modals (safe area–ish, platform-tuned). */
export const MODAL_SHEET_BOTTOM_PADDING = Platform.OS === 'ios' ? 40 : 32;
