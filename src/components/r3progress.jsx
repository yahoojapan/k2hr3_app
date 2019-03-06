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
 * CREATE:   Fri Dec 1 2017
 * REVISION:
 *
 */

import React			from 'react';
import ReactDOM			from 'react-dom';									// eslint-disable-line no-unused-vars
import PropTypes		from 'prop-types';

import Paper			from 'material-ui/Paper';
import CircularProgress	from 'material-ui/CircularProgress';

//
// Progress Modal Class
//
export default class R3Progress extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state = {
			open:	false
		};

		// internal data
		this.displayCounter		= 0;

		// Binding
		this.handleDisplay		= this.handleDisplay.bind(this);
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
		if(!this.state.open){
			return null;
		}

		let	paperchild = (
			<div>
				<CircularProgress
					color={ this.context.muiTheme.palette.accent1Color }
					thickness={ 7 }
					style={ this.context.muiTheme.r3progress.circularProgressStyle }
				/>
			</div>
		);

		return (
			<Paper
				style={ this.context.muiTheme.r3progress.pageStyle }
				zDepth={ 0 }
				children={ paperchild }
			/>
		);
	}
}

R3Progress.contextTypes = {
	muiTheme:		PropTypes.object.isRequired,
};

R3Progress.propTypes = {
	onClose:		PropTypes.func
};

R3Progress.defaultProps = {
	onClose:		null
};

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
