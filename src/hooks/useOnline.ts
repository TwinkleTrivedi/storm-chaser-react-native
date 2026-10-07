import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

/** Treat an unknown reachability flag as online so the first fetch is not skipped. */
export function useOnline(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected !== false;
      const reachable = state.isInternetReachable !== false;
      setOnline(connected && reachable);
    });
    return unsubscribe;
  }, []);

  return online;
}
