import React, { FC, useEffect, useState, useTransition } from 'react';
import Card, {
	CardActions,
	CardBody,
	CardHeader,
	CardLabel,
	CardSubTitle,
	CardTitle,
} from '../../components/bootstrap/Card';
import Dropdown, {
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
} from '../../components/bootstrap/Dropdown';
import Button from '../../components/bootstrap/Button';
import classNames from 'classnames';
//import Chart, { IChartOptions } from '../../components/extras/Chart';
import Icon from '../../components/icon/Icon';
import { average, priceFormat } from '../../helpers/helpers';
import PercentComparison from '../../components/extras/PercentComparison';
import dayjs from 'dayjs';
import useDarkMode from '../../hooks/useDarkMode';
import { TABS, TTabs } from '../type/helper';
import { doc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';
import Chart from 'chart.js/auto';
import { array } from 'prop-types';




interface BudgetEstimation {
	id: string;
	advancedpaymentamount: string;
	milestone1amount: string;
	milestone2amount: string;
	milestone3amount: string;
	milestone4amount: string;
	invoicedate1: string;
	invoicedate2: string;
	invoicedate3: string;
	invoicedate4: string;
	advancedpaymentdate: string;
	[key: string]: string;
}

interface ICommonDashboardIncomeProps {
	activeTab: string;
}

// ... (Your imports and interfaces remain the same)

const CommonDashboardIncome: FC<ICommonDashboardIncomeProps> = ({ activeTab }) => {

	const [monthlyIncomes, setMonthlyIncomes] = useState<number[][]>(Array.from({ length: 12 }, () => []));
	const [availableYears, setAvailableYears] = useState<number[]>([]);
	const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
	const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined); // Change type to number | undefined
	//let income = new array(12)
	const fetchAvailableYears = async () => {
		try {
			const dataCollection = collection(firestore, 'BudgetEstimation');
			const querySnapshot = await getDocs(dataCollection);
			const uniqueYears = new Set<number>();

			querySnapshot.forEach((doc) => {
				const data = doc.data() as BudgetEstimation;
				['invoicedate1', 'invoicedate2', 'invoicedate3', 'invoicedate4', 'advancedpaymentdate'].forEach((dateField) => {
					const year = new Date(data[dateField] as string).getFullYear();
					uniqueYears.add(year);
				});
			});

			setAvailableYears(Array.from(uniqueYears).sort());
		} catch (error) {
			console.error('Error fetching available years: ', error);
		}
	};

	const fetchData = async () => {
		try {
			const dataCollection = collection(firestore, 'BudgetEstimation');
			const querySnapshot = await getDocs(dataCollection);
			const firebaseData = querySnapshot.docs.map((doc) => {
				const data = doc.data() as BudgetEstimation;
				console.log(data);
				return {
					...data,
					cid: doc.id,
				};
			});
			//const updatedMonthlyIncome: any = Array.from({ length: 12 }, (_, monthIndex) => {
				const totalIncomeForMonth = firebaseData.reduce((sum, item) => {
					const milestone1Amount = parseFloat(item.invoicedate1 || '0');
					const milestone2Amount = parseFloat(item.invoicedate2 || '0');
					const milestone3Amount = parseFloat(item.invoicedate3 || '0');
					const milestone4Amount = parseFloat(item.invoicedate4 || '0');
					const advancedPaymentAmount = parseFloat(item.advancedpaymentdate || '0');
					const x = milestone1Amount + milestone2Amount + milestone3Amount + milestone4Amount + advancedPaymentAmount
					
					console.log( milestone1Amount + milestone2Amount + milestone3Amount + milestone4Amount + advancedPaymentAmount)
					return sum + milestone1Amount + milestone2Amount + milestone3Amount + milestone4Amount + advancedPaymentAmount;
				}, 0);
				
				


		} catch (error) {
			console.error('Error fetching data: ', error);
		}
	};

	useEffect(() => {
		fetchAvailableYears();
	}, []);

	useEffect(() => {
		fetchData();
	}, [selectedYear, selectedMonth]);

	useEffect(() => {
		const ctx = document.getElementById('incomeChart') as HTMLCanvasElement;

		// Destroy existing Chart instance if it exists
		const existingChart = Chart.getChart(ctx);
		if (existingChart) {
			existingChart.destroy();
		}

		// Create a new Chart instance
		new Chart(ctx, {
			type: 'bar',
			data: {
				labels: [
					'January', 'February', 'March', 'April', 'May', 'June',
					'July', 'August', 'September', 'October', 'November', 'December',
				],
				datasets: [
					{
						label: 'Monthly Income',
						data: monthlyIncomes,
						backgroundColor: 'rgba(75, 192, 192, 0.2)',
						borderColor: 'rgba(75, 192, 192, 1)',
						borderWidth: 1,
					},
				],
			},
			options: {},
		});
	}, [monthlyIncomes]);

	return (
		<div>
			<select onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
				<option value={new Date().getFullYear()}>Select Year</option>
				{availableYears.map((year) => (
					<option key={year} value={year}>
						{year}
					</option>
				))}
			</select>

			<select onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
				<option value={undefined}>Select Month</option>
				{Array.from({ length: 12 }, (_, index) => (
					<option key={index} value={index}>
						{dayjs().month(index).format('MMMM')}
					</option>
				))}
			</select>

			<canvas id="incomeChart" width="400" height="200"></canvas>
		</div>
	);
};

export default CommonDashboardIncome;
