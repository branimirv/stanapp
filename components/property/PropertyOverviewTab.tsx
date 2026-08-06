import {
  ArrowDownToLine,
  MapPin,
  Plus,
  Users,
} from 'lucide-react-native';
import { memo, useMemo } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { PropertyRentCard } from '@/components/property/PropertyRentCard';
import { PropertyStats } from '@/components/property/PropertyStats';
import { SubPropertyList } from '@/components/property/SubPropertyList';
import { PROPERTY_SCENE_TOP_GAP } from '@/components/property/PropertyTabBar';
import { AppButton } from '@/components/ui/AppButton';
import { Typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily, Fonts } from '@/lib/fonts';
import type {
  Expense,
  ExpenseCategory,
  Language,
  Property,
  RentPayment,
  Tenant,
} from '@/types/app.types';
import { formatDate } from '@/utils/formatters';

export interface PropertyOverviewTabProps {
  property: Property;
  childProperties: Property[];
  isRented: boolean;
  canManage: boolean;
  isOwner: boolean;
  currency: string;
  language: Language;
  month: number;
  year: number;
  monthExpenses: Expense[];
  monthExpenseTotal: number;
  monthIncome: number;
  categoryMap: Map<string, ExpenseCategory>;
  rentPayment?: RentPayment;
  activeTenants: Tenant[];
  hasAnyExpenses: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onOpenAddress: () => void;
  onShowUsageHistory: () => void;
  onGoToRent: () => void;
  onGoToTenants: () => void;
  onViewAllExpenses: () => void;
  onOpenMembers: () => void;
  onSelectTenant: (tenantId: string) => void;
  onSelectExpense: (expenseId: string) => void;
  onMarkExpensePaid: (expenseId: string) => void;
  onRecordPayment: () => void;
  onAddExpense: () => void;
  contentTopInset?: number;
}

function PropertyOverviewTabComponent({
  property,
  childProperties,
  isRented,
  canManage,
  isOwner,
  currency,
  language,
  month,
  year,
  monthExpenseTotal,
  monthIncome,
  rentPayment,
  activeTenants,
  refreshing,
  onRefresh,
  onOpenAddress,
  onShowUsageHistory,
  onGoToRent,
  onGoToTenants,
  onOpenMembers,
  onSelectTenant,
  onRecordPayment,
  onAddExpense,
  contentTopInset = 0,
}: PropertyOverviewTabProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors, elevation, radius } = theme;
  const listTopPad = (contentTopInset || 0) + PROPERTY_SCENE_TOP_GAP;
  const tenantCount = activeTenants.length;

  const typeLabel = t(`propertyTypes.${property.type}`);

  const eyebrow = useMemo(() => {
    const parts = [typeLabel];
    if (property.floor != null) parts.push(t('properties.floorShort', { floor: property.floor }));
    if (property.area_sqm != null) {
      parts.push(t('properties.areaShort', { area: property.area_sqm }));
    }
    return parts.join(' · ');
  }, [property.area_sqm, property.floor, t, typeLabel]);

  const metaChip = useMemo(() => {
    const parts = [typeLabel];
    if (property.floor != null) parts.push(t('properties.floorShort', { floor: property.floor }));
    if (property.area_sqm != null) {
      parts.push(t('properties.areaShort', { area: property.area_sqm }));
    }
    return parts.join(' · ');
  }, [property.area_sqm, property.floor, t, typeLabel]);

  const usageChipStyle =
    property.usage_status === 'rented'
      ? { bg: colors.posTint, fg: colors.pos }
      : { bg: colors.surface2, fg: colors.muted };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: listTopPad,
          paddingHorizontal: theme.spacing.gutter,
          paddingBottom: theme.spacing.scrollBottom,
        },
      ]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.titleBlk}>
        <Text
          style={{
            fontFamily: Fonts.sans.semibold,
            fontSize: 11,
            letterSpacing: 1.54,
            textTransform: 'uppercase',
            color: colors.muted,
            marginBottom: 10,
          }}
        >
          {eyebrow}
        </Text>
        <Text
          style={{
            fontFamily: displayFontFamily(theme.name),
            fontSize: 40,
            lineHeight: 40,
            letterSpacing: -1,
            color: colors.fg,
          }}
          accessibilityRole="header"
        >
          {property.name}
        </Text>
      </View>

      <Pressable
        style={styles.addr}
        onPress={onOpenAddress}
        accessibilityRole="button"
        accessibilityLabel={t('properties.openInMaps')}
      >
        <MapPin size={14} color={colors.muted} strokeWidth={2} />
        <Text
          style={{
            flex: 1,
            fontFamily: Fonts.sans.regular,
            fontSize: Typography.text.body.size,
            color: colors.muted,
          }}
          numberOfLines={2}
        >
          {property.address}
        </Text>
      </Pressable>

      <View style={styles.chips}>
        <View style={[styles.chip, { backgroundColor: colors.surface2 }]}>
          <Text
            style={{
              fontFamily: Fonts.sans.semibold,
              fontSize: 11,
              color: colors.muted,
            }}
          >
            {metaChip}
          </Text>
        </View>
        <Pressable
          onPress={onShowUsageHistory}
          style={[styles.chip, { backgroundColor: usageChipStyle.bg }]}
          accessibilityRole="button"
          accessibilityLabel={t('properties.usageHistory')}
        >
          <Text
            style={{
              fontFamily: Fonts.sans.semibold,
              fontSize: 11,
              color: usageChipStyle.fg,
            }}
          >
            {t(`usageStatus.${property.usage_status}`)}
          </Text>
        </Pressable>
      </View>

      {isRented ? (
        <PropertyRentCard
          rentAmount={Number(property.rent_amount)}
          currency={currency}
          language={language}
          month={month}
          year={year}
          payment={rentPayment}
          onStatusPress={onGoToRent}
        />
      ) : null}

      <PropertyStats
        totalIncome={monthIncome}
        totalExpenses={monthExpenseTotal}
        tenantCount={tenantCount}
        currency={currency}
        language={language}
      />

      {isRented && canManage ? (
        <View style={styles.ctaRow}>
          <AppButton
            mode="contained"
            onPress={onRecordPayment}
            className="h-11 flex-1"
            accessibilityLabel={t('properties.recordPayment')}
          >
            <View style={styles.ctaInner}>
              <ArrowDownToLine size={18} color={colors.onPrimary} strokeWidth={2} />
              <Text
                style={{
                  fontFamily: Fonts.sans.semibold,
                  fontSize: 14,
                  color: colors.onPrimary,
                }}
              >
                {t('properties.recordPayment')}
              </Text>
            </View>
          </AppButton>
          <Pressable
            onPress={onAddExpense}
            accessibilityRole="button"
            accessibilityLabel={t('expenses.addNew')}
            style={[styles.plusBtn, { backgroundColor: colors.surface2 }]}
            hitSlop={4}
          >
            <Plus size={20} color={colors.fg} strokeWidth={2} />
          </Pressable>
        </View>
      ) : canManage ? (
        <View style={styles.ctaRow}>
          <AppButton
            mode="contained"
            onPress={onAddExpense}
            className="h-11 flex-1"
            accessibilityLabel={t('expenses.addNew')}
          >
            {t('expenses.addNew')}
          </AppButton>
        </View>
      ) : null}

      {isRented ? (
        <View style={styles.tenantsSec}>
          <Pressable onPress={onGoToTenants} accessibilityRole="button">
            <Text
              style={{
                fontFamily: displayFontFamily(theme.name),
                fontSize: 22,
                letterSpacing: -0.55,
                color: colors.fg,
                marginBottom: 11,
              }}
            >
              {t('tenants.title')}
            </Text>
          </Pressable>

          {activeTenants.length === 0 ? (
            <Text
              style={{
                fontFamily: Fonts.sans.regular,
                fontSize: 13,
                color: colors.muted,
              }}
            >
              {t('empty.noTenantsHint')}
            </Text>
          ) : (
            <View
              style={[
                styles.tenantCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.cardBd,
                  borderRadius: radius.xl,
                  ...elevation.card,
                },
              ]}
            >
              {activeTenants.map((tenant, index) => (
                <Pressable
                  key={tenant.id}
                  onPress={() => onSelectTenant(tenant.id)}
                  style={[
                    styles.lrow,
                    index > 0 ? { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.bd } : null,
                  ]}
                  accessibilityRole="button"
                >
                  <View style={[styles.lw, { backgroundColor: colors.surface2 }]}>
                    <Users size={18} color={colors.muted} strokeWidth={2} />
                  </View>
                  <View style={styles.lrowBody}>
                    <Text
                      style={{
                        fontFamily: Fonts.sans.semibold,
                        fontSize: Typography.text.listRow.size,
                        color: colors.fg,
                      }}
                      numberOfLines={1}
                    >
                      {`${tenant.first_name} ${tenant.last_name}`.trim()}
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.sans.semibold,
                        fontSize: Typography.text.chipSm.size,
                        letterSpacing: 0.8,
                        textTransform: 'uppercase',
                        color: colors.muted,
                        marginTop: 3,
                      }}
                    >
                      {t('properties.tenantSince', {
                        date: formatDate(tenant.contract_start, language),
                      })}
                    </Text>
                  </View>
                  <View style={[styles.chip, { backgroundColor: colors.posTint }]}>
                    <Text
                      style={{
                        fontFamily: Fonts.sans.semibold,
                        fontSize: 11,
                        color: colors.pos,
                      }}
                    >
                      {t('tenants.statusOk')}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      ) : null}

      {property.notes ? (
        <View
          style={[
            styles.notes,
            {
              backgroundColor: colors.surface,
              borderColor: colors.cardBd,
              borderRadius: radius.xl,
            },
          ]}
        >
          <Text style={{ fontFamily: Fonts.sans.regular, fontSize: 13, color: colors.muted }}>
            {property.notes}
          </Text>
        </View>
      ) : null}

      {childProperties.length > 0 ? <SubPropertyList properties={childProperties} /> : null}

      {isOwner ? (
        <Pressable
          onPress={onOpenMembers}
          style={[
            styles.membersRow,
            { backgroundColor: colors.surface2, borderRadius: radius.xl },
          ]}
          accessibilityRole="button"
          accessibilityLabel={t('members.title')}
        >
          <View style={[styles.lw, { backgroundColor: colors.surface3 }]}>
            <Users size={18} color={colors.muted} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: Fonts.sans.semibold,
                fontSize: 15,
                color: colors.fg,
              }}
            >
              {t('members.title')}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.sans.regular,
                fontSize: 12,
                color: colors.muted,
                marginTop: 2,
              }}
            >
              {t('members.overviewHint')}
            </Text>
          </View>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

export const PropertyOverviewTab = memo(PropertyOverviewTabComponent);

const styles = StyleSheet.create({
  content: {
    gap: 0,
  },
  titleBlk: {
    marginBottom: 12,
  },
  addr: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 16,
  },
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 999,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 22,
  },
  ctaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  plusBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tenantsSec: {
    marginBottom: 18,
  },
  tenantCard: {
    paddingHorizontal: 18,
    paddingVertical: 4,
    borderWidth: 1,
  },
  lrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 13,
  },
  lrowBody: {
    flex: 1,
    minWidth: 0,
  },
  lw: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notes: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 8,
  },
});
