#!/bin/sh
#
# K2HR3 Web Application
#
# Copyright 2017 Yahoo Japan Corporation.
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

#==========================================================
# Common Variables
#==========================================================
PRGNAME=$(basename "$0")
SCRIPTDIR=$(dirname "$0")
SCRIPTDIR=$(cd "${SCRIPTDIR}" || exit 1; pwd)
SRCTOP=$(cd "${SCRIPTDIR}/.." || exit 1; pwd)

#
# Variables
#
CMDLINE_COMMAND="$0"
CMDLINE_PARAMETERS="$*"

LOCAL_HOSTNAME="$(hostname | tr -d '\n')"
PID_FILE_BASEDIR="/var/run/antpickax"
PID_FILE_TMPDIR="/tmp"

PROC_PID_BASENAME="${PRGNAME}.pid"
PROC_PID_FILE=""

#==============================================================
# Utility functions
#==============================================================
#
# Usage
#
PrintUsage()
{
	echo ""
	echo "Usage: $1 [--production(-prod) | --development(-dev)] [--stop(-s)] [--background(-bg)] [--foreground(-fg)] [--debug(-d) | --debug-nobrk(-dnobrk)] [--debuglevel(-dl) <custom debug level>]"
	echo ""
	echo "Option:"
	echo "         --production(-prod)      : [default] Set 'production' to NODE_ENV environment (this is default and exclusive with the '--development' option)"
	echo "         --development(-dev)      : Set 'development' to NODE_ENV environment (exclusive with the '--production' option)"
	echo "         --stop(-s)               : Stop www or watcher nodejs process"
	echo "         --background(-bg)        : Run process background"
	echo "         --foreground(-fg)        : Run process foreground (this takes precedence over --background(-bg) option)"
	echo "         --debug(-d)              : Run with nodejs inspector option"
	echo "         --debug-nobrk(-dnobrk)   : Run with nodejs inspector option (no break at start)"
	echo "         --debuglevel(-dl)        : Specify NODE_DEBUG environment value"
	echo ""
}

#
# Stop processes
#
stop_old_process()
{
	if [ -z "${PROC_PID_FILE}" ]; then
		#
		# Not initialize yet
		#
		return 0
	fi

	if [ ! -f "${PROC_PID_FILE}" ]; then
		return 0
	fi

	OLD_PID="$(tr -d '\n' < "${PROC_PID_FILE}")"

	if pgrep -f "${PRGNAME}" | grep -q "${OLD_PID}"; then
		#
		# Try to stop(HUP) process and child processes
		#
		OLD_CIHLD_PIDS="$(pgrep -P "${OLDPROCID}" | tr '\n' ' ')"
		if ! /bin/sh -c "kill -HUP ${OLD_PID} ${OLD_CIHLD_PIDS}" >/dev/null 2>&1; then
			echo "[WARNING] Failed to stop some old processes."
		fi
		sleep 1

		#
		# Check process is running yet
		#
		if pgrep -f "${PRGNAME}" | grep -q "${OLD_PID}"; then
			#
			# Try to stop(KILL) process and child processes
			#
			if ! /bin/sh -c "kill -KILL ${OLD_PID} ${OLD_CIHLD_PIDS}" >/dev/null 2>&1; then
				echo "[WARNING] Failed to retry stop some old processes."
			fi
			sleep 1

			#
			# Re-check process is running yet
			#
			if pgrep -f "${PRGNAME}" | grep -q "${OLD_PID}"; then
				echo "[ERROR] Could not stop old processes."
				return 1
			fi
		fi
		echo "[INFO] Stop old processes."
	fi
	rm -f "${PROC_PID_FILE}"

	return 0
}

#==========================================================
# Parse options and check environments
#==========================================================
NODE_ENV_VALUE=""
FOREGROUND=0
BACKGROUND=0
STOP_OLD_PROCESS=0
INSPECTOR_OPT=""
DEBUG_ENV_CUSTOM=""

while [ $# -ne 0 ]; do
	if [ -z "$1" ]; then
		break

	elif [ "$1" = "-h" ] || [ "$1" = "-H" ] || [ "$1" = "--help" ] || [ "$1" = "--HELP" ]; then
		PrintUsage "${PRGNAME}"
		exit 0

	elif [ "$1" = "prod" ] || [ "$1" = "-PROD" ] || [ "$1" = "--production" ] || [ "$1" = "--PRODUCTION" ]; then
		if [ -n "${NODE_ENV_VALUE}" ]; then
			echo "[ERROR] already specified --production(-prod) or --development(-dev) option"
			exit 1
		fi
		NODE_ENV_VALUE="production"

	elif [ "$1" = "-dev" ] || [ "$1" = "-DEV" ] || [ "$1" = "--development" ] || [ "$1" = "--DEVELOPMENT" ]; then
		if [ -n "${NODE_ENV_VALUE}" ]; then
			echo "[ERROR] already specified --production(-prod) or --development(-dev) option"
			exit 1
		fi
		NODE_ENV_VALUE="development"

	elif [ "$1" = "-bg" ] || [ "$1" = "-BG" ] || [ "$1" = "--background" ] || [ "$1" = "--BACKGROUND" ]; then
		#
		# Not check multi same option...
		#
		BACKGROUND=1

	elif [ "$1" = "--foreground" ] || [ "$1" = "--FOREGROUND" ] || [ "$1" = "-fg" ] || [ "$1" = "-FG" ]; then
		#
		# Not check multi same option...
		#
		FOREGROUND=1

	elif [ "$1" = "-s" ] || [ "$1" = "-S" ] || [ "$1" = "--stop" ] || [ "$1" = "--STOP" ]; then
		if [ "${STOP_OLD_PROCESS}" -ne 0 ]; then
			echo "[ERROR] already specified --stop(-s) option"
			exit 1
		fi
		STOP_OLD_PROCESS=1

	elif [ "$1" = "-d" ] || [ "$1" = "-D" ] || [ "$1" = "--debug" ] || [ "$1" = "--DEBUG" ]; then
		if [ -n "${INSPECTOR_OPT}" ]; then
			echo "[ERROR] already specified --debug(-d) or --debug-nobrk(-dnobrk) option"
			exit 1
		fi
		INSPECTOR_OPT="--inspect-brk=${LOCAL_HOSTNAME}:9229"

	elif [ "$1" = "-dnobrk" ] || [ "$1" = "-DNOBRK" ] || [ "$1" = "--debug-nobrk" ] || [ "$1" = "--DEBUG-NOBRK" ]; then
		if [ -n "${INSPECTOR_OPT}" ]; then
			echo "[ERROR] already specified --debug(-d) or --debug-nobrk(-dnobrk) option"
			exit 1
		fi
		INSPECTOR_OPT="--inspect=${LOCAL_HOSTNAME}:9229"

	elif [ "$1" = "-dl" ] || [ "$1" = "-DL" ] || [ "$1" = "--debuglevel" ] || [ "$1" = "--DEBUGLEVEL" ]; then
		shift
		if [ $# -eq 0 ]; then
			echo "[ERROR] --debuglevel(-dl) option needs parameter(custom debug level)"
			exit 1
		fi

		# [NOTE]
		# This option can be specified multiple times and the values are separated by commas.
		#
		if [ -n "${DEBUG_ENV_CUSTOM}" ]; then
			DEBUG_ENV_CUSTOM="${DEBUG_ENV_CUSTOM},"
		fi
		DEBUG_ENV_CUSTOM="${DEBUG_ENV_CUSTOM}$1"

	else
		echo "[WARNING] Unknown option $1 is specified, it is ignored."
	fi
	shift
done

#
# Check NODE_ENV_VALUE
#
if [ -z "${NODE_ENV_VALUE}" ]; then
	NODE_ENV_VALUE="production"
fi

#----------------------------------------------------------
# Set pid file varibales
#----------------------------------------------------------
#
# Check PID directory
#
if [ -d "${PID_FILE_BASEDIR}" ]; then
	PROC_PID_FILE="${PID_FILE_BASEDIR}/${PROC_PID_BASENAME}"
else
	PROC_PID_FILE="${PID_FILE_TMPDIR}/${PROC_PID_BASENAME}"
fi

#==========================================================
# Do work
#==========================================================
#
# Check run background
#
if [ "${BACKGROUND}" -eq 1 ] && [ "${FOREGROUND}" -eq 0 ]; then
	#
	# Run another process as child
	#
	"${CMDLINE_COMMAND}" "${CMDLINE_PARAMETERS}" -fg > /dev/null 2>&1 &
	exit 0
fi

#
# Stop old process if exists
#
if ! stop_old_process; then
	exit 1
fi
if [ "${STOP_OLD_PROCESS}" -eq 1 ]; then
	#
	# Only sto pole processes
	#
	exit 0
fi

#
# Push this process id to PID file
#
if ! echo "$$" > "${PROC_PID_FILE}"; then
	echo "[ERROR] Could create PID file(${PROC_PID_FILE}) and push this process PID."
	exit 1
fi

#
# Run
#
cd "${SRCTOP}" || exit 1

echo "***** RUN *****"
echo "NODE_PATH=${MY_NODE_PATH} NODE_ENV=${NODE_ENV_VALUE} NODE_DEBUG=${DEBUG_ENV_CUSTOM} node ${INSPECTOR_OPT} bin/www"
echo ""

EXIT_CODE=0
if ! NODE_PATH="${MY_NODE_PATH}" NODE_ENV="${NODE_ENV_VALUE}" NODE_DEBUG="${DEBUG_ENV_CUSTOM}" node "${INSPECTOR_OPT}" bin/www; then
	EXIT_CODE="$?"
	echo "[INFO] Process exited with exit code: $?"
fi

exit "${EXIT_CODE}"

#
# Local variables:
# tab-width: 4
# c-basic-offset: 4
# End:
# vim600: noexpandtab sw=4 ts=4 fdm=marker
# vim<600: noexpandtab sw=4 ts=4
#
