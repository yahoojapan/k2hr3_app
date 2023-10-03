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
# CREATE:   Tue May 15 2019
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
BRANCH_GHPAGES="gh-pages"

DEMO_DIR="${SRCTOP}/demo"
BACKUP_DIR="${SRCTOP}/backup"
MASTER_SRC_DIR="${SRCTOP}/src"
MASTER_SRC_UTIL_DIR="${MASTER_SRC_DIR}/util"
MASTER_PUBLIC_DIR="${SRCTOP}/public"

DIST_DIR_NAME="dist"
DIST_DIR="${SRCTOP}/${DIST_DIR_NAME}"
DIST_PUBLIC_DIR="${DIST_DIR}/public"

DIST_CONFIG_USERNAME="AntPickax CI"
DIST_CONFIG_EMAIL="antpickax-support@mail.yahoo.co.jp"

#
# Files
#
R3APP_JSX="r3app.jsx"
R3PROVIDER_JS="r3provider.js"
DEMO_INDEX_HTML="index.html"
DEMO_INDEXJA_HTML="indexja.html"
DEMO_SSH_KEY="actions_id_rsa"
SSH_AGENT_TMPFILE="/tmp/.${PRGNAME}.$$.tmp"

#==============================================================
# Utility functions and variables for messaging
#==============================================================
#
# Utilities for message
#
if [ -t 1 ] || { [ -n "${CI}" ] && [ "${CI}" = "true" ]; }; then
	CBLD=$(printf '\033[1m')
	CREV=$(printf '\033[7m')
	CRED=$(printf '\033[31m')
	CYEL=$(printf '\033[33m')
	CGRN=$(printf '\033[32m')
	CDEF=$(printf '\033[0m')
else
	CBLD=""
	CREV=""
	CRED=""
	CYEL=""
	CGRN=""
	CDEF=""
fi
if [ -n "${CI}" ] && [ "${CI}" = "true" ]; then
	GHAGRP_START="::group::"
	GHAGRP_END="::endgroup::"
else
	GHAGRP_START=""
	GHAGRP_END=""
fi

PRNGROUPEND()
{
	if [ -n "${IN_GHAGROUP_AREA}" ] && [ "${IN_GHAGROUP_AREA}" -eq 1 ]; then
		if [ -n "${GHAGRP_END}" ]; then
			echo "${GHAGRP_END}"
		fi
	fi
	IN_GHAGROUP_AREA=0
}
PRNTITLE()
{
	PRNGROUPEND
	echo "${GHAGRP_START}${CBLD}${CGRN}${CREV}[TITLE]${CDEF} ${CGRN}$*${CDEF}"
	IN_GHAGROUP_AREA=1
}
PRNINFO()
{
	echo "${CBLD}${CREV}[INFO]${CDEF} $*"
}
PRNWARN()
{
	echo "${CBLD}${CYEL}${CREV}[WARNING]${CDEF} ${CYEL}$*${CDEF}"
}
PRNERR()
{
	echo "${CBLD}${CRED}${CREV}[ERROR]${CDEF} ${CRED}$*${CDEF}"
	PRNGROUPEND
}
PRNSUCCESS()
{
	echo "${CBLD}${CGRN}${CREV}[SUCCEED]${CDEF} ${CGRN}$*${CDEF}"
	PRNGROUPEND
}
PRNFAILURE()
{
	echo "${CBLD}${CRED}${CREV}[FAILURE]${CDEF} ${CRED}$*${CDEF}"
	PRNGROUPEND
}
RUNCMD()
{
	PRNINFO "Run \"$*\""
	if ! /bin/sh -c "$*"; then
		PRNERR "Failed to run \"$*\""
		return 1
	fi
	return 0
}

#==============================================================
# Set dynamic variables
#==============================================================
PRNTITLE "Set dynamic variables"

#
# Current
#
cd "${SRCTOP}" || exit 1

#
# Date
#
PRNINFO "Get current year"
if ! CURRENT_YEAR=$(date '+%Y'); then
	PRNERR "Failed to get current YEAR."
	exit 1
fi

#
# Make variables from git information
#
# [NOTE]
# Create the following variables here:
#	REPO_RELEASE_SHA1
#	REPO_BASE_URL
#	REPO_GIT_URL
#	REPO_HTTPS_URL
#	REPO_GIT_USER_HOST
#	REPO_GIT_HOST
#
PRNINFO "Make variables from git information"

if [ ! -d "${SRCTOP}/.git" ]; then
	PRNERR "Not found .git directory."
	exit 1
fi
if ! REPO_RELEASE_SHA1=$(git rev-parse --short HEAD | tr -d '\n'); then
	PRNERR "Could not get short sha1 for HEAD."
	exit 1
fi
if ! REPO_BASE_URL=$(git config remote.origin.url); then
	PRNERR "Could not get remote git url."
	exit 1
fi

REPO_GIT_URL=$(echo       "${REPO_BASE_URL}"      | sed -e "s#https://#git@#g" -e "s#[:|/]# #g" -e "s# #:#" -e "s# #/#g")
REPO_HTTPS_URL=$(echo     "${REPO_BASE_URL}"      | sed -e "s#https://#git@#g" -e "s#:#/#g" -e "s#git@#https://#g")
REPO_GIT_USER_HOST=$(echo "${REPO_GIT_URL}"       | sed -e "s#:# #g" | awk '{print $1}')
REPO_GIT_HOST=$(echo      "${REPO_GIT_USER_HOST}" | sed -e "s#git@##g")

if [ -z "${REPO_RELEASE_SHA1}" ] || [ -z "${REPO_BASE_URL}" ] || [ -z "${REPO_GIT_URL}" ] || [ -z "${REPO_HTTPS_URL}" ] || [ -z "${REPO_GIT_USER_HOST}" ] || [ -z "${REPO_GIT_HOST}" ]; then
	PRNERR "Failed to create variable about git from .git information."
	exit 1
fi

PRNSUCCESS "Set dynamic variables"

#==============================================================
# Convert files for demo site and make backup files
#==============================================================
PRNTITLE "Convert files for demo site and make backup files"

#
# Check backup directory
#
PRNINFO "Check and create ${BACKUP_DIR} directory"

if [ -d "${BACKUP_DIR}" ] || [ -f "${BACKUP_DIR}" ]; then
	PRNWARN "${BACKUP_DIR} file or directory is existed, then it will be remove for creation"
	RUNCMD rm -rf "${BACKUP_DIR}"
fi
if ! RUNCMD mkdir -p "${BACKUP_DIR}"; then
	PRNERR "Failed to create ${BACKUP_DIR} directory"
	PRNFAILURE "Convert files for demo site and make backup files"
	exit 1
fi

#
# Copy files to backup directory
#
PRNINFO "Copy files to backup ${BACKUP_DIR} directory"

if ! RUNCMD cp -p "${MASTER_SRC_DIR}/${R3APP_JSX}" "${BACKUP_DIR}/${R3APP_JSX}"; then
	PRNERR "Failed to copy backup file(${R3APP_JSX})"
	PRNFAILURE "Convert files for demo site and make backup files"
	exit 1
fi
if ! RUNCMD cp -p "${MASTER_SRC_UTIL_DIR}/${R3PROVIDER_JS}" "${BACKUP_DIR}/${R3PROVIDER_JS}"; then
	PRNERR "Failed to copy backup file(${R3PROVIDER_JS})"
	PRNFAILURE "Convert files for demo site and make backup files"
	exit 1
fi

#
# Change application title in r3app.jsx and Switch r3provider.js for demo
#
PRNINFO "Change application title(${R3APP_JSX}) and Switch ${R3PROVIDER_JS} for demo"

if ! sed -i -e "s/title='K2HR3'/title='K2HR3 DEMO'/g" "${MASTER_SRC_DIR}/${R3APP_JSX}"; then
	PRNERR "Failed to modify ${MASTER_SRC_DIR}/${R3APP_JSX} for demo title"
	PRNFAILURE "Convert files for demo site and make backup files"
	exit 1
fi
if ! RUNCMD cp -p "${DEMO_DIR}/${R3PROVIDER_JS}" "${MASTER_SRC_UTIL_DIR}/${R3PROVIDER_JS}"; then
	PRNERR "Failed to copy ${DEMO_DIR}/${R3PROVIDER_JS} to ${MASTER_SRC_UTIL_DIR}/${R3PROVIDER_JS}"
	PRNFAILURE "Convert files for demo site and make backup files"
	exit 1
fi

PRNSUCCESS "Convert files for demo site and make backup files"

#==============================================================
# Build bundle.js for demo site
#==============================================================
PRNTITLE "Build bundle.js for demo site"

# [NOTE]
# To bypass building the license file by setting the 
# "GHPAGES_WITHOUT_LICENSE" environment variable.
#
if [ -n "${GHPAGES_WITHOUT_LICENSE}" ] && [ "${GHPAGES_WITHOUT_LICENSE}" -eq 1 ]; then
	#
	# without bulding License file
	#
	if ! RUNCMD npm run build:webpack; then
		PRNERR "Failed to create bundle.js without building License file."
		PRNFAILURE "Build bundle.js for demo site"
		exit 1
	fi
else
	#
	# with bulding License file
	#
	if ! RUNCMD npm run build:all; then
		PRNERR "Failed to create bundle.js with building License file."
		PRNFAILURE "Build bundle.js for demo site"
		exit 1
	fi
fi

PRNSUCCESS "Build bundle.js for demo site"

#==============================================================
# Setup SSH before pushing
#==============================================================
# [NOTE]
# Setting SSH keys works when SETUP_SSH_DISABLE is not set.
# If you do not need to set the SSH key, set "SETUP_SSH_DISABLE=1"
# as an environment variable.
#
PRNTITLE "Setup SSH before pushing"

if [ -z "${SETUP_SSH_DISABLE}" ] || [ "${SETUP_SSH_DISABLE}" != "1" ]; then
	#
	# Check directory and file about SSH setting
	#
	PRNINFO "Check directory and file about SSH setting"

	if [ ! -d "${HOME}/.ssh" ]; then
		PRNERR "Not found ${HOME}/.ssh directory"
		PRNFAILURE "Setup SSH before pushing"
		exit 1
	fi
	if [ ! -f "${HOME}/.ssh/${DEMO_SSH_KEY}" ]; then
		PRNERR "Not found ${HOME}/.ssh/${DEMO_SSH_KEY} file"
		PRNFAILURE "Setup SSH before pushing"
		exit 1
	fi

	if ! RUNCMD chmod 700 "${HOME}/.ssh"; then
		PRNERR "Could not change stat to ${HOME}/.ssh directory"
		PRNFAILURE "Setup SSH before pushing"
		exit 1
	fi
	if ! RUNCMD chmod 600 "${HOME}/.ssh/${DEMO_SSH_KEY}"; then
		PRNERR "Could not change stat to ${HOME}/.ssh/${DEMO_SSH_KEY} file"
		PRNFAILURE "Setup SSH before pushing"
		exit 1
	fi

	#
	# Run ssh-agent
	#
	PRNINFO "Run ssh-agent"

	PRNINFO "Run \"ssh-agent -s > ${SSH_AGENT_TMPFILE}\""
	if ! ssh-agent -s > "${SSH_AGENT_TMPFILE}"; then
		PRNERR "Failed to run ssh-agent"
		PRNFAILURE "Setup SSH before pushing"
		exit 1
	fi
	if [ ! -f "${SSH_AGENT_TMPFILE}" ]; then
		PRNERR "Not found ${SSH_AGENT_TMPFILE} file"
		PRNFAILURE "Setup SSH before pushing"
		exit 1
	fi

	PRNINFO "Run \"sed -i -e 's|echo|#echo|g' ${SSH_AGENT_TMPFILE}\""
	if ! sed -i -e 's|echo|#echo|g' "${SSH_AGENT_TMPFILE}"; then
		PRNERR "Failed to convert ${SSH_AGENT_TMPFILE} file"
		PRNFAILURE "Setup SSH before pushing"
		exit 1
	fi

	. "${SSH_AGENT_TMPFILE}"

	if ! RUNCMD ssh-add ~/.ssh/"${DEMO_SSH_KEY}"; then
		PRNERR "Failed to run ssh-add"
		PRNFAILURE "Setup SSH before pushing"
		exit 1
	fi

	PRNINFO "Run \"ssh -oStrictHostKeyChecking=no -T ${REPO_GIT_USER_HOST}\" --> maybe puts some messages, but continue..."
	ssh -oStrictHostKeyChecking=no -T "${REPO_GIT_USER_HOST}"

	PRNSUCCESS "Setup SSH before pushing"
else
	PRNSUCCESS "Skip setup SSH before pushing"
fi

#==============================================================
# Setup gh-pages branch and prepare files to commit
#==============================================================
PRNTITLE "Setup ${BRANCH_GHPAGES} branch and prepare files to commit"

#
# Make dist directory cloning repo
#
PRNINFO "Clone ${BRANCH_GHPAGES} to dist directory"

if [ -d "${DIST_DIR}" ] || [ -f "${DIST_DIR}" ]; then
	PRNWARN "${DIST_DIR} file or directory is existed, then it will be remove for creation"
	RUNCMD rm -rf "${DIST_DIR}"
fi
if ! RUNCMD git clone "${REPO_GIT_URL}" "${DIST_DIR_NAME}"; then
	PRNERR "Failed to clone ${REPO_GIT_URL} to ${DIST_DIR_NAME}"
	PRNFAILURE "Setup ${BRANCH_GHPAGES} branch and prepare files to commit"
	exit 1
fi

PRNINFO "Run \"cd ${DIST_DIR}\""
if ! cd "${DIST_DIR}"; then
	PRNERR "Failed to change current directory."
	PRNFAILURE "Setup ${BRANCH_GHPAGES} branch and prepare files to commit"
	exit 1
fi
if ! RUNCMD git fetch; then
	PRNERR "Failed to fetch"
	PRNFAILURE "Setup ${BRANCH_GHPAGES} branch and prepare files to commit"
	exit 1
fi
if ! RUNCMD git config user.name "${DIST_CONFIG_USERNAME}"; then
	PRNERR "Failed to set git user name(${DIST_CONFIG_USERNAME})"
	PRNFAILURE "Setup ${BRANCH_GHPAGES} branch and prepare files to commit"
	exit 1
fi
if ! RUNCMD git config user.email "${DIST_CONFIG_EMAIL}"; then
	PRNERR "Failed to set git user mail address(${DIST_CONFIG_EMAIL})"
	PRNFAILURE "Setup ${BRANCH_GHPAGES} branch and prepare files to commit"
	exit 1
fi
if ! RUNCMD git checkout "${BRANCH_GHPAGES}"; then
	PRNERR "Failed to checkout ${BRANCH_GHPAGES} branch"
	PRNFAILURE "Setup ${BRANCH_GHPAGES} branch and prepare files to commit"
	exit 1
fi

#
# Copy public directory and index(ja).html files to dist directory
#
PRNINFO "Copying public directory and index(ja).html"

rm -rf "${DIST_PUBLIC_DIR}"
if ! RUNCMD cp -rp "${MASTER_PUBLIC_DIR}" "${DIST_DIR}"; then
	PRNERR "Failed to copy ${MASTER_PUBLIC_DIR} directory to ${DIST_DIR}"
	PRNFAILURE "Setup ${BRANCH_GHPAGES} branch and prepare files to commit"
	exit 1
fi

PRNINFO "Run \"sed -e \"s/__K2HR3_DEMO_INDEX_HTML_LANG__/en/g\" -e \"s/__K2HR3_DEMO_INDEX_HTML_YEAR__/${CURRENT_YEAR}/g\" ${DEMO_DIR}/${DEMO_INDEX_HTML} > ${DIST_DIR}/${DEMO_INDEX_HTML}\""
if ! sed -e "s/__K2HR3_DEMO_INDEX_HTML_LANG__/en/g" -e "s/__K2HR3_DEMO_INDEX_HTML_YEAR__/${CURRENT_YEAR}/g" "${DEMO_DIR}/${DEMO_INDEX_HTML}" > "${DIST_DIR}/${DEMO_INDEX_HTML}"; then
	PRNERR "Failed to convert and create ${DEMO_INDEX_HTML} in ${DIST_DIR}"
	PRNFAILURE "Setup ${BRANCH_GHPAGES} branch and prepare files to commit"
	exit 1
fi

PRNINFO "Run \"sed -e \"s/__K2HR3_DEMO_INDEX_HTML_LANG__/ja/g\" -e \"s/__K2HR3_DEMO_INDEX_HTML_YEAR__/${CURRENT_YEAR}/g\" ${DEMO_DIR}/${DEMO_INDEX_HTML} > ${DIST_DIR}/${DEMO_INDEXJA_HTML}\""
if ! sed -e "s/__K2HR3_DEMO_INDEX_HTML_LANG__/ja/g" -e "s/__K2HR3_DEMO_INDEX_HTML_YEAR__/${CURRENT_YEAR}/g" "${DEMO_DIR}/${DEMO_INDEX_HTML}" > "${DIST_DIR}/${DEMO_INDEXJA_HTML}"; then
	PRNERR "Failed to convert and create ${DEMO_INDEXJA_HTML} in ${DIST_DIR}"
	PRNFAILURE "Setup ${BRANCH_GHPAGES} branch and prepare files to commit"
	exit 1
fi

PRNSUCCESS "Setup ${BRANCH_GHPAGES} branch and prepare files to commit"

#==============================================================
# Push files to gh-pages
#==============================================================
PRNTITLE "Push files to ${BRANCH_GHPAGES}"

#
# Push
#
# [NOTE]
# The "PUBLISH_TAG_NAME" environment variable is set by the caller
# of this script(ex. nodetypevars.sh).
# If not set, set the default value here.
#
PRNINFO "Push ${BRANCH_GHPAGES}"

if [ -z "${PUBLISH_TAG_NAME}" ]; then
	PRNWARN "PUBLISH_TAG_NAME environment is not existed."
	PUBLISH_TAG_NAME="unknown version tag"
fi

if ! RUNCMD git add -A .; then
	PRNERR "Failed to git add updated files"
	PRNFAILURE "Push files to ${BRANCH_GHPAGES}"
	exit 1
fi

PRNINFO "Run \"git commit -m \"Updates GitHub Pages: ${PUBLISH_TAG_NAME} (${REPO_RELEASE_SHA1})\"\""
if ! git commit -m "Updates GitHub Pages: ${PUBLISH_TAG_NAME} (${REPO_RELEASE_SHA1})"; then
	#
	# No updated files, so nothing to push any files.
	#
	PRNWARN "Succeed nothing to update files, skip push."
else
	if ! RUNCMD git push origin "${BRANCH_GHPAGES}"; then
		PRNERR "Failed to git push to ${BRANCH_GHPAGES}"
		PRNFAILURE "Push files to ${BRANCH_GHPAGES}"
		exit 1
	fi
fi

PRNSUCCESS "Push files to ${BRANCH_GHPAGES}"

#==============================================================
# Restore
#==============================================================
PRNTITLE "Restore"

#
# Restore files from backup
#
PRNINFO "Restore files from backup"
if [ -d "${BACKUP_DIR}" ]; then
	if ! RUNCMD cp -p "${BACKUP_DIR}/${R3APP_JSX}" "${MASTER_SRC_DIR}/${R3APP_JSX}"; then
		PRNERR "Failed to restore ${R3APP_JSX} from ${BACKUP_DIR}"
		PRNFAILURE "Restore"
		exit 1
	fi
	if ! RUNCMD cp -p "${BACKUP_DIR}/${R3PROVIDER_JS}" "${MASTER_SRC_UTIL_DIR}/${R3PROVIDER_JS}"; then
		PRNERR "Failed to restore ${R3PROVIDER_JS} from ${BACKUP_DIR}"
		PRNFAILURE "Restore"
		exit 1
	fi
else
	PRNWARN "Not found ${BACKUP_DIR}, then skip restoring."
fi

PRNSUCCESS "Restore"

exit 0

#
# Local variables:
# tab-width: 4
# c-basic-offset: 4
# End:
# vim600: noexpandtab sw=4 ts=4 fdm=marker
# vim<600: noexpandtab sw=4 ts=4
#
