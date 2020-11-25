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
# CREATE:   Tue May 15 2019
# REVISION:
#

#---------------------------------------------------------------------
# Symbols / Macros / Variables
#---------------------------------------------------------------------
#
# Common
#
CMDLINE_PROCESS_NAME=$0
CMDLINE_ALL_PARAM=$@
PROGRAM_NAME=`basename ${CMDLINE_PROCESS_NAME}`
MYSCRIPTDIR=`dirname ${CMDLINE_PROCESS_NAME}`
MYSCRIPTDIR=`cd ${MYSCRIPTDIR}; pwd`
SRCTOP=`cd ${MYSCRIPTDIR}/..; pwd`

#
# Directories
#
DEMO_DIR="${SRCTOP}/demo"
BACKUP_DIR="${SRCTOP}/backup"
MASTER_SRC_DIR="${SRCTOP}/src"
MASTER_SRC_UTIL_DIR="${MASTER_SRC_DIR}/util"
MASTER_PUBLIC_DIR="${SRCTOP}/public"
DIST_DIR_NAME="dist"
DIST_DIR="${SRCTOP}/${DIST_DIR_NAME}"
DIST_PUBLIC_DIR="${DIST_DIR}/public"

#
# Files
#
R3APP_JSX="r3app.jsx"
R3PROVIDER_JS="r3provider.js"
DEMO_INDEX_HTML="index.html"
DEMO_INDEXJA_HTML="indexja.html"
DEMO_SSH_KEY="actions_id_rsa"

#
# Symbols and Commands
#
REPO_GHPAGES="gh-pages"
CURRENT_YEAR=`date +%Y`
RELEASE_SHA1=`git rev-parse --short HEAD`

#---------------------------------------------------------------------
# Utility
#---------------------------------------------------------------------
run_cmd()
{
	echo "$ $@"
	$@
	if [ $? -ne 0 ]; then
		echo "[ERROR] ${PRGNAME} : \"$@\"" 1>&2
		exit 1
	fi
}

check_error()
{
	if [ $? -ne 0 ]; then
		echo "[ERROR] ${PRGNAME} : $@" 1>&2
		exit 1
	fi
}

#---------------------------------------------------------------------
# Build
#---------------------------------------------------------------------
echo "[INFO] ${PRGNAME} ${BACKUP_DIR} Start to build."

#
# Current
#
cd ${SRCTOP}
echo ""

#
# backup
#
echo "[INFO] ${PRGNAME} ${BACKUP_DIR} Make backup files."
if [ -d ${BACKUP_DIR} -o -f ${BACKUP_DIR} ]; then
	echo "[WARNING] ${PRGNAME} ${BACKUP_DIR} file or directory is existed, then it remove now."
	run_cmd rm -rf ${BACKUP_DIR}
fi
run_cmd mkdir -p ${BACKUP_DIR}
run_cmd cp -p ${MASTER_SRC_DIR}/${R3APP_JSX} ${BACKUP_DIR}/${R3APP_JSX}
run_cmd cp -p ${MASTER_SRC_UTIL_DIR}/${R3PROVIDER_JS} ${BACKUP_DIR}/${R3PROVIDER_JS}

#
# Change application title in r3app.jsx and Replace src/util/r3provider.js
#
echo "[INFO] ${PRGNAME} ${BACKUP_DIR} Modifiy r3app.jsx for title and Switch r3provider.js for demo site."
run_cmd cp -p ${DEMO_DIR}/${R3PROVIDER_JS} ${MASTER_SRC_UTIL_DIR}/${R3PROVIDER_JS}
sed -i -e "s/title='K2HR3'/title='K2HR3 DEMO'/g" ${MASTER_SRC_DIR}/${R3APP_JSX}
check_error "failed changing ${MASTER_SRC_DIR}/${R3APP_JSX}"

#
# build bundle.js
#
echo "[INFO] ${PRGNAME} ${BACKUP_DIR} Build bundle.js for demo site."
if [ "X${GHPAGES_WITHOUT_LICENSE}" != "X" ]; then
	run_cmd npm run build:webpack
else
	run_cmd npm run build:all
fi

#---------------------------------------------------------------------
# Setup SSH
#---------------------------------------------------------------------
echo "[INFO] ${PRGNAME} ${BACKUP_DIR} Setup SSH for pushing"

#
# Variables for pushing
#
REPO_BASE_URL=`git config remote.origin.url`
REPO_GIT_URL=`echo ${REPO_BASE_URL} | sed "s#https://#git@#g" | sed "s#[:|/]# #g" | sed "s# #:#" | sed "s# #/#g"`
REPO_HTTPS_URL=`echo ${REPO_BASE_URL} | sed "s#https://#git@#g" | sed "s#:#/#g" | sed "s#git@#https://#g"`
REPO_GIT_USER_HOST=`echo ${REPO_GIT_URL} | sed "s#:# #g" | awk '{print $1}'`
REPO_GIT_HOST=`echo ${REPO_GIT_USER_HOST} | sed "s#git@##g"`

#
# ssh and ssh-agent
#
echo "[INFO] ${PRGNAME} ${BACKUP_DIR} Check .ssh directory"
if [ ! -d ~/.ssh ]; then
	echo "[ERROR] ${PRGNAME} ${BACKUP_DIR} Not found ~/.ssh directory"
	exit 1
fi
if [ ! -f ~/.ssh/${DEMO_SSH_KEY} ]; then
	echo "[ERROR] ${PRGNAME} ${BACKUP_DIR} Not found ~/.ssh/${DEMO_SSH_KEY} file"
	exit 1
fi
run_cmd chmod 700 ~/.ssh
run_cmd chmod 600 ~/.ssh/${DEMO_SSH_KEY}

eval `ssh-agent -s`
ssh-add ~/.ssh/${DEMO_SSH_KEY}
check_error "failed adding ssh-key to agent"

ssh -oStrictHostKeyChecking=no -T ${REPO_GIT_USER_HOST}

#---------------------------------------------------------------------
# Prepare the file to upload
#---------------------------------------------------------------------
echo "[INFO] ${PRGNAME} ${BACKUP_DIR} Prepare the file to upload"

#
# make dist directory cloning repo
#
echo "[INFO] ${PRGNAME} ${BACKUP_DIR} Clone ${REPO_GHPAGES} to dist directory"
if [ -d ${DIST_DIR} -o -f ${DIST_DIR} ]; then
	echo "[WARNING] ${PRGNAME} ${DIST_DIR} file or directory is existed, then it remove now."
	run_cmd rm -rf ${DIST_DIR}
fi
run_cmd git clone ${REPO_GIT_URL} ${DIST_DIR_NAME}
run_cmd cd ${DIST_DIR}
run_cmd git config user.name "AntPickax CI"
run_cmd git config user.email "antpickax-support@mail.yahoo.co.jp"
run_cmd git checkout ${REPO_GHPAGES}

#
# Copy index(ja).html under dist directory
#
echo "[INFO] ${PRGNAME} ${BACKUP_DIR} Copying public directory and index(ja).html"
run_cmd rm -rf ${DIST_PUBLIC_DIR}
run_cmd cp -rp ${MASTER_PUBLIC_DIR} ${DIST_DIR}

cat ${DEMO_DIR}/${DEMO_INDEX_HTML} | sed "s/__K2HR3_DEMO_INDEX_HTML_LANG__/en/g" | sed "s/__K2HR3_DEMO_INDEX_HTML_YEAR__/${CURRENT_YEAR}/g" > ${DIST_DIR}/${DEMO_INDEX_HTML}
check_error "failed copying from ${DEMO_DIR}/${DEMO_INDEX_HTML} to ${DIST_DIR}/${DEMO_INDEX_HTML}"

cat ${DEMO_DIR}/${DEMO_INDEX_HTML} | sed "s/__K2HR3_DEMO_INDEX_HTML_LANG__/ja/g" | sed "s/__K2HR3_DEMO_INDEX_HTML_YEAR__/${CURRENT_YEAR}/g" > ${DIST_DIR}/${DEMO_INDEXJA_HTML}
check_error "failed copying from ${DEMO_DIR}/${DEMO_INDEX_HTML} to ${DIST_DIR}/${DEMO_INDEXJA_HTML}"

#---------------------------------------------------------------------
# Push files
#---------------------------------------------------------------------
echo "[INFO] ${PRGNAME} ${BACKUP_DIR} Push and updated gh-pages"

#
# Push
#
echo "[INFO] ${PRGNAME} ${BACKUP_DIR} Push ${REPO_GHPAGES}"
if [ "X${PUBLISH_TAG_NAME}" = "X" ]; then
	echo "[WARNING] ${PRGNAME} PUBLISH_TAG_NAME environment is not existed."
	PUBLISH_TAG_NAME="unknown version tag"
fi

run_cmd git add -A .
git commit -m "Updates GitHub Pages: ${PUBLISH_TAG_NAME} (${RELEASE_SHA1})"
if [ $? -eq 0 ]; then
	run_cmd git push origin ${REPO_GHPAGES}

	echo "[INFO] ${PRGNAME} Succeed to push ${REPO_GHPAGES}"
else
	echo "[WARNING] ${PRGNAME} Succeed nothing to update files, skip push."
fi

#
# restore
#
echo "[INFO] ${PRGNAME} ${BACKUP_DIR} Restore backup"
if [ -d ${BACKUP_DIR} ]; then
	run_cmd cp -p ${BACKUP_DIR}/${R3APP_JSX} ${MASTER_SRC_DIR}/${R3APP_JSX}
	run_cmd cp -p ${BACKUP_DIR}/${R3PROVIDER_JS} ${MASTER_SRC_UTIL_DIR}/${R3PROVIDER_JS}

	echo "[INFO] ${PRGNAME} ${BACKUP_DIR} Succeed to restore backup"
else
	echo "[WARNING] ${PRGNAME} Not found ${BACKUP_DIR}, then skip restoring."
fi

#
# Finish
#
echo "[INFO] ${PRGNAME} ${BACKUP_DIR} Finish building all for demo files on github pages."
exit 0

#
# VIM modelines
#
# vim:set ts=4 fenc=utf-8:
#
