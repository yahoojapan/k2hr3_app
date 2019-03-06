#!/bin/sh
#
# K2HR3 Web Application
#
# Copyright 2017 Yahoo! Japan Corporation.
#
# K2HR3 is K2hdkc based Resource and Roles and policy Rules, gathers
# common management information for the cloud.
# K2HR3 can dynamically manage information as "who", "what", "operate".
# These are stored as roles, resources, policies in K2hdkc, and the
# client system can dynamically read and modify these information.
#
# For the full copyright and license information, please view
# the license file that was distributed with this source code.
#
# AUTHOR:   Takeshi Nakatani
# CREATE:   Tue Aug 15 2017
# REVISION:
#

#
# Common
#
CMDLINE_PROCESS_NAME=$0
CMDLINE_ALL_PARAM=$@
PROGRAM_NAME=`basename ${CMDLINE_PROCESS_NAME}`
MYSCRIPTDIR=`dirname ${CMDLINE_PROCESS_NAME}`
MYSCRIPTDIR=`cd ${MYSCRIPTDIR}; pwd`
SRCTOP=`cd ${MYSCRIPTDIR}/..; pwd`
HOST=`hostname`
MYPROCIDFILE="/tmp/${PROGRAM_NAME}.pid"

#
# utility
#
stop_old_process()
{
	if [ -f ${MYPROCIDFILE} ]; then
		ps p `cat ${MYPROCIDFILE}` > /dev/null 2>&1
		if [ $? -eq 0 ]; then
			OLDPROCID=`cat ${MYPROCIDFILE}`
			kill -HUP ${OLDPROCID} `pgrep -d' ' -P ${OLDPROCID}` > /dev/null 2>&1
			if [ $? -ne 0 ]; then
				echo "[ERROR] could not stop old process."
				return 1
			fi
			echo "[INFO] old process pid file exists, then try to stop it."
		fi
	fi
	return 0
}

#
# node path
#
OS_NAME=`cat /etc/issue | head -1 | awk '{print $1}'`
if [ "X${OS_NAME}" = "XUbuntu" ]; then
	MY_NODE_PATH=""
elif [ "X${OS_NAME}" = "XCentOS" ]; then
	MY_NODE_PATH="/home/y/lib/node_modules:/home/y/lib64/node"
else
    echo "[ERROR] Unknown OS(should be Ubuntu or CentOS)."
    exit 1
fi

#
# Parse arguments
#
DEBUG_MODE="no"
DEBUG_ENV_CUSTOM=""
FOREGROUND=0
BACKGROUND=0
IS_STOP=0
NODE_ENV_VALUE="production"

OPTCOUNT=$#
while [ ${OPTCOUNT} -ne 0 ]; do
	if [ "X$1" = "X" ]; then
		break

	elif [ "X$1" = "X--help" -o "X$1" = "X--HELP" -o "X$1" = "X-h" -o "X$1" = "X-H" ]; then
		echo "${PROGRAM_NAME} [--production(default) | --development] [--debug(-d) | --debug-nobrk(-dnobrk)] [custom debug level(NODE_DEBUG environment)]"
		exit 0

	elif [ "X$1" = "X--background" -o "X$1" = "X--BACKGROUND" -o "X$1" = "X-bg" -o "X$1" = "X-BG" ]; then
		BACKGROUND=1

	elif [ "X$1" = "X--foreground" -o "X$1" = "X--FOREGROUND" -o "X$1" = "X-fg" -o "X$1" = "X-FG" ]; then
		FOREGROUND=1

	elif [ "X$1" = "X-stop" -o "X$1" = "X-STOP" ]; then
		IS_STOP=1

	elif [ "X$1" = "X--production" -o "X$1" = "X--PRODUCTION" ]; then
		NODE_ENV_VALUE="production"

	elif [ "X$1" = "X--development" -o "X$1" = "X--DEVELOPMENT" ]; then
		NODE_ENV_VALUE="development"

	elif [ "X$1" = "X--debug" -o "X$1" = "X--DEBUG" -o "X$1" = "X-d" -o "X$1" = "X-D" ]; then
		DEBUG_MODE="yes"
		DEBUG_OPTION="--inspect-brk=${HOST}:9229"

	elif [ "X$1" = "X--debug-nobrk" -o "X$1" = "X--DEBUG-NOBRK" -o "X$1" = "X-dnobrk" -o "X$1" = "X-DNOBRK" ]; then
		DEBUG_MODE="yes"
		DEBUG_OPTION="--inspect=${HOST}:9229"

	else
		if [ "X${DEBUG_ENV_CUSTOM}" != "X" ]; then
			DEBUG_ENV_CUSTOM="${DEBUG_ENV_CUSTOM},"
		fi
		DEBUG_ENV_CUSTOM="${DEBUG_ENV_CUSTOM}$1"
	fi

	OPTCOUNT=`expr ${OPTCOUNT} - 1`
	shift
done

#
# Check run background
#
if [ ${BACKGROUND} -eq 1 -a ${FOREGROUND} -eq 0 ]; then
	#
	# Run another process as child
	#
	${CMDLINE_PROCESS_NAME} ${CMDLINE_ALL_PARAM} -fg > /dev/null 2>&1 &
	exit 0
fi

#
# Stop old process if exists
#
stop_old_process
if [ $? -ne 0 ]; then
	exit $?
fi
if [ ${IS_STOP} -eq 1 ]; then
	exit 0
fi

#
# Push my process id
#
echo $$ > ${MYPROCIDFILE}

#
# Executing
#
cd ${SRCTOP}
echo "***** RUN *****"
	echo "NODE_PATH=${MY_NODE_PATH} NODE_ENV=${NODE_ENV_VALUE} NODE_DEBUG=${DEBUG_ENV_CUSTOM} node ${DEBUG_OPTION} bin/www"
echo ""
NODE_PATH=${MY_NODE_PATH} NODE_ENV=${NODE_ENV_VALUE} NODE_DEBUG=${DEBUG_ENV_CUSTOM} node ${DEBUG_OPTION} bin/www

#
# VIM modelines
#
# vim:set ts=4 fenc=utf-8:
#
