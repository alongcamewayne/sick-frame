'use client';

import { useEffect } from 'react';
import { useStore } from 'zustand';
import type { ReadyOptions } from '@farcaster/frame-sdk';
import type { FrameSDK } from '@farcaster/frame-sdk/dist/types';
import { frameStore } from '../store';
import { isEqual } from '../utils';

type UseFrameSdkParams = {
	deferReady?: boolean;
	options?: Partial<ReadyOptions>;
	onReady?: (sdk: FrameSDK) => void;
	onLoad?: (sdk: FrameSDK) => void;
};

export function useFrameSdk(params: UseFrameSdkParams = {}) {
	// subscribe to the store so that changes trigger re-renders
	const { isSdkLoaded, isLoading, ready, loadSdk, context, sdk } = useStore(
		frameStore,
		(state) => state
	);

	// update the store if parameters have changed
	useEffect(() => {
		frameStore.setState((state) => {
			if (params.deferReady !== undefined && state.deferReady !== params.deferReady) {
				state.deferReady = params.deferReady;
			}
			// only update options if they have changed
			if (params.options && !isEqual(state.options, params.options)) {
				state.options = params.options;
			}
			// only update onLoad if it hasn't been executed yet.
			if (!state.onLoad && params.onLoad) state.onLoad = params.onLoad;

			// only update onReady if it hasn't been executed yet.
			if (!state.onReady && params.onReady) state.onReady = params.onReady;
		});
	}, [params.deferReady, params.options, params.onReady, params.onLoad]);

	// load the SDK on mount if it isn't already loading/loaded
	useEffect(() => {
		if (!isSdkLoaded && !isLoading) loadSdk();
	}, [isSdkLoaded, isLoading, loadSdk]);

	return { isSdkLoaded, sdk, ready, context };
}
