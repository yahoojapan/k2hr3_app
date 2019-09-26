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

#
# Common
#
CMDLINE_PROCESS_NAME=$0
CMDLINE_ALL_PARAM=$@
PROGRAM_NAME=`basename ${CMDLINE_PROCESS_NAME}`
MYSCRIPTDIR=`dirname ${CMDLINE_PROCESS_NAME}`
MYSCRIPTDIR=`cd ${MYSCRIPTDIR}; pwd`
SRCTOP=`cd ${MYSCRIPTDIR}/..; pwd`

DEMO_DIR="${SRCTOP}/demo"
BACKUP_DIR="${SRCTOP}/backup"
MASTER_SRC_DIR="${SRCTOP}/src"
MASTER_SRC_UTIL_DIR="${MASTER_SRC_DIR}/util"
MASTER_PUBLIC_DIR="${SRCTOP}/public"
DIST_DIR_NAME="dist"
DIST_DIR="${SRCTOP}/${DIST_DIR_NAME}"
DIST_PUBLIC_DIR="${DIST_DIR}/public"

R3APP_JSX="r3app.jsx"
R3PROVIDER_JS="r3provider.js"
DEMO_INDEX_HTML="index.html"
DEMO_INDEXJA_HTML="indexja.html"
DEMO_SSH_ENCRYPT_KEY="travis_id_rsa.enc"
DEMO_SSH_KEY="travis_id_rsa"

GITHUB_PAGES_REPO="gh-pages"
CURRENT_YEAR=`date +%Y`
RELEASE_SHA1=`git rev-parse --short HEAD`

#
# Utility
#
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

#
# Current
#
cd ${SRCTOP}
echo ""

#
# backup
#
echo "**** Making backup"
if [ -d ${BACKUP_DIR} -o -f ${BACKUP_DIR} ]; then
	echo "[WARNING] ${PRGNAME} ${BACKUP_DIR} file or directory is existed, then it remove now."
	run_cmd rm -rf ${BACKUP_DIR}
fi
run_cmd mkdir -p ${BACKUP_DIR}
run_cmd cp -p ${MASTER_SRC_DIR}/${R3APP_JSX} ${BACKUP_DIR}/${R3APP_JSX}
run_cmd cp -p ${MASTER_SRC_UTIL_DIR}/${R3PROVIDER_JS} ${BACKUP_DIR}/${R3PROVIDER_JS}

echo "---> Succeed making backup"
echo ""

#
# Change application title in r3app.jsx and Replace src/util/r3provider.js
#
echo "**** Changing title in r3app.jsx and replacing r3provider.js"
run_cmd cp -p ${DEMO_DIR}/${R3PROVIDER_JS} ${MASTER_SRC_UTIL_DIR}/${R3PROVIDER_JS}
sed -i -e "s/title='K2HR3'/title='K2HR3 DEMO'/g" ${MASTER_SRC_DIR}/${R3APP_JSX}
check_error "failed changing ${MASTER_SRC_DIR}/${R3APP_JSX}"

echo "---> Succeed changing title in r3app.jsx and replacing r3provider.js"
echo ""

#
# build bundle.js
#
echo "**** Building bundle.js for demo"
if [ "X${BUILD_WITHOUT_LICENSE}" != "X" ]; then
	run_cmd npm run build:webpack
else
	run_cmd npm run build:all
fi
echo "---> Succeed building bundle.js for demo"
echo ""

#
# make URL/Host/etc
#
REPO_BASE_URL=`git config remote.origin.url`
REPO_GIT_URL=`echo ${REPO_BASE_URL} | sed "s#https://#git@#g" | sed "s#[:|/]# #g" | sed "s# #:#" | sed "s# #/#g"`
REPO_HTTPS_URL=`echo ${REPO_BASE_URL} | sed "s#https://#git@#g" | sed "s#:#/#g" | sed "s#git@#https://#g"`
REPO_GIT_USER_HOST=`echo ${REPO_GIT_URL} | sed "s#:# #g" | awk '{print $1}'`
REPO_GIT_HOST=`echo ${REPO_GIT_USER_HOST} | sed "s#git@##g"`

#
# ssh and ssh-agent
#
echo "**** Check ~/.ssh directory"
if [ ! -d ~/.ssh ]; then
	run_cmd mkdir -p ~/.ssh
	run_cmd chmod 700 ~/.ssh

	echo "---> Succeed make directory ~/.ssh"
else
	echo "---> Succeed already ~/.ssh directory is existed."
fi
echo ""

echo "**** Setup ssh-key agent"
if [ "X${TRAVIS_ENCRYPTION_KEY}" != "X" -a "X${TRAVIS_ENCRYPTION_IV}" != "X" ]; then
	openssl aes-256-cbc -K ${TRAVIS_ENCRYPTION_KEY} -iv ${TRAVIS_ENCRYPTION_IV} -in ${DEMO_DIR}/${DEMO_SSH_ENCRYPT_KEY} -out ~/.ssh/${DEMO_SSH_KEY} -d
	check_error "failed decrypt ssh private key for push gh-pages"

	run_cmd chmod 600 ~/.ssh/${DEMO_SSH_KEY}

	eval `ssh-agent -s`
	ssh-add ~/.ssh/${DEMO_SSH_KEY}
	check_error "failed adding ssh-key to agent"

	ssh -oStrictHostKeyChecking=no -T ${REPO_GIT_USER_HOST}

	echo "---> Succeed setup ssh-key agent"
else
	echo "---> Not set ssh-key agent, will fail doing soon."
fi
echo ""

#
# make dist directory cloning repo
#
echo "**** Clone ${GITHUB_PAGES_REPO} to dist directory"

if [ -d ${DIST_DIR} -o -f ${DIST_DIR} ]; then
	echo "[WARNING] ${PRGNAME} ${DIST_DIR} file or directory is existed, then it remove now."
	run_cmd rm -rf ${DIST_DIR}
fi
run_cmd git clone ${REPO_GIT_URL} ${DIST_DIR_NAME}
run_cmd cd ${DIST_DIR}
run_cmd git config user.name "Travis CI"
run_cmd git config user.email "antpickax-support@mail.yahoo.co.jp"
run_cmd git checkout ${GITHUB_PAGES_REPO}

echo "---> Succeed clone ${GITHUB_PAGES_REPO} to dist directory"
echo ""

#
# Copy index(ja).html under dist directory
#
echo "**** Copying public directory and index(ja).html"
run_cmd rm -rf ${DIST_PUBLIC_DIR}
run_cmd cp -rp ${MASTER_PUBLIC_DIR} ${DIST_DIR}

cat ${DEMO_DIR}/${DEMO_INDEX_HTML} | sed "s/__K2HR3_DEMO_INDEX_HTML_LANG__/en/g" | sed "s/__K2HR3_DEMO_INDEX_HTML_YEAR__/${CURRENT_YEAR}/g" > ${DIST_DIR}/${DEMO_INDEX_HTML}
check_error "failed copying from ${DEMO_DIR}/${DEMO_INDEX_HTML} to ${DIST_DIR}/${DEMO_INDEX_HTML}"

cat ${DEMO_DIR}/${DEMO_INDEX_HTML} | sed "s/__K2HR3_DEMO_INDEX_HTML_LANG__/ja/g" | sed "s/__K2HR3_DEMO_INDEX_HTML_YEAR__/${CURRENT_YEAR}/g" > ${DIST_DIR}/${DEMO_INDEXJA_HTML}
check_error "failed copying from ${DEMO_DIR}/${DEMO_INDEX_HTML} to ${DIST_DIR}/${DEMO_INDEXJA_HTML}"

echo "---> Succeed copying public directory and index(ja).html"
echo ""

#
# Push
#
echo "**** Push ${GITHUB_PAGES_REPO}"
if [ "X${TRAVIS_TAG}" = "X" ]; then
	echo "[WARNING] ${PRGNAME} TRAVIS_TAG environment is not existed."
	TRAVIS_TAG="unknown version tag"
fi
run_cmd git add -A .
git commit -m "Updates GitHub Pages: ${TRAVIS_TAG} (${RELEASE_SHA1})"
if [ $? -eq 0 ]; then
	run_cmd git push origin ${GITHUB_PAGES_REPO}

	echo "---> Succeed push ${GITHUB_PAGES_REPO}"
else
	echo "---> Succeed nothing to update files, skip push."
fi
echo ""

#
# restore
#
echo "**** Restore backup"
if [ -d ${BACKUP_DIR} ]; then
	run_cmd cp -p ${BACKUP_DIR}/${R3APP_JSX} ${MASTER_SRC_DIR}/${R3APP_JSX}
	run_cmd cp -p ${BACKUP_DIR}/${R3PROVIDER_JS} ${MASTER_SRC_UTIL_DIR}/${R3PROVIDER_JS}
	echo "---> Succeed restore backup"
else
	echo "---> Not found ${BACKUP_DIR}, then skip restoring"
fi
echo ""

#
# Finish
#
echo "---> Finish building all for demo files on github pages."
exit 0

#
# VIM modelines
#
# vim:set ts=4 fenc=utf-8:
#
