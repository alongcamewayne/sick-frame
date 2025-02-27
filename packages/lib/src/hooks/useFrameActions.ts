'use client';

import { useMemo } from 'react';
import type { FrameSDK } from '@farcaster/frame-sdk/dist/types';
import { useFrameSdk } from './useFrameSdk';

type FrameActions = FrameSDK['actions'];

const ACTIONS: (keyof FrameActions)[] = [
	'addFrame',
	'close',
	'openUrl',
	'ready',
	'setPrimaryButton',
	'signIn',
	'swap',
	'viewProfile',
	'viewToken',
] as const;

function getWarningMessage(actionName: string) {
	return `🟡 Cannot call ${actionName}() before Frame SDK has been initialized.`;
}

export function useFrameActions() {
	const { sdk, isFrame } = useFrameSdk();

	const fallbackActions = useMemo(
		() =>
			Object.fromEntries(
				ACTIONS.map((name) => [
					name as keyof FrameActions,
					() => console.warn(getWarningMessage(name)),
				])
			) as unknown as FrameActions,
		[]
	);

	const sdkActions = useMemo(
		() =>
			Object.fromEntries(
				ACTIONS.map((name) => [
					name,
					(...args: unknown[]) => {
						return sdk ? (sdk.actions as any)[name](...args) : undefined;
					},
				])
			) as FrameActions,
		[sdk]
	);

	return useMemo(() => {
		if (!isFrame) return fallbackActions;
		return sdkActions;
	}, [isFrame, fallbackActions, sdkActions]);
}
