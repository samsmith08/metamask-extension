import React from 'react';
import { screen } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { InternalAccount } from '@metamask/keyring-internal-api';
import { renderWithProvider } from '../../../../test/jest';
import mockState from '../../../../test/data/mock-state.json';
import { ThemeType } from '../../../../shared/constants/preferences';
import {
  TransactionActivityEmptyState,
  type TransactionActivityEmptyStateProps,
} from './transaction-activity-empty-state';

const mockAccount: InternalAccount = {
  id: 'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3',
  address: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
  type: 'eip155:eoa',
  options: {},
  scopes: ['eip155:1'],
  methods: [
    'personal_sign',
    'eth_sign',
    'eth_signTransaction',
    'eth_signTypedData_v1',
    'eth_signTypedData_v3',
    'eth_signTypedData_v4',
  ],
  metadata: {
    name: 'Account 1',
    keyring: { type: 'HD Key Tree' },
    importTime: Date.now(),
  },
};

describe('TransactionActivityEmptyState', () => {
  const middleware = [thunk];

  const renderComponent = (
    props: Partial<TransactionActivityEmptyStateProps> = {},
    stateOverrides = {},
  ) => {
    const store = configureMockStore(middleware)({
      ...mockState,
      ...stateOverrides,
    });

    return renderWithProvider(
      <TransactionActivityEmptyState account={mockAccount} {...props} />,
      store,
    );
  };

  it('renders correctly', () => {
    renderComponent();
    expect(screen.getByTestId('activity-tab-empty-state')).toBeInTheDocument();
  });

  it('renders description text', () => {
    renderComponent();
    expect(
      screen.getByText('Nothing to see yet. Swap your first token today.'),
    ).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = renderComponent({ className: 'custom-class' });
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders light theme image by default', () => {
    renderComponent();
    const image = screen.getByAltText('Activity');
    expect(image).toHaveAttribute(
      'src',
      './images/empty-state-activity-light.png',
    );
  });

  it('renders dark theme image when dark theme is selected', () => {
    renderComponent(
      {},
      { metamask: { ...mockState.metamask, theme: ThemeType.dark } },
    );
    const image = screen.getByAltText('Activity');
    expect(image).toHaveAttribute(
      'src',
      './images/empty-state-activity-dark.png',
    );
  });
});
