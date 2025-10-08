import React from 'react';
import dynamic from 'next/dynamic';
import { demoPagesMenu, pageLayoutTypesPagesMenu ,loginMenu} from '../menu';

const DefaultAside = dynamic(() => import('../pages/_layout/_asides/DefaultAside'));
const ProjectAside = dynamic(() => import('../pages/_layout/_asides/ProjectAside'));
const AdminAside = dynamic(() => import('../pages/_layout/_asides/AdminAside'));
const AccountAside = dynamic(() => import('../pages/_layout/_asides/AccountAside'));
const DeveloperAside = dynamic(() => import('../pages/_layout/_asides/developerAside'));
const DefaultAsidelogin = dynamic(() => import('../pages/_layout/_asides/DefaultAside copy'));


const asides = [
	{ path: loginMenu.login.path, element: null, exact: true },
	{ path: demoPagesMenu.signUp.path, element: null, exact: true },
	{ path: pageLayoutTypesPagesMenu.blank.path, element: null, exact: true },
	{ path: '/', element: <DefaultAsidelogin />, exact: true },
	{ path: '/employeepages/*', element: <DefaultAside />, exact: true },
	{ path: '/hrm/*', element: <DefaultAside />, exact: true },
	{ path: '/projectmanager/*', element: <ProjectAside />, exact: true },
	{ path: '/admin/*', element: <AdminAside/>, exact: true },
	{ path: '/accountmanager/*', element: <AccountAside />, exact: true },
	{ path: '/developer/*', element: <DeveloperAside />, exact: true },
];

export default asides;
