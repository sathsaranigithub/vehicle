import { TColor } from '../../type/color-type';

export interface IColors {
	[key: string]: {
		name: TColor;
		code: string;
	};
}
const COLORS: IColors = {
	PRIMARY: {
		name: 'primary',
		code: String(process.env.NEXT_PUBLIC_PRIMARY_COLOR),
	},
	SECONDARY: {
		name: 'secondary',
		code: String(process.env.NEXT_PUBLIC_SECONDARY_COLOR),
	},
	SUCCESS: {
		name: 'success',
		code: String(process.env.NEXT_PUBLIC_SUCCESS_COLOR),
	},
	INFO: {
		name: 'info',
		code: String(process.env.NEXT_PUBLIC_INFO_COLOR),
	},
	WARNING: {
		name: 'warning',
		code: String(process.env.NEXT_PUBLIC_WARNING_COLOR),
	},
	DANGER: {
		name: 'danger',
		code: String(process.env.NEXT_PUBLIC_DANGER_COLOR),
	},
	DARK: {
		name: 'dark',
		code: String(process.env.NEXT_PUBLIC_DARK_COLOR),
	},
	LIGHT: {
		name: 'light',
		code: String(process.env.NEXT_PUBLIC_LIGHT_COLOR),
	},
};

export function getColorNameWithIndex(index: number) {
	const colorKeys = Object.keys(COLORS) as (keyof IColors)[];
	const key = colorKeys[index % colorKeys.length];
	return COLORS[key]?.name;
  }
  
  export function getColorNameWithIndexBudget(index: number) {
	const colorKeys = Object.keys(COLORS) as (keyof IColors)[];
	const key = colorKeys[index % colorKeys.length];
	return COLORS[key]?.name;
  }

export default COLORS;
