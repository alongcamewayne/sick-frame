'use client';

import { useEffect, useState } from 'react';
import type { SafeAreaInsets } from '@farcaster/frame-core/dist/context';
import { useFrameContext } from './useFrameContext';

const defaultSafeArea: SafeAreaInsets = {
	top: 0,
	right: 0,
	bottom: 0,
	left: 0,
};

export function useSafeArea() {
	const { client } = useFrameContext();
	const [safeArea, setSafeArea] = useState<SafeAreaInsets>(defaultSafeArea);

	useEffect(() => {
		async function checkSafeArea() {
			if (client?.safeAreaInsets) setSafeArea(client.safeAreaInsets);
		}

		checkSafeArea();
	}, [client]);

	return safeArea;
}
