/*
 *
 * K2HR3 Web Application
 *
 * Copyright 2022 Yahoo! Japan Corporation.
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
 * CREATE:   Tue Jul 5 2022
 * REVISION:
 *
 */

import React from 'react';

//
// Default(empty) common context for all components
//
// [NOTE]
// React 18 (MUI v5) can not use withTheme HOC function, and has to use
// React.createContext for creating common(global) context.
//
// [TODO]
// Currently, only common information data(r3Context) is set in this
// R3CommonContext, but it should be better to include Theme and Provider
// in the future.
// Since Theme and Provider are also transferred from the upper component
// to the child component, it seems appropriate to include them in this
// R3CommonContext.
// However, React and MUI are subject to frequent specification changes,
// so we will consider this after it stabilizes.
//
export const R3CommonContext = React.createContext({r3Context: {}});

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
