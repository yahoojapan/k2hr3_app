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
 * CREATE:   Thu Aug 31 2017
 * REVISION:
 *
 */

// Types
import { errorType, warningType, infoType } from './r3types';

export default class R3Message
{
	constructor(message, type = infoType)
	{
		this.message	= null;
		this.type		= null;

		if(undefined !== message && null !== message && '' !== message){
			if(undefined === type || null === type || (errorType !== type && warningType !== type && infoType !== type)){
				console.warn('type parameter is wrong, thus force to set it information type.');
				type = infoType;
			}
			this.message	= message;
			this.type		= type;
		}
	}

	getMessage()
	{
		if(this.empty()){
			return null;
		}
		return this.message;
	}

	getMessageArray()
	{
		if(this.empty()){
			return [];
		}
		return this.message.split('\n');
	}

	setMessage(message, type = infoType)
	{
		if(undefined === message || null === message || '' === message){
			return false;
		}
		if(undefined === type || null === type || (errorType !== type && warningType !== type && infoType !== type)){
			console.warn('type parameter is wrong, thus force to set it information type.');
			type = infoType;
		}
		this.message	= message;
		this.type		= type;

		return true;
	}

	getType()
	{
		return this.type;
	}

	getTypeString()
	{
		if(errorType === this.type){
			return 'ERROR';
		}else if(warningType === this.type){
			return 'WARNING';
		}else{	// infoType === this.type
			return 'INFORMATION';
		}
	}

	setType(type = infoType)
	{
		if(undefined === this.message || null === this.message || '' === this.message){
			return false;
		}
		if(undefined === type || null === type || (errorType !== type && warningType !== type && infoType !== type)){
			return false;
		}
		this.type = type;

		return true;
	}

	isErrorType()
	{
		return (errorType === this.type);
	}

	isWarningType()
	{
		return (warningType === this.type);
	}

	isInfoType()
	{
		return (infoType === this.type);
	}

	empty()
	{
		return (undefined === this.message || null === this.message || '' === this.message || undefined === this.type || null === this.type || (errorType !== this.type && warningType !== this.type && infoType !== this.type));
	}

	clear()
	{
		this.message	= null;
		this.type		= null;
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
