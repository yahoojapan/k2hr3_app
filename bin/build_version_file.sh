#!/bin/sh
#
# K2HR3 Web Application
#
# Copyright 2025 Yahoo Japan Corporation.
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
# CREATE:   Tue Mar 11 2025
# REVISION:
#

#==========================================================
# Common Variables
#==========================================================
#PRGNAME=$(basename "$0")
SCRIPTDIR=$(dirname "$0")
SCRIPTDIR=$(cd "${SCRIPTDIR}" || exit 1; pwd)
SRCTOP=$(cd "${SCRIPTDIR}/.." || exit 1; pwd)

#
# Variables
#
PACKAGE_JSON_FILE="${SRCTOP}/package.json"
K2HR3_VERSION_JS_FILE="${SRCTOP}/src/util/r3version.js"

#==========================================================
# Main
#==========================================================


if [ ! -f "${PACKAGE_JSON_FILE}" ]; then
	echo "[ERROR] Not found ${PACKAGE_JSON_FILE}"
	exit 1
fi
if ! K2HR3_APP_VERSION=$(grep -i '"version"' package.json | sed -e 's#"##g' -e 's#,##g' -e 's#version:##gi' -e 's#[[:space:]]##g' | tr -d '\n'); then
	echo "[ERROR] Failed to extract version number from ${PACKAGE_JSON_FILE}"
	exit 1
fi

#
# Put version js file
#
CURRENT_DATE=$(date "+%a, %b %d %Y")
{
	echo '/*'
	echo ' *'
	echo ' * K2HR3 Web Application'
	echo ' *'
	echo ' * Copyright 2017 Yahoo Japan Corporation.'
	echo ' *'
	echo ' * K2HR3 is K2hdkc based Resource and Roles and policy Rules, gathers'
	echo ' * common management information for the cloud.'
	echo ' * K2HR3 can dynamically manage information as "who", "what", "operate".'
	echo ' * These are stored as roles, resources, policies in K2hdkc, and the'
	echo ' * client system can dynamically read and modify these information.'
	echo ' *'
	echo ' * For the full copyright and license information, please view'
	echo ' * the license file that was distributed with this source code.'
	echo ' *'
	echo ' * AUTHOR:'
	echo " * CREATE:   ${CURRENT_DATE}"
	echo ' * REVISION:'
	echo ' *'
	echo ' */'
	echo ''
	echo "export const r3VersionString = '${K2HR3_APP_VERSION}';"
	echo ''
	echo '/*'
	echo ' * Local variables:'
	echo ' * tab-width: 4'
	echo ' * c-basic-offset: 4'
	echo ' * End:'
	echo ' * vim600: noexpandtab sw=4 ts=4 fdm=marker'
	echo ' * vim<600: noexpandtab sw=4 ts=4'
	echo ' */'
} > "${K2HR3_VERSION_JS_FILE}"

exit 0

#
# Local variables:
# tab-width: 4
# c-basic-offset: 4
# End:
# vim600: noexpandtab sw=4 ts=4 fdm=marker
# vim<600: noexpandtab sw=4 ts=4
#
