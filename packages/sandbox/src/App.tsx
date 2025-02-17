import { useEffect } from 'react';
import { useFrameActions, useFrameContext, useFrameSdk } from 'sick-frame';

function randomString(length = 8) {
	return [...Array(length)]
		.map(() => Math.random().toString(36).charAt(2)) // charAt(2) ensures we get a valid character
		.join('');
}

function App() {
	const { isSdkLoaded } = useFrameSdk();
	const { user } = useFrameContext();
	const { signIn } = useFrameActions();

	useEffect(() => {
		console.log('isSdkLoaded', isSdkLoaded);
	}, [isSdkLoaded]);

	async function handleSignIn() {
		const result = await signIn({ nonce: randomString() });
		console.log(result);
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-white">
			<p>howdy, {user?.username ?? 'partner'}!</p>
			<button onClick={handleSignIn}>Sign in</button>
		</div>
	);
}

export default App;
