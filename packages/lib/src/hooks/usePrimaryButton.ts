'use client';

import { useFrameActions } from './useFrameActions';
import { useFrameEvents, type FrameEventHandlers } from './useFrameEvents';

type UsePrimaryButtonArgs = {
	onButtonClicked?: FrameEventHandlers['onPrimaryButtonClicked'];
};

export function usePrimaryButton(handlers: UsePrimaryButtonArgs = {}) {
	const { setPrimaryButton } = useFrameActions();

	useFrameEvents({
		onPrimaryButtonClicked: handlers.onButtonClicked,
	});

	return { setPrimaryButton };
}
