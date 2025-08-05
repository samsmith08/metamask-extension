import React from 'react';
import {
  useNavigate,
  useLocation,
  useParams,
} from 'react-router-dom-v5-compat';

/**
 * Higher-order component that provides React Router v5-compat hooks as props
 * to class components or other components that can't use hooks directly.
 *
 * This is a replacement for the deprecated withRouter HOC.
 *
 * @param {React.Component} WrappedComponent - The component to wrap
 * @returns {React.Component} Component with navigate, location, and params props
 * @example
 * // Instead of:
 * export default withRouter(MyComponent);
 *
 * // Use:
 * export default withRouterHooks(MyComponent);
 */
function withRouterHooks(WrappedComponent) {
  function ComponentWithRouterHooks(props) {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();

    // Create history-like object for backward compatibility (optional)
    const history = {
      push: (path, state) => navigate(path, { state }),
      replace: (path, state) => navigate(path, { replace: true, state }),
      go: (delta) => navigate(delta),
      goBack: () => navigate(-1),
      goForward: () => navigate(1),
    };

    return (
      <WrappedComponent
        {...props}
        navigate={navigate}
        location={location}
        params={params}
        history={history} // For backward compatibility
      />
    );
  }

  // Preserve component name for debugging
  ComponentWithRouterHooks.displayName = `withRouterHooks(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return ComponentWithRouterHooks;
}

export default withRouterHooks;
