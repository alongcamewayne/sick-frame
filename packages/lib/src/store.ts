import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import sdk, { type Context } from '@farcaster/frame-sdk/';
import type { FrameSDK } from '@farcaster/frame-sdk/dist/types';
import { registerFrameEventListeners } from './hooks/useFrameEvents';

export type FrameStore = {
	sdk: FrameSDK;
	isSdkLoaded: boolean;
	loadSdk: () => void;
	isLoading: boolean;
	onLoad?: (sdk: FrameSDK) => Promise<void>;
	hasRunOnLoad: boolean;
	deferReady: boolean;
	context?: Context.FrameContext;
	isFrame: boolean;
	isFrameAdded: boolean;
};

export const frameStore = create<FrameStore>()(
	immer((set, get) => ({
		sdk,
		isSdkLoaded: false,
		isLoading: false,
		onLoad: undefined,
		hasRunOnLoad: false,
		deferReady: false,
		context: undefined,
		isFrame: false,
		isFrameAdded: false,

		loadSdk: async () => {
			if (get().isSdkLoaded || get().isLoading) return;
			set({ isLoading: true });

			try {
				const context = await sdk.context;

				// if no context is available, the sdk is not running in a frame
				if (!context) {
					console.warn('Frame SDK has been loaded, but no context is available.');
					set({ isSdkLoaded: true, isLoading: false });
					return;
				}

				set({
					context,
					isSdkLoaded: true,
					isFrame: true,
					isFrameAdded: context.client.added ?? false,
				});

				registerFrameEventListeners(sdk);

				// call onLoad callback if it exists
				const storedOnLoad = get().onLoad;
				if (storedOnLoad && !get().hasRunOnLoad) {
					try {
						await storedOnLoad(sdk);
						set({ hasRunOnLoad: true });
					} catch (error) {
						console.error('🔴 Error in onLoad callback:', error);
						set({ hasRunOnLoad: false, isLoading: false });
						return;
					}
				}

				// immediately call ready if deferReady was not explicitly set
				if (!get().deferReady) sdk.actions.ready();
				set({ isLoading: false });
			} catch (error) {
				console.error('🟡 Failed to load Frame SDK:', error);
				set({ isSdkLoaded: false, isLoading: false, context: undefined, isFrame: false });
			}
		},
	}))
);
