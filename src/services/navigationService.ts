// src/services/navigationService.ts
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    try {
      navigationRef.navigate(name as never, params as never);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  } else {
    console.warn('Navigation not ready');
  }
}

export function reset(routeName: string) {
  if (navigationRef.isReady()) {
    try {
      navigationRef.reset({
        index: 0,
        routes: [{ name: routeName as never }],
      });
    } catch (error) {
      console.error('Navigation reset error:', error);
    }
  } else {
    console.warn('Navigation not ready for reset');
  }
}

export default {
  navigationRef,
  navigate,
  reset,
};