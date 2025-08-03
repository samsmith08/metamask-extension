import { ROUTES, getPaths } from './routes';

describe('Routes Constants', () => {
  describe('ROUTES Array', () => {
    it('should be an array of AppRoute objects', () => {
      expect(Array.isArray(ROUTES)).toBe(true);
      expect(ROUTES.length).toBeGreaterThan(0);
    });

    it('should have all required properties for each route', () => {
      ROUTES.forEach((route) => {
        expect(route).toHaveProperty('path');
        expect(route).toHaveProperty('label');
        expect(route).toHaveProperty('trackInAnalytics');
        expect(typeof route.path).toBe('string');
        expect(typeof route.label).toBe('string');
        expect(typeof route.trackInAnalytics).toBe('boolean');
      });
    });

    it('should have unique paths', () => {
      const paths = ROUTES.map((route) => route.path);
      const uniquePaths = [...new Set(paths)];
      expect(paths.length).toBe(uniquePaths.length);
    });
  });

  describe('getPaths Function', () => {
    it('should return an array of strings', () => {
      const paths = getPaths();
      expect(Array.isArray(paths)).toBe(true);
      expect(paths.length).toBeGreaterThan(0);
      paths.forEach((path) => {
        expect(typeof path).toBe('string');
      });
    });

    it('should only return paths where trackInAnalytics is true', () => {
      const paths = getPaths();
      const trackingRoutes = ROUTES.filter((route) => route.trackInAnalytics);

      expect(paths.length).toBe(trackingRoutes.length);
      paths.forEach((path) => {
        const route = ROUTES.find((r) => r.path === path);
        expect(route?.trackInAnalytics).toBe(true);
      });
    });

    it('should be memoized (returns same reference for same input)', () => {
      const firstCall = getPaths();
      const secondCall = getPaths();
      expect(firstCall).toBe(secondCall);
    });
  });
});
