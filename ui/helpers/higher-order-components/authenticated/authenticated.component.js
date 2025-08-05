import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom-v5-compat';
import { UNLOCK_ROUTE, ONBOARDING_ROUTE } from '../../constants/routes';

const OnboardingRoute = { pathname: ONBOARDING_ROUTE };

export default function Authenticated(props) {
  const { isUnlocked, completedOnboarding, element } = props;
  const location = useLocation();

  switch (true) {
    case isUnlocked && completedOnboarding:
      return element;
    case !completedOnboarding:
      return <Navigate to={OnboardingRoute} replace />;
    default:
      return (
        <Navigate
          to={{ pathname: UNLOCK_ROUTE, state: { from: location } }}
          replace
        />
      );
  }
}

Authenticated.propTypes = {
  isUnlocked: PropTypes.bool,
  completedOnboarding: PropTypes.bool,
  element: PropTypes.element.isRequired,
};
