import { DynamicColorIOS, Platform } from 'react-native';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTranslation } from 'react-i18next';

import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useTabBarPreference } from '@/hooks/useTabBarPreference';

export default function TabLayout() {
  const { t } = useTranslation();
  const { theme, isDark } = useAppTheme();
  const isAndroid = Platform.OS === 'android';
  const { showLabels } = useTabBarPreference();

  const tintColor =
    Platform.OS === 'ios'
      ? DynamicColorIOS({
          light: Colors.primary,
          dark: Colors.primary,
        })
      : theme.colors.primary;

  const labelStyle =
    Platform.OS === 'ios'
      ? {
          color: DynamicColorIOS({
            light: Colors.textPrimary,
            dark: Colors.textInverse,
          }),
        }
      : {
          default: { color: theme.colors.onSurfaceVariant },
          selected: { color: theme.colors.primary },
        };

  // Soft brand wash lives in each tab layout (`AppScreenBackground`) because
  // NativeTabs scenes are opaque and hide the root ambient.
  // Frosted chrome stays translucent so scroll content shows through;
  // icons/labels stay fully opaque via tintColor + labelStyle.
  // disableTransparentOnScrollEdge keeps blur at the edge (otherwise iOS
  // clears blurEffect to 'none' and the bar becomes fully invisible).
  const iosTabBarProps = !isAndroid
    ? {
        blurEffect: isDark
          ? ('systemChromeMaterialDark' as const)
          : ('systemChromeMaterialLight' as const),
        backgroundColor: 'transparent' as const,
        disableTransparentOnScrollEdge: true,
        shadowColor: 'transparent' as const,
      }
    : {};

  // Android has no liquid glass; use a translucent surface so content peeks through.
  const androidTabBarProps = isAndroid
    ? {
        backgroundColor: isDark ? 'rgba(18, 18, 18, 0.88)' : 'rgba(255, 255, 255, 0.92)',
        labelVisibilityMode: (showLabels ? 'labeled' : 'unlabeled') as
          | 'labeled'
          | 'unlabeled',
        disableIndicator: true,
        iconColor: {
          default: theme.colors.onSurfaceVariant,
          selected: theme.colors.primary,
        },
      }
    : {};

  return (
    <NativeTabs
      tintColor={tintColor}
      labelStyle={labelStyle}
      // Keep the full tab bar always visible. iOS 26 minimize collapses
      // to a single floating selected-tab control (too aggressive vs Instagram).
      minimizeBehavior="never"
      {...iosTabBarProps}
      {...androidTabBarProps}
    >
      <NativeTabs.Trigger name="(dashboard)">
        <NativeTabs.Trigger.Label hidden={!showLabels}>
          {t('tabs.dashboard')}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          md="home"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="properties">
        <NativeTabs.Trigger.Label hidden={!showLabels}>
          {t('tabs.properties')}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'building.2', selected: 'building.2.fill' }}
          md="apartment"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="expenses">
        <NativeTabs.Trigger.Label hidden={!showLabels}>
          {t('tabs.expenses')}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'creditcard', selected: 'creditcard.fill' }}
          md="receipt_long"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="reports">
        <NativeTabs.Trigger.Label hidden={!showLabels}>
          {t('tabs.reports')}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }}
          md="bar_chart"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="me">
        <NativeTabs.Trigger.Label hidden={!showLabels}>
          {t('tabs.me')}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }}
          md="person"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
