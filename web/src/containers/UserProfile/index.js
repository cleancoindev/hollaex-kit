import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ICONS } from '../../config/constants';
import { Accordion, Loader, Button } from '../../components';
import Form from './Form';
import { generateFormValues as generateMobileFormValues } from './MobileFormValues';
import {
	prepareInitialValues,
	generateFormValues as generateDataFormValues
} from './IdentificationFormValues';
import { InformationSection } from './InformationSection';
import { LevelSection } from './LevelSection';
import { logout } from '../../actions/authAction';
import STRINGS from '../../config/localizedStrings';
import { isMobile } from 'react-device-detect';

const MobileForm = Form('MobileForm');
const InformationForm = Form('InformationForm');

class UserProfile extends Component {
	state = {
		sections: [],
		dataFormValues: {},
		mobileFormValues: {}
	};

	componentDidMount() {
		this.calculateFormValues(
			this.props.activeLanguage,
			this.props.verification_level,
			this.props.email,
			this.props.userData,
			this.props.limits,
			this.props.fees
		);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.activeLanguage !== this.props.activeLanguage) {
			this.calculateFormValues(
				nextProps.activeLanguage,
				nextProps.verification_level,
				nextProps.email,
				nextProps.userData,
				nextProps.limits,
				nextProps.fees
			);
			this.calculateSections(
				nextProps.verification_level,
				nextProps.email,
				nextProps.userData,
				nextProps.limits,
				nextProps.fees
			);
		} else if (
			nextProps.verification_level !== this.props.verification_level ||
			nextProps.userData.timestamp !== this.props.userData.timestamp ||
			nextProps.limits.fetched !== this.props.limits.fetched ||
			nextProps.fees.fetched !== this.props.fees.fetched
		) {
			this.calculateSections(
				nextProps.verification_level,
				nextProps.email,
				nextProps.userData,
				nextProps.limits,
				nextProps.fees
			);
		}
	}

	generateNotification = (
		verified = false,
		provided = false,
		verifyText = ''
	) => {
		return {
			text: verified
				? STRINGS.USER_VERIFICATION.COMPLETED
				: provided
					? STRINGS.USER_VERIFICATION.PENDING_VERIFICATION
					: verifyText,
			status: verified ? 'success' : provided ? 'information' : 'warning',
			iconPath: verified
				? ICONS.GREEN_CHECK
				: provided ? ICONS.BLUE_TIMER : ICONS.RED_ARROW,
			allowClick: false
		};
	};

	calculateFormValues = (
		language,
		verification_level,
		email,
		userData,
		limits,
		fees
	) => {
		const dataFormValues = generateDataFormValues(
			language,
			userData.nationality
		);
		const mobileFormValues = generateMobileFormValues();
		this.setState({ dataFormValues, mobileFormValues }, () => {
			this.calculateSections(verification_level, email, userData, limits, fees);
		});
	};

	renderGoToVerification = () => (
		<InformationSection
			onChangeText={STRINGS.USER_VERIFICATION.GOTO_VERIFICATION}
			onChangeValue={this.goToVerification}
		/>
	);

	calculateSections = (verification_level, email, userData, limits, fees) => {
		const { dataFormValues, mobileFormValues } = this.state;
		const { phone_number, full_name, id_data = {} } = userData;

		const sections = [
			{
				title: STRINGS.USER_VERIFICATION.TITLE_EMAIL,
				subtitle: email,
				content: (
					<LevelSection
						limits={limits}
						verification_level={verification_level}
						fees={fees}
					>
						<InformationSection
							onChangeValue={this.onOpenContactFormSelected(
								'category',
								'level'
							)}
							onChangeText={STRINGS.UPGRADE_LEVEL}
						/>
					</LevelSection>
				),
				isOpen: true,
				notification: this.generateNotification(
					true,
					true,
					STRINGS.USER_VERIFICATION.VERIFY_EMAIL
				)
			},
			{
				title: STRINGS.USER_VERIFICATION.TITLE_MOBILE_PHONE,
				subtitle: phone_number,
				content: phone_number ? (
					<MobileForm initialValues={userData} formValues={mobileFormValues}>
						<InformationSection onChangeValue={this.onOpenContactForm} />
					</MobileForm>
				) : (
					this.renderGoToVerification()
				),
				notification: this.generateNotification(
					!!phone_number,
					!!phone_number,
					STRINGS.USER_VERIFICATION.VERIFY_MOBILE_PHONE
				)
			},
			{
				title: STRINGS.USER_VERIFICATION.TITLE_PERSONAL_INFORMATION,
				subtitle: full_name,
				content: full_name ? (
					<InformationForm
						initialValues={prepareInitialValues(userData)}
						formValues={dataFormValues}
					>
						<InformationSection
							text={
								verification_level === 1
									? STRINGS.USER_VERIFICATION
											.PENDING_VERIFICATION_PERSONAL_INFORMATION
									: ''
							}
							onChangeValue={this.onOpenContactForm}
						/>
					</InformationForm>
				) : (
					this.renderGoToVerification()
				),
				notification: this.generateNotification(
					verification_level > 1,
					!!full_name,
					STRINGS.USER_VERIFICATION.VERIFY_USER_DOCUMENTATION
				)
			},
			{
				title: STRINGS.USER_VERIFICATION.TITLE_ID_DOCUMENTS,
				content: (
					<div>
						{id_data.provided ? (
							<InformationSection
								text={
									id_data.type
										? ''
										: STRINGS.USER_VERIFICATION.PENDING_VERIFICATION_DOCUMENTS
								}
								onChangeValue={this.onOpenContactForm}
							/>
						) : (
							this.renderGoToVerification()
						)}
					</div>
				),
				disabled: id_data.verified,
				notification: this.generateNotification(
					id_data.verified,
					id_data.provided,
					STRINGS.USER_VERIFICATION.VERIFY_ID_DOCUMENTS
				)
			}
		];

		this.setState({ sections });
	};

	goToVerification = () => {
		if (this.props.goToVerification) {
			this.props.goToVerification();
		}
	};

	onOpenContactForm = () => {
		const { links = {} } = this.props.constants;
		if (this.props.openContactForm) {
			this.props.openContactForm({ helpdesk: links.helpdesk });
		}
	};

	onOpenContactFormSelected = (key = '', value = '') => () => {
		const { links = {} } = this.props.constants;
		if (this.props.openContactForm) {
			this.props.openContactForm({ [key]: value, helpdesk: links.helpdesk });
		}
	};

	render() {
		if (!this.props.id) {
			return <Loader />;
		}
		const { sections } = this.state;
		return (
			<div>
				<Accordion
					sections={sections}
					allowMultiOpen={true}
					wrapperId="app_container-main"
					doScroll={false}
				/>
				{isMobile && (
					<Button
						label={STRINGS.LOGOUT}
						onClick={() => this.props.logout()}
						className="mt-4"
					/>
				)}
			</div>
		);
	}
}

const mapDispatchToProps = (dispatch) => ({
	logout: bindActionCreators(logout, dispatch)
});

const mapStateToProps = (state) => ({
	id: state.user.id,
	verification_level: state.user.verification_level,
	userData: state.user.userData,
	email: state.user.email,
	limits: state.user.limits,
	fees: state.user.feeValues,
	activeLanguage: state.app.language,
	constants: state.app.constants
});

export default connect(mapStateToProps, mapDispatchToProps)(UserProfile);
