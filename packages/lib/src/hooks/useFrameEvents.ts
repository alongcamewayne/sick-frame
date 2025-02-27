'use client';

import { useEffect, useRef } from 'react';
import mitt from 'mitt';
import type { EventMap, FrameSDK } from '@farcaster/frame-sdk/dist/types';
import { frameStore } from '../store';
import { useFrameSdk } from './useFrameSdk';

// assumes EventMap will only contain function with a single argument
type FirstArg<T> = T extends (arg: infer P, ...args: unknown[]) => unknown ? P : void;

// transforms eventName to onEventName and extracts the callback argument type
export type FrameEvents = {
	[E in keyof EventMap as `on${Capitalize<E & string>}`]: FirstArg<EventMap[E]>;
};

export type FrameEventHandlers = Partial<{
	[K in keyof FrameEvents]: (data: FrameEvents[K]) => void;
}>;

export const events = mitt<FrameEvents>();

export function registerFrameEventListeners(sdk: FrameSDK) {
	sdk.on('frameAdded', (data: FrameEvents['onFrameAdded']) => {
		frameStore.setState({ isFrameAdded: true });
		events.emit('onFrameAdded', { notificationDetails: data.notificationDetails });
	});

	sdk.on('frameAddRejected', (data: FrameEvents['onFrameAddRejected']) => {
		events.emit('onFrameAddRejected', { reason: data.reason });
	});

	sdk.on('frameRemoved', () => {
		frameStore.setState({ isFrameAdded: false });
		events.emit('onFrameRemoved');
	});

	sdk.on('notificationsEnabled', (data: FrameEvents['onNotificationsEnabled']) => {
		events.emit('onNotificationsEnabled', { notificationDetails: data.notificationDetails });
	});

	sdk.on('notificationsDisabled', () => {
		events.emit('onNotificationsDisabled');
	});

	sdk.on('primaryButtonClicked', () => {
		events.emit('onPrimaryButtonClicked');
	});
}

export function useFrameEvents(handlers: FrameEventHandlers) {
	const { isFrame } = useFrameSdk();
	const handlersRef = useRef(handlers);

	// keep ref up to date without triggering re-renders
	useEffect(() => {
		handlersRef.current = handlers;
	}, [handlers]);

	useEffect(() => {
		if (!isFrame) return;

		const eventEntries = Object.entries(handlersRef.current) as Array<
			[keyof FrameEvents, (data: unknown) => void]
		>;

		eventEntries.forEach(([event, handler]) => events.on(event, handler));

		return () => {
			eventEntries.forEach(([event, handler]) => events.off(event, handler));
		};
	}, [isFrame]);
}
