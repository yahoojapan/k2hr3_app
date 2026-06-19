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
import { errorType, warningType, infoType, MessageType, isMessageType } from './r3types';

export default class R3Message
{
	message: string | null;
	type: MessageType | null;

	constructor(message?: string, type: MessageType = infoType)
	{
		this.message	= null;
		this.type		= null;

		if(undefined !== message && null !== message && '' !== message){
			if(isMessageType(type)){
				this.type	= type;
			}else{
				console.warn('type parameter is wrong, thus force to set it information type.');
				this.type	= infoType;
			}
			this.message	= message;
		}
	}

	getMessage(): string | null
	{
		if(this.empty()){
			return null;
		}
		return this.message;
	}

	getMessageArray(): string[]
	{
		if(this.empty() || 'string' !== typeof this.message){
			return [];
		}
		return this.message!.split('\n');
	}

	setMessage(message: string, type: MessageType = infoType): boolean
	{
		if(undefined === message || null === message || '' === message){
			return false;
		}
		if(isMessageType(type)){
			this.type	= type;
		}else{
			console.warn('type parameter is wrong, thus force to set it information type.');
			this.type	= infoType;
		}
		this.message	= message;

		return true;
	}

	getType(): MessageType | null
	{
		return this.type;
	}

	getTypeString(): string
	{
		if(errorType === this.type){
			return 'ERROR';
		}else if(warningType === this.type){
			return 'WARNING';
		}else{
			return 'INFORMATION';
		}
	}

	setType(type: MessageType = infoType): boolean
	{
		if(undefined === this.message || null === this.message || '' === this.message){
			return false;
		}
		if(!isMessageType(type)){
			return false;
		}
		this.type = type;

		return true;
	}

	isErrorType(): boolean
	{
		return (errorType === this.type);
	}

	isWarningType(): boolean
	{
		return (warningType === this.type);
	}

	isInfoType(): boolean
	{
		return (infoType === this.type);
	}

	empty(): boolean
	{
		return (undefined === this.message || null === this.message || '' === this.message || undefined === this.type || null === this.type || !isMessageType(this.type));
	}

	clear(): void
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
