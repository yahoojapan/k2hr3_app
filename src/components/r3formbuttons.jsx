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
 * CREATE:   Thu Aug 24 2017
 * REVISION:
 *
 */

import React						from 'react';
import ReactDOM						from 'react-dom';						// eslint-disable-line no-unused-vars
import PropTypes					from 'prop-types';

import { withTheme, withStyles }	from '@material-ui/core/styles';		// decorator
import Button						from '@material-ui/core/Button';
import CheckCircleIcon				from '@material-ui/icons/CheckCircle';
import CancelIcon					from '@material-ui/icons/Cancel';

import { r3FormButtons }			from './r3styles';

//
// Form Button Class
//
@withTheme
@withStyles(r3FormButtons)
export default class R3FormButtons extends React.Component
{
	static contextTypes = {
		r3Context:	PropTypes.object.isRequired
	};

	static propTypes = {
		r3provider:	PropTypes.object.isRequired,
		status:		PropTypes.bool,
		onSave:		PropTypes.func.isRequired,
		onCancel:	PropTypes.func.isRequired
	};

	static defaultProps = {
		status:		false
	};

	constructor(props)
	{
		super(props);
	}

	render()
	{
		const { theme, classes, r3provider } = this.props;

		return (
			<div
				className={ classes.root }
			>
				<Button
					disabled={ !this.props.status }
					onClick={ (event) => this.props.onCancel(event) }
					{ ...theme.r3FormButtons.cancelButton }
					className={ classes.cancelButton }
				>
					{ r3provider.getR3TextRes().tResButtonCancel }
					<CancelIcon
						className={ classes.buttonIcon }
					/>
				</Button>
				<Button
					disabled={ !this.props.status }
					onClick={ (event) => this.props.onSave(event) }
					{ ...theme.r3FormButtons.saveButton }
					className={ classes.saveButton }
				>
					{ r3provider.getR3TextRes().tResButtonSave }
					<CheckCircleIcon
						className={ classes.buttonIcon }
					/>
				</Button>
			</div>
		);
	}
}

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
