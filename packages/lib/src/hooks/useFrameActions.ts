'use client';

import { useMemo } from 'react';
import type { FrameStore } from '../store';
import { useFrameSdk } from './useFrameSdk';

export type FrameActions = FrameStore['sdk']['actions'];

const ACTIONS: (keyof FrameActions)[] = [
	'ready',
	'openUrl',
	'close',
	'setPrimaryButton',
	'addFrame',
	'signIn',
	'viewProfile',
] as const;

function getWarningMessage(actionName: string) {
	return `🟡 Cannot call ${actionName}() before Frame SDK has been initialized.`;
}

export function useFrameActions() {
	const { sdk, isSdkLoaded, ready } = useFrameSdk();

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
		if (!isSdkLoaded || !sdk) return fallbackActions;
		return { ...sdkActions, ready };
	}, [isSdkLoaded, sdk, fallbackActions, sdkActions, ready]);
}
