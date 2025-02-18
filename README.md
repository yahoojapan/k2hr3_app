K2HR3 Web Application(k2hr3-app)
--------------------------------
[![Node.js AntPickax CI](https://github.com/yahoojapan/k2hr3_app/workflows/Node.js%20AntPickax%20CI/badge.svg)](https://github.com/yahoojapan/k2hr3_app/actions)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/yahoojapan/k2hr3_app/master/LICENSE)
[![GitHub forks](https://img.shields.io/github/forks/yahoojapan/k2hr3_app.svg)](https://github.com/yahoojapan/k2hr3_app/network)
[![GitHub stars](https://img.shields.io/github/stars/yahoojapan/k2hr3_app.svg)](https://github.com/yahoojapan/k2hr3_app/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/yahoojapan/k2hr3_app.svg)](https://github.com/yahoojapan/k2hr3_app/issues)
[![NPM packages](https://badge.fury.io/js/k2hr3-app.svg)](https://badge.fury.io/js/k2hr3-app)
[![Docker image](https://img.shields.io/docker/pulls/antpickax/k2hr3-app.svg)](https://hub.docker.com/r/antpickax/k2hr3-app)

## **K2HR3** - **K2H**dkc based **R**esource and **R**oles and policy **R**ules

![K2HR3 system](https://k2hr3.antpick.ax/images/top_k2hr3.png)

### K2HR3 system overview
**K2HR3** (**K2H**dkc based **R**esource and **R**oles and policy **R**ules) is one of extended **RBAC** (**R**ole **B**ased **A**ccess **C**ontrol) system.  
K2HR3 works as RBAC in cooperation with **OpenStack** which is one of **IaaS**(Infrastructure as a Service), and also provides useful functions for using RBAC.  

K2HR3 is a system that defines and controls **HOW**(policy Rule), **WHO**(Role), **WHAT**(Resource), as RBAC.  
Users of K2HR3 can define **Role**(WHO) groups to access freely defined **Resource**(WHAT) and control access by **policy Rule**(HOW).  
By defining the information and assets required for any system as a **Resource**(WHAT), K2HR3 system can give the opportunity to provide access control in every situation.  

K2HR3 provides **+SERVICE** feature, it **strongly supports** user system, function and information linkage.

![K2HR3 system overview](https://k2hr3.antpick.ax/images/overview_abstract.png)

K2HR3 is built [k2hdkc](https://github.com/yahoojapan/k2hdkc), [k2hash](https://github.com/yahoojapan/k2hash), [chmpx](https://github.com/yahoojapan/chmpx) and [k2hash transaction plugin](https://github.com/yahoojapan/k2htp_dtor) components by [AntPickax](https://antpick.ax/).

### K2HR3 Web Application
**K2HR3 Web Application** is one subsystem of K2HR3 system.  
This is accessed from the browser by users and operates as the control panel of the K2HR3 system.  
This is a JavaScript based web application that can manipulate all of the data required by users.  
_K2HR3 Web Application is created with [React.js](https://reactjs.org/) and [Node.js](https://nodejs.org/)._  

User can manipulate **Roles**, **policy Rules**, **Resource**, **Service** data using this **K2HR3 Web Application**.  

![K2HR3 Web Application](https://k2hr3.antpick.ax/images/usage_top_app_overview.png)

### Demonstration site
You can access the [demonstration site](https://demo.k2hr3.antpick.ax) of K2HR3 Web Application by accessing here.  
You can learn about **R**esource, **R**oles, policy **R**ules and **SERVICE** provided by K2HR3 on this site now.  
_The data operated on this site can not be saved._

### Documents
- [K2HR3 Document](https://k2hr3.antpick.ax/index.html)
- [K2HR3 Web Application Usage](https://k2hr3.antpick.ax/usage_app.html)
- [K2HR3 Command Line Interface Usage](https://k2hr3.antpick.ax/cli.html)
- [K2HR3 REST API Usage](https://k2hr3.antpick.ax/api.html)
- [K2HR3 OpenStack Notification Listener Usage](https://k2hr3.antpick.ax/detail_osnl.html)
- [K2HR3 Watcher Usage](https://k2hr3.antpick.ax/tools.html)
- [K2HR3 Get Resource Usage](https://k2hr3.antpick.ax/tools.html)
- [K2HR3 Utilities for Setup](https://k2hr3.antpick.ax/setup.html)
- [K2HR3 Demonstration](https://demo.k2hr3.antpick.ax/)

- [About k2hdkc](https://k2hdkc.antpick.ax/)
- [About k2hash](https://k2hash.antpick.ax/)
- [About chmpx](https://chmpx.antpick.ax/)
- [About k2hash transaction plugin](https://k2htpdtor.antpick.ax/)

- [About AntPickax](https://antpick.ax/)

### Repositories
- [K2HR3 main repository](https://github.com/yahoojapan/k2hr3)
- [K2HR3 Web Application repository](https://github.com/yahoojapan/k2hr3_app)
- [K2HR3 Command Line Interface repository](https://github.com/yahoojapan/k2hr3_cli)
- [K2HR3 REST API repository](https://github.com/yahoojapan/k2hr3_api)
- [K2HR3 OpenStack Notification Listener](https://github.com/yahoojapan/k2hr3_osnl)
- [K2HR3 Get Resource](https://github.com/yahoojapan/k2hr3_get_resource)
- [K2HR3 Utilities](https://github.com/yahoojapan/k2hr3_utils)
- [K2HR3 Container Registration Sidecar](https://github.com/yahoojapan/k2hr3_sidecar)

- [k2hdkc](https://github.com/yahoojapan/k2hdkc)
- [k2hash](https://github.com/yahoojapan/k2hash)
- [chmpx](https://github.com/yahoojapan/chmpx)
- [k2hash transaction plugin](https://github.com/yahoojapan/k2htp_dtor)

### Packages
- [k2hr3-app(npm packages)](https://www.npmjs.com/package/k2hr3-app)

### Docker images
- [k2hr3-app(Docker Hub)](https://hub.docker.com/r/antpickax/k2hr3-app)

### License
This software is released under the MIT License, see the license file.

### AntPickax
K2HR3 is one of [AntPickax](https://antpick.ax/) products.

Copyright(C) 2017 Yahoo Japan Corporation.
