import React, { useContext, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'next-i18next';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Brand from '../../../layout/Brand/Brand';
import Navigation, { NavigationLine } from '../../../layout/Navigation/Navigation';
import User from '../../../layout/User/User';
import {
	componentPagesMenu,
	dashboardPagesMenu,
	demoPagesMenu,
	myPagesMenu,
	accountpagemenu,
	logoutmenu,
	pageLayoutTypesPagesMenu,
} from '../../../menu';
import ThemeContext from '../../../context/themeContext';
import Card, { CardBody } from '../../../components/bootstrap/Card';

import Hand from '../../../assets/img/hand.png';
import Icon from '../../../components/icon/Icon';
import Button from '../../../components/bootstrap/Button';
import useDarkMode from '../../../hooks/useDarkMode';
import Aside, { AsideBody, AsideFoot, AsideHead } from '../../../layout/Aside/Aside';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import LogoutButton from '../../LogoutButton';

const DefaultAside = () => {
	// Context for theme
	const { asideStatus, setAsideStatus } = useContext(ThemeContext);

	// State to manage document status
	const [doc, setDoc] = useState(
		(typeof window !== 'undefined' &&
			localStorage.getItem('facit_asideDocStatus') === 'true') ||
		false,
	);

	// Translation hook
	const { t } = useTranslation(['common', 'menu']);

	// Dark mode hook
	const { darkModeStatus } = useDarkMode();

	// Function to handle logout button click
	const handleLogout = () => {
		Swal.fire({
			title: 'Are you sure?',
			text: 'You will be logged out.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#d33',
			cancelButtonColor: '#3085d6',
			confirmButtonText: 'Yes, log out',
			cancelButtonText: 'Cancel',
		}).then((result) => {
			// Perform logout action
			if (result.isConfirmed) {

				console.log('Logging out...');
			}
		});
	};

	return (
		<Aside>
			<AsideHead>
				<Brand asideStatus={asideStatus} setAsideStatus={setAsideStatus} />
			</AsideHead>
			<AsideBody>
				{/* Navigation menu for 'My Pages' */}
				<Navigation menu={accountpagemenu} id='aside-dashboard' />

			</AsideBody>
			<AsideFoot>
				
					<Navigation  menu={logoutmenu} id='aside-dashboard' />
			


				{/* Footer section of the aside */}
				{/* <LogoutButton onLogout={handleLogout} /> */}
				{/* <Button
				icon="Logout"
				className="w-100"
				color="dark"
				size="sm"
				tag="button"
				onClick={handleLogout} 
				
			>
				Log Out
			</Button> */}
			</AsideFoot>
		</Aside>
	);
};

// Static props for server-side translations
export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		// @ts-ignore
		...(await serverSideTranslations(locale, ['common', 'menu'])),
	},
});

export default DefaultAside;
