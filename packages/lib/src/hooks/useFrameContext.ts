'use client';

import { useEffect, useState } from 'react';
import type { Context } from '@farcaster/frame-sdk';
import { useFrameSdk } from './useFrameSdk';

const fallbackContext: Context.FrameContext = {
	client: { clientFid: 0, added: false },
	user: { fid: 0 },
};

export function useFrameContext() {
	const { sdk } = useFrameSdk();
	const [context, setContext] = useState<Context.FrameContext>(fallbackContext);

	useEffect(() => {
		async function checkContext() {
			const context = await sdk?.context;
			if (context) setContext(context);
			else setContext(fallbackContext);
		}

		checkContext();
	}, [sdk]);

	return context;
}
