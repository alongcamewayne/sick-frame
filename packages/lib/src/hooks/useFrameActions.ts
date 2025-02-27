'use client';

import { useMemo } from 'react';
import type { FrameSDK } from '@farcaster/frame-sdk/dist/types';
import { useFrameSdk } from './useFrameSdk';

type FrameActions = FrameSDK['actions'];

function getWarningMessage(actionName: string) {
	return `🟡 Cannot call ${actionName}() before Frame SDK has been initialized.`;
}

export function useFrameActions() {
	const { sdk, isFrame } = useFrameSdk();
	const actionKeys = useMemo(() => Object.keys({} as FrameActions) as (keyof FrameActions)[], []);

	const fallbackActions = useMemo(
		() =>
			Object.fromEntries(
				actionKeys.map((name) => [name, () => console.warn(getWarningMessage(name))])
			) as unknown as FrameActions,
		[actionKeys]
	);

	const sdkActions = useMemo(
		() =>
			Object.fromEntries(
				actionKeys.map((name) => [
					name,
					(...args: unknown[]) => (sdk ? (sdk.actions as any)[name](...args) : undefined),
				])
			) as FrameActions,
		[sdk, actionKeys]
	);

	return useMemo(() => {
		if (!isFrame) return fallbackActions;
		return sdkActions;
	}, [isFrame, fallbackActions, sdkActions]);
}
