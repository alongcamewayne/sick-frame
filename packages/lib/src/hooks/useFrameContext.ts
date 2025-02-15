'use client';

import { useMemo } from 'react';
import { useFrameSdk } from './useFrameSdk';

export function useFrameContext() {
	const { context } = useFrameSdk();

	return useMemo(
		() => ({
			client: context?.client,
			user: context?.user,
			location: context?.location,
		}),
		[context]
	);
}
