import { useContext } from 'react';
import { TrackerContext } from './TrackerContext';

export function useTracker() {
  return useContext(TrackerContext);
}
