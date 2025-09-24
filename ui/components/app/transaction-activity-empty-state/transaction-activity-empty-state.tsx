import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { getNativeAssetForChainId } from '@metamask/bridge-controller';
import { twMerge } from '@metamask/design-system-react';
import { InternalAccount } from '@metamask/keyring-internal-api';
import { EthMethod } from '@metamask/keyring-api';
import { TabEmptyState } from '../../ui/tab-empty-state';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { useTheme } from '../../../hooks/useTheme';
import { PREPARE_SWAP_ROUTE } from '../../../helpers/constants/routes';
import { getCurrentChainId } from '../../../../shared/modules/selectors/networks';
import {
  getSwapsDefaultToken,
  getCurrentKeyring,
  getIsSwapsChain,
  getUseExternalServices,
} from '../../../selectors';
import { setSwapsFromToken } from '../../../ducks/swaps/swaps';
import { getIsMultichainAccountsState2Enabled } from '../../../selectors/multichain-accounts/feature-flags';
import { useMultichainSelector } from '../../../hooks/useMultichainSelector';
import { getMultichainNetwork } from '../../../selectors/multichain';
import { MultichainNetworks } from '../../../../shared/constants/multichain/networks';
import {
  getIsUnifiedUIEnabled,
  type BridgeAppState,
} from '../../../ducks/bridge/selectors';
import { isHardwareKeyring } from '../../../helpers/utils/hardware';
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
  const history = useHistory();
  const dispatch = useDispatch();
  const isSwapsChain = useSelector(getIsSwapsChain);
  const isSigningEnabled =
    account.methods.includes(EthMethod.SignTransaction) ||
    account.methods.includes(EthMethod.SignUserOperation);
  const isExternalServicesEnabled = useSelector(getUseExternalServices);

  const chainId = useSelector(getCurrentChainId);
  const defaultSwapsToken = useSelector((state) =>
    getSwapsDefaultToken(state, chainId),
  );
  const keyring = useSelector(getCurrentKeyring);
  const usingHardwareWallet = isHardwareKeyring(keyring?.type);

  // Multichain selectors
  const isMultichainAccountsState2Enabled = useSelector(
    getIsMultichainAccountsState2Enabled,
  );
  const { chainId: multichainChainId } = useMultichainSelector(
    getMultichainNetwork,
    account,
  );
  const isUnifiedUIEnabled = useSelector((state: BridgeAppState) =>
    getIsUnifiedUIEnabled(state, chainId),
  );

  const { openBridgeExperience } = useBridging();

  // Theme-aware icon selection
  const activityIcon =
    theme === 'dark'
      ? './images/empty-state-activity-dark.png'
      : './images/empty-state-activity-light.png';

  const handleBridgeOnClick = useCallback(
    async (isSwap: boolean) => {
      // Handle clicking from the wallet overview page
      openBridgeExperience(
        MetaMetricsSwapsEventSource.MainView,
        getNativeAssetForChainId(chainId),
        isSwap,
      );
    },
    [openBridgeExperience, chainId],
  );

  const handleSwapTokens = useCallback(async () => {
    // Match the exact logic from coin-buttons.tsx handleSwapOnClick
    if (isUnifiedUIEnabled) {
      handleBridgeOnClick(true);
      return;
    }
    if (multichainChainId === MultichainNetworks.SOLANA) {
      handleBridgeOnClick(true);
      return;
    }
    if (
      isMultichainAccountsState2Enabled &&
      chainId.toString() === MultichainNetworks.SOLANA
    ) {
      handleBridgeOnClick(true);
      return;
    }

    // Regular swap flow
    dispatch(setSwapsFromToken(defaultSwapsToken));
    if (usingHardwareWallet) {
      if (global.platform.openExtensionInBrowser) {
        global.platform.openExtensionInBrowser(PREPARE_SWAP_ROUTE);
      }
    } else {
      history.push(PREPARE_SWAP_ROUTE);
    }
  }, [
    isUnifiedUIEnabled,
    multichainChainId,
    isMultichainAccountsState2Enabled,
    chainId,
    handleBridgeOnClick,
    dispatch,
    defaultSwapsToken,
    usingHardwareWallet,
    history,
  ]);

  return (
    <TabEmptyState
      icon={
        <img src={activityIcon} alt={t('activity')} width={72} height={72} />
      }
      description={t('activityEmptyDescription')}
      actionButtonText={t('swapTokens')}
      actionButtonProps={{
        isDisabled:
          (!isSwapsChain && !isUnifiedUIEnabled) ||
          !isSigningEnabled ||
          !isExternalServicesEnabled,
      }}
      onAction={handleSwapTokens}
      data-testid="activity-tab-empty-state"
      className={twMerge('max-w-48', className)}
    />
  );
};
