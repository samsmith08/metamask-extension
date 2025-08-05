import React from 'react';
import configureMockStore from 'redux-mock-store';
import { fireEvent, waitFor } from '@testing-library/react';
import thunk from 'redux-thunk';
import { renderWithProvider } from '../../../test/lib/render-helpers-navigate';
import { ONBOARDING_WELCOME_ROUTE } from '../../helpers/constants/routes';
import { FirstTimeFlowType } from '../../../shared/constants/onboarding';
import UnlockPage from '.';

// Mock navigation hooks for unit tests
const mockNavigate = jest.fn();
const mockLocation = {
  pathname: '/unlock',
  search: '',
  state: null,
};

jest.mock('react-router-dom-v5-compat', () => ({
  ...jest.requireActual('react-router-dom-v5-compat'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
  useParams: () => ({}),
}));

const mockTryUnlockMetamask = jest.fn(() => {
  return async () => {
    return Promise.resolve();
  };
});
const mockMarkPasswordForgotten = jest.fn();

jest.mock('../../store/actions.ts', () => ({
  ...jest.requireActual('../../store/actions.ts'),
  tryUnlockMetamask: () => mockTryUnlockMetamask,
  markPasswordForgotten: () => mockMarkPasswordForgotten,
}));

const mockElement = document.createElement('svg');

jest.mock('@metamask/logo', () => () => {
  return {
    container: mockElement,
    setFollowMouse: jest.fn(),
    stopAnimation: jest.fn(),
    lookAt: jest.fn(),
    lookAtAndRender: jest.fn(),
  };
});

describe('Unlock Page', () => {
  process.env.METAMASK_BUILD_TYPE = 'main';
  process.env.SEEDLESS_ONBOARDING_ENABLED = 'true';

  const mockState = {
    metamask: {},
  };
  const mockStore = configureMockStore([thunk])(mockState);

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset location mock to default
    mockLocation.pathname = '/unlock';
    mockLocation.search = '';
    mockLocation.state = null;
  });

  it('should match snapshot', () => {
    const { container } = renderWithProvider(<UnlockPage />, mockStore);

    expect(container).toMatchSnapshot();
  });

  it('changes password and submits', async () => {
    const props = {
      onSubmit: jest.fn(),
    };

    const { queryByTestId } = renderWithProvider(
      <UnlockPage {...props} />,
      mockStore,
    );

    const passwordField = queryByTestId('unlock-password');
    const loginButton = queryByTestId('unlock-submit');

    expect(passwordField).toBeInTheDocument();
    expect(passwordField).toHaveAttribute('type', 'password');
    expect(passwordField.nodeName).toBe('INPUT');
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toBeDisabled();

    fireEvent.change(passwordField, { target: { value: 'a-password' } });

    expect(loginButton).toBeEnabled();

    fireEvent.click(loginButton);

    expect(props.onSubmit).toHaveBeenCalled();
  });

  it('clicks imports seed button', () => {
    const mockStateNonUnlocked = {
      metamask: { completedOnboarding: true },
    };
    const store = configureMockStore([thunk])(mockStateNonUnlocked);
    const { getByText, getByTestId } = renderWithProvider(
      <UnlockPage />,
      store,
    );

    fireEvent.click(getByText('Forgot password?'));

    const resetPasswordButton = getByTestId('reset-password-modal-button');

    expect(resetPasswordButton).toBeInTheDocument();

    fireEvent.click(resetPasswordButton);

    expect(mockMarkPasswordForgotten).toHaveBeenCalled();
  });

  it('clicks use different login method button', async () => {
    const mockStateWithUnlock = {
      metamask: {
        firstTimeFlowType: FirstTimeFlowType.socialImport,
        completedOnboarding: false,
      },
    };
    const store = configureMockStore([thunk])(mockStateWithUnlock);

    const mockLoginWithDifferentMethod = jest.fn();
    const mockForceUpdateMetamaskState = jest.fn();

    const props = {
      loginWithDifferentMethod: mockLoginWithDifferentMethod,
      forceUpdateMetamaskState: mockForceUpdateMetamaskState,
    };

    const { queryByText } = renderWithProvider(
      <UnlockPage {...props} />,
      store,
    );

    fireEvent.click(queryByText('Use a different login method'));

    await waitFor(() => {
      expect(mockLoginWithDifferentMethod).toHaveBeenCalled();
      expect(mockForceUpdateMetamaskState).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith(ONBOARDING_WELCOME_ROUTE, {
        replace: true,
      });
    });
  });

  it('should redirect to history location when unlocked', () => {
    const intendedPath = '/previous-route';
    const mockStateWithUnlock = {
      metamask: { isUnlocked: true },
    };
    const store = configureMockStore([thunk])(mockStateWithUnlock);

    // Mock location with state
    mockLocation.state = { from: { pathname: intendedPath } };

    renderWithProvider(<UnlockPage />, store);

    expect(mockNavigate).toHaveBeenCalledWith(intendedPath);
  });

  it('should redirect to history location with search params', () => {
    const intendedPath = '/previous-route';
    const intendedSearch = '?param=value';
    const mockStateWithUnlock = {
      metamask: { isUnlocked: true },
    };
    const store = configureMockStore([thunk])(mockStateWithUnlock);

    // Mock location with state including search params
    mockLocation.state = {
      from: {
        pathname: intendedPath,
        search: intendedSearch,
      },
    };

    renderWithProvider(<UnlockPage />, store);

    expect(mockNavigate).toHaveBeenCalledWith(intendedPath + intendedSearch);
  });

  it('changes password, submits, and redirects to the specified route', async () => {
    const intendedPath = '/intended-route';
    const intendedSearch = '?abc=123';
    const mockStateNonUnlocked = {
      metamask: { isUnlocked: false },
    };
    const store = configureMockStore([thunk])(mockStateNonUnlocked);

    // Mock location with state
    mockLocation.state = {
      from: {
        pathname: intendedPath,
        search: intendedSearch,
      },
    };

    const { queryByTestId } = renderWithProvider(<UnlockPage />, store);

    const passwordField = queryByTestId('unlock-password');
    const loginButton = queryByTestId('unlock-submit');

    fireEvent.change(passwordField, { target: { value: 'a-password' } });
    fireEvent.click(loginButton);

    await Promise.resolve(); // Wait for async operations

    expect(mockTryUnlockMetamask).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(intendedPath + intendedSearch);
  });
});
