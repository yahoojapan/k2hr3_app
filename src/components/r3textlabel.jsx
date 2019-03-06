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
 * CREATE:   Tue Aug 15 2017
 * REVISION:
 *
 */

import React			from 'react';
import ReactDOM			from 'react-dom';									// eslint-disable-line no-unused-vars
import PropTypes		from 'prop-types';

import { r3ObjMerge }	from '../util/r3util';

//
// Text Label Class
//
export default class R3TextLabel extends React.Component
{
	constructor(props)
	{
		super(props);
	}

	render()
	{
		let	strRadius	= String(this.props.radiusSize) + 'px';
		let	strPadding	= String(this.props.paddingWidth) + 'px ' + String(this.props.paddingHeight) + 'px';
		let	backColor	= this.context.muiTheme.palette.primary1Color;
		let	textColor	= this.context.muiTheme.palette.primary3Color;

		let	labelStyle	= {
			borderRadius:		strRadius,
			MozBorderRadius:	strRadius,
			WebkitBorderRadius:	strRadius,
			border:				0,
			padding:			strPadding,
			backgroundColor:	backColor,
			color:				textColor,
			fontWeight:			'bold'
		};
		if(undefined !== this.props.style && null !== this.props.style){
			labelStyle = r3ObjMerge(labelStyle, this.props.style);
		}

		return (
			<span style={ labelStyle }>{ this.props.text }</span>
		);
	}
}

R3TextLabel.contextTypes = {
	muiTheme:			PropTypes.object.isRequired
};

R3TextLabel.propTypes = {
	text:				PropTypes.string,
	radiusSize:			PropTypes.number,
	paddingWidth:		PropTypes.number,
	paddingHeight:		PropTypes.number,
	style:				PropTypes.object
};

R3TextLabel.defaultProps = {
	text:				'',
	radiusSize:			20,
	paddingWidth:		6,
	paddingHeight:		12
};

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
