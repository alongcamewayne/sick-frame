'use client';

import { useStore } from 'zustand';
import { frameStore } from '../store';

export function useFrameContext() {
	const { context } = useStore(frameStore, (state) => state);
	return context;
}
