/*
 *
 * K2HR3 Web Application
 *
 * Copyright 2017 Yahoo! Japan Corporation.
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
 * CREATE:   Fri Sep 1 2017
 * REVISION:
 *
 */

export const clientTypes = ((userAgent) => {
	/* eslint-disable indent, no-mixed-spaces-and-tabs */
	let	mobileType = {
		all: (
					(-1 != userAgent.indexOf('windows')	&& -1 != userAgent.indexOf('phone'))	||
					(-1 != userAgent.indexOf('android')	&& -1 != userAgent.indexOf('mobile'))	||
					(-1 != userAgent.indexOf('firefox')	&& -1 != userAgent.indexOf('mobile'))	||
					(-1 != userAgent.indexOf('iphone'))											||
					(-1 != userAgent.indexOf('ipod'))											||
					(-1 != userAgent.indexOf('blackberry'))
		),
		iPhone:		(-1 != userAgent.indexOf('iphone')),
		Android:	(-1 != userAgent.indexOf('android')	&& -1 != userAgent.indexOf('mobile'))
	};
	/* eslint-enable indent, no-mixed-spaces-and-tabs */

	/* eslint-disable indent, no-mixed-spaces-and-tabs */
	let	tabletType = (
					(-1 != userAgent.indexOf('windows')	&& -1 != userAgent.indexOf('touch'))	||
					(-1 != userAgent.indexOf('android')	&& -1 == userAgent.indexOf('mobile'))	||
					(-1 != userAgent.indexOf('firefox')	&& -1 != userAgent.indexOf('tablet'))	||
					(-1 != userAgent.indexOf('ipad'))											||
					(-1 != userAgent.indexOf('kindle'))											||
					(-1 != userAgent.indexOf('silk'))											||
					(-1 != userAgent.indexOf('playbook'))
				);
	/* eslint-enable indent, no-mixed-spaces-and-tabs */

	let	pcType =	(!mobileType.all && !tabletType);

	return {
		isMobile:	mobileType.all,
		mobiles:	mobileType,
		isTablet:	tabletType,
		isPC:		pcType
	};
})(window.navigator.userAgent.toLowerCase());

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
