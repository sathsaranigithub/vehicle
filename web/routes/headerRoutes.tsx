import React from 'react';
import {
	componentPagesMenu,
	dashboardPagesMenu,
	demoPagesMenu,
	myPagesMenu,
	pageLayoutTypesPagesMenu,
} from '../menu';
import DashboardHeader from '../pages/_layout/_headers/DashboardHeader';
import DashboardBookingHeader from '../pages/_layout/_headers/DashboardBookingHeader';
import ProfilePageHeader from '../pages/_layout/_headers/ProfilePageHeader';
import SummaryHeader from '../pages/_layout/_headers/SummaryHeader';
import ProductsHeader from '../pages/_layout/_headers/ProductsHeader';
import ProductListHeader from '../pages/_layout/_headers/ProductListHeader';
import PageLayoutHeader from '../pages/_layout/_headers/PageLayoutHeader';
import ComponentsHeader from '../pages/_layout/_headers/ComponentsHeader';
import FormHeader from '../pages/_layout/_headers/FormHeader';
import ChartsHeader from '../pages/_layout/_headers/ChartsHeader';
import ContentHeader from '../pages/_layout/_headers/ContentHeader';
import UtilitiesHeader from '../pages/_layout/_headers/UtilitiesHeader';
import IconHeader from '../pages/_layout/_headers/IconHeader';
import DefaultHeader from '../pages/_layout/_headers/DefaultHeader';
import EmployeeHeader from '../pages/_layout/_headers/EmployeeHeader';
import AccountHeader from '../pages/_layout/_headers/AccountHeader';
import ProjectHeader from '../pages/_layout/_headers/ProjectHeader';
import AdminHeader from '../pages/_layout/_headers/AdminHeader';
import DeveloperHeader from '../pages/_layout/_headers/DeveloperHeader';


const headers = [
	// { path: pageLayoutTypesPagesMenu.pageLayout.subMenu.onlySubheader.path, element: null },
	// { path: pageLayoutTypesPagesMenu.pageLayout.subMenu.onlyContent.path, element: null },
	// { path: pageLayoutTypesPagesMenu.blank.path, element: null },
	// { path: demoPagesMenu.login.path, element: null },
	{ path: demoPagesMenu.signUp.path, element: null },
	{ path: demoPagesMenu.page404.path, element: null },
	// { path: demoPagesMenu.knowledge.subMenu.grid.path, element: null },
	// {
	// 	path: `${myPagesMenu.Jayani.path}/*`,
	// 	element: <MyDefaultHeader />,
	// },
	{
		path: `/`,
	},
	{
		path: `/employeepages/*`,
		element: <EmployeeHeader />,
	},
	{
		path: `/accountmanager/*`,
		element: <AccountHeader/>,
	},
	{
		path: `/projectmanager/*`,
		element: <ProjectHeader/>,
	},
	{
		path: `/developer/*`,
		element: <DeveloperHeader/>,
	},
	{
		path: `/admin/*`,
		element: <AdminHeader/>,
	},
	
	// {
	// 	path: `/*`,
	// 	element: <DefaultHeader />,
	// },
];

export default headers;
