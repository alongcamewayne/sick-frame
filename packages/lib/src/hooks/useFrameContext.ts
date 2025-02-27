'use client';

import { useEffect, useState } from 'react';
import type { Context } from '@farcaster/frame-sdk';
import { useFrameSdk } from './useFrameSdk';

export function useFrameContext() {
	const { sdk } = useFrameSdk();
	const [context, setContext] = useState<Context.FrameContext>();

	useEffect(() => {
		sdk.context.then(setContext);
	}, [sdk]);

	return context;
}
