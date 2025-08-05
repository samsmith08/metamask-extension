import React from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom-v5-compat';
import { ONBOARDING_ROUTE } from '../../constants/routes';

const onboardingRoute = { pathname: ONBOARDING_ROUTE };

export default function Initialized(props) {
  const { completedOnboarding, element } = props;
  return completedOnboarding ? (
    element
  ) : (
    <Navigate to={onboardingRoute} replace />
  );
}

Initialized.propTypes = {
  completedOnboarding: PropTypes.bool,
  element: PropTypes.element.isRequired,
};
