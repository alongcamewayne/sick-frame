import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import sdk, { type Context, type ReadyOptions } from '@farcaster/frame-sdk/';
import type { FrameSDK } from '@farcaster/frame-sdk/dist/types';
import { registerFrameEventListeners } from './hooks/useFrameEvents';

export type FrameStore = {
	sdk: FrameSDK;
	isSdkLoaded: boolean;
	loadSdk: () => void;
	isLoading: boolean;
	onLoad?: (sdk: FrameSDK) => void;
	hasRunOnLoad: boolean;
	ready: () => void;
	deferReady: boolean;
	onReady?: (sdk: FrameSDK) => void;
	hasRunOnReady: boolean;
	context?: Context.FrameContext;
	options?: Partial<ReadyOptions>;
};

export const frameStore = create<FrameStore>()(
	immer((set, get) => ({
		sdk,
		isSdkLoaded: false,
		isLoading: false,
		onLoad: undefined,
		hasRunOnLoad: false,
		deferReady: false,
		onReady: undefined,
		hasRunOnReady: false,
		context: undefined,
		options: undefined,

		ready: () => {
			const { isSdkLoaded, options, onReady, hasRunOnReady, sdk } = get();

			if (!isSdkLoaded) {
				console.warn('🟡 Cannot call ready() before the SDK is loaded.');
				return;
			}

			if (hasRunOnReady) {
				console.warn('🟡 SDK can only be initialized with `ready()` once.');
				return;
			}

			try {
				sdk.actions.ready(options);
				onReady?.(sdk);

				// update hasRunOnReady to prevent redundant calls
				set({ hasRunOnReady: true });
			} catch (error) {
				console.error('🔴 Error in onReady callback:', error);
			}
		},

		loadSdk: async () => {
			if (get().isSdkLoaded || get().isLoading) return;
			set({ isLoading: true });

			try {
				set({
					isSdkLoaded: true,
					isLoading: false,
					context: await sdk.context,
				});

				registerFrameEventListeners(sdk);

				const storedOnLoad = get().onLoad;
				if (storedOnLoad && !get().hasRunOnLoad) {
					try {
						storedOnLoad(sdk);
						set({ hasRunOnLoad: true });
					} catch (error) {
						console.error('🔴 Error in onLoad callback:', error);
					}
				}

				// immediately call ready && onReady if deferReady was not explicitly set
				if (!get().deferReady) {
					sdk.actions.ready(get().options);

					const storedOnReady = get().onReady;
					if (storedOnReady && !get().hasRunOnReady) {
						try {
							storedOnReady(sdk);
							set({ hasRunOnReady: true });
						} catch (error) {
							console.error('🔴 Error in onReady callback:', error);
						}
					}
				}
			} catch (error) {
				console.error('🟡 Failed to load frame-sdk:', error);
				set({
					isSdkLoaded: false,
					context: undefined,
				});
			}
		},
	}))
);
