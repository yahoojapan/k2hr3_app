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
 * CREATE:   Fri Dec 1 2017
 * REVISION:
 *
 */

import React						from 'react';
import ReactDOM						from 'react-dom';						// eslint-disable-line no-unused-vars
import PropTypes					from 'prop-types';

import Paper						from '@mui/material/Paper';
import CircularProgress				from '@mui/material/CircularProgress';

import { r3Progress }				from './r3styles';

//
// Progress Modal Class
//
export default class R3Progress extends React.Component
{
	// [NOTE]
	// It corresponds with Callback function without using ForwardRef.
	// Please correct it when using ForwardRef in the future.
	//
	static propTypes = {
		cbRefRegister:	PropTypes.func,
		onClose:		PropTypes.func
	};

	static defaultProps = {
		cbRefRegister:	null,
		onClose:		null
	};

	state = {
		open:			false
	};

	displayCounter		= 0;			// internal data

	constructor(props)
	{
		super(props);

		// Binding(do not define handlers as arrow functions for performance)
		this.handleDisplay = this.handleDisplay.bind(this);

		if(this.props.cbRefRegister){
			this.props.cbRefRegister(this.handleDisplay);
		}

		// styles
		this.sxClasses = r3Progress(props.theme);
	}

	handleDisplay(isDisplay)
	{
		if(isDisplay){
			++(this.displayCounter);
		}else{
			if(0 < this.displayCounter){
				--(this.displayCounter);
				if(0 === this.displayCounter && null !== this.props.onClose){
					this.props.onClose();
				}
			}
		}

		this.setState({
			open:	(0 < this.displayCounter)
		});
	}

	render()
	{
		const { theme } = this.props;

		if(!this.state.open){
			return null;
		}

		return (
			<Paper
				{ ...theme.r3progress.root }
				sx={ this.sxClasses.root }
			>
				<CircularProgress
					{ ...theme.r3progress.circularProgress }
					sx={ this.sxClasses.circularProgress }
				/>
			</Paper>
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
