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
 * CREATE:   Thu Aug 24 2017
 * REVISION:
 *
 */

import React						from 'react';

import Button						from '@mui/material/Button';
import Box							from '@mui/material/Box';
import CheckCircleIcon				from '@mui/icons-material/CheckCircle';
import CancelIcon					from '@mui/icons-material/Cancel';

import R3Provider					from '../util/r3provider';
import type { R3Theme }				from './r3theme';
import { r3FormButtonsStyle }		from './r3styles';

//
// Props type
//
type R3FormButtonsRequiredProps = {
	theme:				R3Theme;
	r3provider:			R3Provider;
	onSave:				(event: React.MouseEvent<HTMLElement>) => void;
	onCancel:			(event: React.MouseEvent<HTMLElement>) => void;
};

type R3FormButtonsOptionProps = {
	status?:			boolean;
};

type R3FormButtonsProps = R3FormButtonsRequiredProps & R3FormButtonsOptionProps;

type R3FormButtonsStyleType = ReturnType<typeof r3FormButtonsStyle>;

//
// Form Button Class
//
export default class R3FormButtons extends React.Component<R3FormButtonsProps>
{
	sxClasses: R3FormButtonsStyleType;

	static defaultProps: R3FormButtonsOptionProps = {
		status:	false
	};

	constructor(props: R3FormButtonsProps)
	{
		super(props);

		// styles
		this.sxClasses = r3FormButtonsStyle(props.theme);
	}

	render()
	{
		const { theme, r3provider } = this.props;

		return (
			<Box
				sx={ this.sxClasses.root }
			>
				<Button
					disabled={ !this.props.status }
					onClick={ (event) => this.props.onCancel(event) }
					{ ...theme.r3FormButtons.cancelButton }
					sx={ this.sxClasses.cancelButton }
				>
					{ r3provider.getR3TextRes().tResButtonCancel }
					<CancelIcon
						sx={ this.sxClasses.buttonIcon }
					/>
				</Button>
				<Button
					disabled={ !this.props.status }
					onClick={ (event) => this.props.onSave(event) }
					{ ...theme.r3FormButtons.saveButton }
					sx={ this.sxClasses.saveButton }
				>
					{ r3provider.getR3TextRes().tResButtonSave }
					<CheckCircleIcon
						sx={ this.sxClasses.buttonIcon }
					/>
				</Button>
			</Box>
		);
	}
}

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
