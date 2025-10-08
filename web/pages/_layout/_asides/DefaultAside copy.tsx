import React, { useContext, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Brand from '../../../layout/Brand/Brand';
import Navigation, { NavigationLine } from '../../../layout/Navigation/Navigation';
import {
	
	loginMenu,
	
} from '../../../menu';
import ThemeContext from '../../../context/themeContext';
import Button from '../../../components/bootstrap/Button';
import useDarkMode from '../../../hooks/useDarkMode';
import Aside, { AsideBody, AsideFoot, AsideHead } from '../../../layout/Aside/Aside';
import Swal from 'sweetalert2'; 
import 'sweetalert2/dist/sweetalert2.min.css'; 
import LogoutButton from '../../LogoutButton';

const DefaultAside = () => {
	// Context for theme
	const { asideStatus, setAsideStatus } = useContext(ThemeContext);

	// Translation hook
	const { t } = useTranslation(['common', 'menu']);

	// Dark mode hook
	const { darkModeStatus } = useDarkMode();

	return (
		<Aside>
			<AsideBody>
				 {/* Navigation menu for 'login Pages' */}
				<Navigation menu={loginMenu} id='aside-dashboard' />
				
			</AsideBody>
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
