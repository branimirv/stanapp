import { DynamicColorIOS, Platform } from 'react-native';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTranslation } from 'react-i18next';

import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useTabBarPreference } from '@/hooks/useTabBarPreference';

export default function TabLayout() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
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

  // Android NativeTabs follow Material dynamic colors (system theme), not Paper.
  // Pin bar chrome so dark app theme does not leave a white selected-only bar.
  const androidTabBarProps = isAndroid
    ? {
        backgroundColor: theme.colors.surface,
        labelVisibilityMode: (showLabels ? 'labeled' : 'unlabeled') as
          | 'labeled'
          | 'unlabeled',
        // No Material active-indicator pill behind the selected icon (iOS-like).
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
      minimizeBehavior="onScrollDown"
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
      <NativeTabs.Trigger name="properties" disableTransparentOnScrollEdge>
        <NativeTabs.Trigger.Label hidden={!showLabels}>
          {t('tabs.properties')}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'building.2', selected: 'building.2.fill' }}
          md="apartment"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="expenses" disableTransparentOnScrollEdge>
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
      <NativeTabs.Trigger name="me" disableTransparentOnScrollEdge>
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
