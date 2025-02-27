'use client';

import { useEffect } from 'react';
import { useStore } from 'zustand';
import type { FrameSDK } from '@farcaster/frame-sdk/dist/types';
import { frameStore } from '../store';

type UseFrameSdkParams = {
	deferReady?: boolean;
	onLoad?: (sdk: FrameSDK) => Promise<void>;
};

export function useFrameSdk(params: UseFrameSdkParams = {}) {
	// subscribe to the store so that changes trigger re-renders
	const { isSdkLoaded, isLoading, isFrame, isFrameAdded, loadSdk, context, sdk } = useStore(
		frameStore,
		(state) => state
	);

	// update the store if parameters have changed
	useEffect(() => {
		frameStore.setState((state) => {
			if (params.deferReady !== undefined && state.deferReady !== params.deferReady) {
				state.deferReady = params.deferReady;
			}

			// only update onLoad if it hasn't been executed yet.
			if (!state.onLoad && params.onLoad) state.onLoad = params.onLoad;
		});
	}, [params.deferReady, params.onLoad]);

	// load the SDK on mount if it isn't already loading/loaded
	useEffect(() => {
		if (!isSdkLoaded && !isLoading) loadSdk();
	}, [isSdkLoaded, isLoading, loadSdk]);

	return { isFrame, isFrameAdded, sdk, context };
}
