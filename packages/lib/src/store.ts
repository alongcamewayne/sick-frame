'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { FrameSDK } from '@farcaster/frame-sdk/dist/types';
import { registerFrameEventListeners } from './hooks/useFrameEvents';

export type FrameStore = {
	sdk: FrameSDK | undefined;
	isSdkLoaded: boolean;
	loadSdk: () => void;
	isLoading: boolean;
	onLoad?: (sdk: FrameSDK) => Promise<void>;
	hasRunOnLoad: boolean;
	deferReady: boolean;
	isFrame: boolean;
	isFrameAdded: boolean;
};

export const frameStore = create<FrameStore>()(
	immer((set, get) => ({
		sdk: undefined,
		isSdkLoaded: false,
		isLoading: false,
		onLoad: undefined,
		hasRunOnLoad: false,
		deferReady: false,
		isFrame: false,
		isFrameAdded: false,

		loadSdk: async () => {
			if (get().isSdkLoaded || get().isLoading) return;
			set({ isLoading: true });

			try {
				// check if running in browser
				if (typeof window === 'undefined') {
					console.warn('Frame SDK can only be loaded in a browser environment.');
					set({ isSdkLoaded: false, isLoading: false });
					return;
				}

				// import sdk
				const importedSdk = (await import('@farcaster/frame-sdk')).default as unknown as FrameSDK;
				const context = await importedSdk.context;

				// if no context is available, the sdk is not running in a frame
				if (!context) {
					console.warn('Frame SDK has been loaded, but no context is available.');
					set({ isSdkLoaded: true, isLoading: false });
					return;
				}

				set({
					sdk: importedSdk,
					isSdkLoaded: true,
					isFrame: true,
					isFrameAdded: context.client.added ?? false,
				});

				registerFrameEventListeners(importedSdk);

				// call onLoad callback if it exists
				const storedOnLoad = get().onLoad;
				if (storedOnLoad && !get().hasRunOnLoad) {
					try {
						await storedOnLoad(importedSdk);
						set({ hasRunOnLoad: true, isLoading: false });
					} catch (error) {
						console.error('🔴 Error in onLoad callback:', error);
						set({ hasRunOnLoad: false, isLoading: false });
						return;
					}
				}

				// immediately call ready if deferReady was not explicitly set
				if (!get().deferReady) importedSdk.actions.ready();
			} catch (error) {
				console.error('🟡 Failed to load Frame SDK:', error);
				set({ isSdkLoaded: false, isLoading: false, isFrame: false });
			}
		},
	}))
);
