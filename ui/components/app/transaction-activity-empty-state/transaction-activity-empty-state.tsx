import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { twMerge } from '@metamask/design-system-react';
import { InternalAccount } from '@metamask/keyring-internal-api';
import { EthMethod } from '@metamask/keyring-api';
import { TabEmptyState } from '../../ui/tab-empty-state';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { useTheme } from '../../../hooks/useTheme';
import { getUseExternalServices } from '../../../selectors';
import { MetaMetricsSwapsEventSource } from '../../../../shared/constants/metametrics';
import useBridging from '../../../hooks/bridge/useBridging';

export type TransactionActivityEmptyStateProps = {
  /**
   * Additional className to apply to the component
   */
  className?: string;
  /**
   * The account to use for swap logic
   */
  account: InternalAccount;
};

export const TransactionActivityEmptyState: React.FC<
  TransactionActivityEmptyStateProps
> = ({ className, account }) => {
  const t = useI18nContext();
  const theme = useTheme();
  const isSigningEnabled =
    account.methods.includes(EthMethod.SignTransaction) ||
    account.methods.includes(EthMethod.SignUserOperation);
  const isExternalServicesEnabled = useSelector(getUseExternalServices);

  const { openBridgeExperience } = useBridging();

  // Theme-aware icon selection
  const activityIcon =
    theme === 'dark'
      ? './images/empty-state-activity-dark.png'
      : './images/empty-state-activity-light.png';

  const handleSwapOnClick = useCallback(async () => {
    openBridgeExperience(MetaMetricsSwapsEventSource.MainView, undefined, true);
  }, [openBridgeExperience]);

  return (
    <TabEmptyState
      icon={
        <img src={activityIcon} alt={t('activity')} width={72} height={72} />
      }
      description={t('activityEmptyDescription')}
      actionButtonText={t('swapTokens')}
      actionButtonProps={{
        isDisabled: !isSigningEnabled || !isExternalServicesEnabled,
      }}
      onAction={handleSwapOnClick}
      data-testid="activity-tab-empty-state"
      className={twMerge('max-w-48', className)}
    />
  );
};
