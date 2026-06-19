/*
 *
 * K2HR3 Web Application
 *
 * Copyright 2017 Yahoo Japan Corporation.
 *
 * K2HR3 is K2hdkc based Resource and Roles and policy Rules, gathers
 * common management information for the cloud.
 * K2HR3 can dynamically manage information as "who", "what", "operate".
 * These are stored as roles, resources, policies in K2hdkc, and the
 * client system can dynamically read and modify these information.
 *
 * For the full copyright and license information, please view
 * the license file that was distributed with this source code.
 *
 * AUTHOR:   Takeshi Nakatani
 * CREATE:   Wed May 14 2026
 * REVISION:
 *
 */

declare module 'react-test-context-provider' {
	import { ReactElement } from 'react';
	function getElementWithContext(context: Record<string, unknown>, element: ReactElement): ReactElement;
	export default getElementWithContext;
}

declare module 'react-test-renderer' {
	interface ReactTestRendererJSON {
		type: string;
		props: Record<string, unknown>;
		children: (ReactTestRendererJSON | string)[] | null;
	}

	interface ReactTestRenderer {
		toJSON(): ReactTestRendererJSON | null;
		toTree(): unknown;
		unmount(): void;
		getInstance(): unknown;
		update(element: React.ReactElement): void;
	}

	interface CreateOptions {
		createNodeMock?: (element: unknown) => unknown;
	}

	const renderer: {
		create(element: React.ReactElement, options?: CreateOptions): ReactTestRenderer;
		act(callback: () => void | Promise<void>): void;
	};

	export default renderer;
}

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
