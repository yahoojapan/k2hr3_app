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

PRGNAME_PREFIX=$(echo "${PRGNAME}" | sed -e 's#\.sh.*$##g')
PROC_PID_BASENAME="k2hr3pp-${PRGNAME_PREFIX}.pid"
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
	echo "Usage:   $1 [--production(-prod) | --development(-dev)]"
	echo "            [--stop(-s)]"
	echo "            [--background(-bg) | --foreground(-fg)]"
	echo "            [--debug(-d) | --debug-nobrk(-dnobrk)]"
	echo "            [--debuglevel(-dl) <custom debug level>]"
	echo ""
	echo "Option:"
	echo "         --production(-prod)    : [default] Set 'production' to NODE_ENV environment (this is default and exclusive with the '--development' option)"
	echo "         --development(-dev)    : Set 'development' to NODE_ENV environment (exclusive with the '--production' option)"
	echo "         --stop(-s)             : Stop www or watcher nodejs process"
	echo "         --background(-bg)      : Run process background"
	echo "         --foreground(-fg)      : Run process foreground (this takes precedence over --background(-bg) option)"
	echo "         --debug(-d)            : Run with nodejs inspector option"
	echo "         --debug-nobrk(-dnobrk) : Run with nodejs inspector option (no break at start)"
	echo "         --debuglevel(-dl)      : Specify NODE_DEBUG environment value"
	echo ""
}

#
# Using ALL_CHILD_PIDS global variable
#
get_all_pid_list()
{
	if [ -z "${ALL_CHILD_PIDS}" ]; then
		return 0
	fi
	_ADD_PIDS=0
	for _ONE_PID in ${ALL_CHILD_PIDS}; do
		if _CIHLD_PIDS=$(pgrep -P "${_ONE_PID}"); then
			for _ONE_CPID in ${_CIHLD_PIDS}; do
				_FOUND_PID=0
				for _ONE_PPID in ${ALL_CHILD_PIDS}; do
					if [ "${_ONE_CPID}" = "${_ONE_PPID}" ]; then
						_FOUND_PID=1
						break
					fi
				done
				if [ "${_FOUND_PID}" -eq 0 ]; then
					#
					# Add child PID
					#
					ALL_CHILD_PIDS="${ALL_CHILD_PIDS} ${_ONE_CPID}"
					_ADD_PIDS=1
				fi
			done
		fi
	done
	if [ "${_ADD_PIDS}" -eq 1 ]; then
		#
		# Reentrant for check adding PIDs
		#
		get_all_pid_list
	fi
	return 0
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

	ALL_CHILD_PIDS="$(tr -d '\n' < "${PROC_PID_FILE}")"

	if pgrep -f "${PRGNAME}" | grep -q "${ALL_CHILD_PIDS}"; then
		#
		# List up all chid processes
		#
		get_all_pid_list

		#
		# Try to stop(HUP) process and child processes
		#
		for _ONE_PID in ${ALL_CHILD_PIDS}; do
			kill -HUP "${_ONE_PID}" >/dev/null 2>&1
		done
		sleep 1

		#
		# If processes are running yet, try to kill it.
		#
		for _ONE_PID in ${ALL_CHILD_PIDS}; do
			# shellcheck disable=SC2009
			if ( ps -o pid,stat ax 2>/dev/null | grep -v 'PID' | awk '$2~/^[^Z]/ { print $1 }' | grep -q "^${_ONE_PID}$" || exit 1 && exit 0 ); then
				kill -KILL "${_ONE_PID}" >/dev/null 2>&1
			fi
		done
		sleep 1

		#
		# Result
		#
		for _ONE_PID in ${ALL_CHILD_PIDS}; do
			# shellcheck disable=SC2009
			if ( ps -o pid,stat ax 2>/dev/null | grep -v 'PID' | awk '$2~/^[^Z]/ { print $1 }' | grep -q "^${_ONE_PID}$" || exit 1 && exit 0 ); then
				echo "[ERROR] Could not stop old processes."
				return 1
			fi
		done

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

	elif echo "$1" | grep -q -i -e "^-h$" -e "^--help$"; then
		PrintUsage "${PRGNAME}"
		exit 0

	elif echo "$1" | grep -q -i -e "^-prod$" -e "^--production$"; then
		if [ -n "${NODE_ENV_VALUE}" ]; then
			echo "[ERROR] already specified --production(-prod) or --development(-dev) option"
			exit 1
		fi
		NODE_ENV_VALUE="production"

	elif echo "$1" | grep -q -i -e "^-dev$" -e "^--development$"; then
		if [ -n "${NODE_ENV_VALUE}" ]; then
			echo "[ERROR] already specified --production(-prod) or --development(-dev) option"
			exit 1
		fi
		NODE_ENV_VALUE="development"

	elif echo "$1" | grep -q -i -e "^-bg$" -e "^--background$"; then
		#
		# Not check multi same option...
		#
		BACKGROUND=1

	elif echo "$1" | grep -q -i -e "^-fg$" -e "^--foreground$"; then
		#
		# Not check multi same option...
		#
		FOREGROUND=1

	elif echo "$1" | grep -q -i -e "^-s$" -e "^--stop$"; then
		if [ "${STOP_OLD_PROCESS}" -ne 0 ]; then
			echo "[ERROR] already specified --stop(-s) option"
			exit 1
		fi
		STOP_OLD_PROCESS=1

	elif echo "$1" | grep -q -i -e "^-d$" -e "^--debug$"; then
		if [ -n "${INSPECTOR_OPT}" ]; then
			echo "[ERROR] already specified --debug(-d) or --debug-nobrk(-dnobrk) option"
			exit 1
		fi
		INSPECTOR_OPT="--inspect-brk=${LOCAL_HOSTNAME}:9229"

	elif echo "$1" | grep -q -i -e "^-dnobrk$" -e "^--debug-nobrk$"; then
		if [ -n "${INSPECTOR_OPT}" ]; then
			echo "[ERROR] already specified --debug(-d) or --debug-nobrk(-dnobrk) option"
			exit 1
		fi
		INSPECTOR_OPT="--inspect=${LOCAL_HOSTNAME}:9229"

	elif echo "$1" | grep -q -i -e "^-dl$" -e "^--debuglevel$"; then
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
# Check background
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
if ! /bin/sh -c "NODE_PATH=${MY_NODE_PATH} NODE_ENV=${NODE_ENV_VALUE} NODE_DEBUG=${DEBUG_ENV_CUSTOM} node ${INSPECTOR_OPT} bin/www"; then
	EXIT_CODE="$?"
	echo "[INFO] Process exited with exit code: ${EXIT_CODE}"
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
