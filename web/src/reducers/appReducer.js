import {
	SET_NOTIFICATION,
	CLOSE_NOTIFICATION,
	CLOSE_ALL_NOTIFICATION,
	SET_SNACK_NOTIFICATION,
	CLOSE_SNACK_NOTIFICATION,
	SET_SNACK_DIALOG,
	CLOSE_SNACK_DIALOG,
	CHANGE_LANGUAGE,
	SET_ANNOUNCEMENT,
	CHANGE_THEME,
	SET_PAIRS,
	SET_TICKERS,
	SET_UNREAD,
	SET_ORDER_LIMITS,
	SET_TICKER_FROM_TRADE,
	SET_CURRENCIES,
	SET_VALID_BASE_CURRENCY,
	SET_CONFIG,
	SET_INFO,
	SET_WAVE_AUCTION
} from '../actions/appActions';
import { THEME_DEFAULT } from '../config/constants';
import { getLanguage } from '../utils/string';
import { getTheme } from '../utils/theme';

const EMPTY_NOTIFICATION = {
	type: '',
	message: '',
	contactFormData: {},
	helpfulResourcesFormData: {},
	timestamp: undefined
};

const EMPTY_SNACK_NOTIFICATION = {
	showSnack: false,
	icon: '',
	useSvg: true,
	content: '',
	isDialog: false,
	dialogData: []
};

const INITIAL_STATE = {
	announcements: [],
	notifications: [],
	notificationsQueue: [],
	chatUnreadMessages: 0,
	activeNotification: EMPTY_NOTIFICATION,
	snackNotification: EMPTY_SNACK_NOTIFICATION,
	theme: THEME_DEFAULT,
	language: getLanguage(),
	pairs: {},
	pair: '',
	tickers: {},
	orderLimits: {},
	coins: {
		bch: {
			id: 4,
			fullname: 'Bitcoin Cash',
			symbol: 'bch',
			active: true,
			allow_deposit: true,
			allow_withdrawal: true,
			withdrawal_fee: 0.0001,
			min: 0.0001,
			max: 100000,
			increment_unit: 0.001,
			deposit_limits: {},
			withdrawal_limits: {}
		},
		xrp: {
			id: 5,
			fullname: 'Ripple',
			symbol: 'xrp',
			active: true,
			allow_deposit: true,
			allow_withdrawal: true,
			withdrawal_fee: 0.0001,
			min: 0.0001,
			max: 100000,
			increment_unit: 0.001,
			deposit_limits: {},
			withdrawal_limits: {}
		},
		eur: {
			id: 1,
			fullname: 'Euro',
			symbol: 'eur',
			active: true,
			allow_deposit: true,
			allow_withdrawal: true,
			withdrawal_fee: 0.0001,
			min: 0.0001,
			max: 100000,
			increment_unit: 0.0001,
			deposit_limits: {},
			withdrawal_limits: {}
		},
		btc: {
			id: 2,
			fullname: 'Bitcoin',
			symbol: 'btc',
			active: true,
			allow_deposit: true,
			allow_withdrawal: true,
			withdrawal_fee: 0.0001,
			min: 0.0001,
			max: 100000,
			increment_unit: 0.0001,
			deposit_limits: {},
			withdrawal_limits: {}
		},
		eth: {
			id: 3,
			fullname: 'Ethereum',
			symbol: 'eth',
			active: true,
			allow_deposit: true,
			allow_withdrawal: true,
			withdrawal_fee: 0.0001,
			min: 0.0001,
			max: 100000,
			increment_unit: 0.001,
			deposit_limits: {},
			withdrawal_limits: {}
		}
	},
	isValidBase: false,
	constants: {},
	config_level: [],
	info: { is_trial: false, active: true, status: true },
	wave: [],
	enabledPlugins: []
};

const reducer = (state = INITIAL_STATE, { type, payload = {} }) => {
	switch (type) {
		case SET_PAIRS:
			return {
				...state,
				pairs: payload.pairs
			};
		case 'CHANGE_PAIR':
			return {
				...state,
				pair: payload.pair
			};
		case SET_CURRENCIES:
			return {
				...state,
				coins: payload.coins
			};
		case SET_NOTIFICATION: {
			const newNotification =
				payload.type.indexOf('NOTIFICATIONS') > -1 ? [payload] : [];
			const notifications = newNotification.concat(state.notifications);
			const notificationsQueue = [].concat(state.notificationsQueue);
			let activeNotification = { ...state.activeNotification };

			if (payload.show) {
				if (state.activeNotification.type !== '') {
					notificationsQueue.push(payload);
				} else {
					activeNotification = { ...payload };
				}
			}

			return {
				...state,
				notifications,
				activeNotification,
				contactFormData: payload.data,
				notificationsQueue
			};
		}

		case CLOSE_NOTIFICATION: {
			const notificationsQueue = [].concat(state.notificationsQueue);
			const activeNotification =
				notificationsQueue.length > 0
					? notificationsQueue.splice(0, 1)[0]
					: EMPTY_NOTIFICATION;

			return {
				...state,
				notificationsQueue,
				activeNotification,
				contactFormData: {}
			};
		}

		case SET_SNACK_NOTIFICATION:
			return {
				...state,
				snackNotification: {
					...state.snackNotification,
					...payload,
					showSnack: true,
					icon: payload.icon ? payload.icon : '',
					useSvg: payload.useSvg ? payload.useSvg : true,
					content: payload.content ? payload.content : ''
				}
			};

		case CLOSE_SNACK_NOTIFICATION:
			return {
				...state,
				snackNotification: EMPTY_SNACK_NOTIFICATION
			};

		case SET_SNACK_DIALOG:
			const { isDialog, ...rest } = payload;
			let dialogData = [...state.snackNotification.dialogData];
			if (isDialog) {
				dialogData = [
					...dialogData,
					{ ...rest, id: `snack-dialog-${dialogData.length + 1}` }
				];
			}
			return {
				...state,
				snackNotification: {
					...state.snackNotification,
					isDialog,
					dialogData
				}
			};

		case CLOSE_SNACK_DIALOG:
			const dataDialog = state.snackNotification.dialogData.filter(
				(data) => data.id !== payload.dialogId
			);
			let openDialog = dataDialog.length
				? state.snackNotification.isDialog
				: false;
			return {
				...state,
				snackNotification: {
					...state.snackNotification,
					isDialog: openDialog,
					dialogData: dataDialog
				}
			};

		case SET_UNREAD:
			return {
				...state,
				chatUnreadMessages: payload.chatUnreadMessages
			};

		case SET_ANNOUNCEMENT:
			const announcements = state.announcements.concat(
				payload.announcements
			);
			return {
				...state,
				announcements
			};

		case CLOSE_ALL_NOTIFICATION:
			return {
				...state,
				notificationsQueue: [],
				activeNotification: EMPTY_NOTIFICATION
			};

		case CHANGE_LANGUAGE:
			return {
				...state,
				language: payload.language
			};

		case CHANGE_THEME:
			return {
				...state,
				theme: getTheme(payload.theme)
			};
		case SET_TICKERS:
			return {
				...state,
				tickers: {
					...state.tickers,
					...payload
				}
			};
		case SET_TICKER_FROM_TRADE:
			let tempTickers = {};
			let pairs = Object.keys(state.pairs);
			Object.keys(payload).forEach((key) => {
				if (pairs.includes(key)) {
					let temp = state.tickers[key] || {};
					let pairTrade = payload[key][0];
					let close =
						pairTrade && pairTrade.price
							? pairTrade.price
							: temp.close
							? temp.close
							: 0;
					tempTickers[key] = {
						...temp,
						close
					};
				}
			});
			return {
				...state,
				tickers: {
					...state.tickers,
					...tempTickers
				}
			};
		case SET_ORDER_LIMITS:
			return {
				...state,
				orderLimits: payload
			};
		case SET_VALID_BASE_CURRENCY:
			return {
				...state,
				isValidBase: payload.isValidBase
			};
		case SET_CONFIG:
			return {
				...state,
				constants: payload.constants,
				config_level: payload.config_level,
				enabledPlugins: payload.enabledPlugins
			};
		case SET_INFO:
			return {
				...state,
				info: payload.info
			};
		case SET_WAVE_AUCTION: 
			return {
				...state,
				wave: payload.data
			};
		default:
			return state;
	}
};

export default reducer;
