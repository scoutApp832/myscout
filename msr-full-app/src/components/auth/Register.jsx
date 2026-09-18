
import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { rwandaLocation } from '@devrw/rwanda-location';
import './Register.css';

const NATIONAL_LOCATION = {
  code: 'NATIONAL',
  name: 'National',
  isNational: true,
};

const TROOP_OPTIONS = [
  { value: 'donate', label: 'DONATE' },
  { value: 'leader', label: 'LEADER' },
  { value: 'coati_stoique', label: 'COATI STOIQUE' },
  { value: 'eagle_warriors', label: 'EAGLE WARRIORS' },
  { value: 'lion_pride', label: 'LION PRIDE' },
  { value: 'panther_claw', label: 'PANTHER CLAW' },
  { value: 'falcon_wing', label: 'FALCON WING' },
  { value: 'tiger_eye', label: 'TIGER EYE' },
  { value: 'wolf_pack', label: 'WOLF PACK' },
  { value: 'dragon_fire', label: 'DRAGON FIRE' },
  { value: 'phoenix_rise', label: 'PHOENIX RISE' },
  { value: 'shark_fin', label: 'SHARK FIN' },
];

const ROLES = [
  {
    value: 'scout',
    label: 'Scout Member',
  },
  {
    value: 'district_commissioner',
    label: 'District Commissioner',
  },
  {
    value: 'donor',
    label: 'Donation Partner',
  },
];

const GENDERS = [
  {
    value: 'male',
    label: 'Male',
  },
  {
    value: 'female',
    label: 'Female',
  },
  {
    value: 'other',
    label: 'Other',
  },
];

const translations = {
  en: {
    backHome: 'Back to Home',

    createAccount: 'Create Account',
    createAccountDescription:
      'Fill in your details to join the MSR community',

    registrationFailed: 'Registration Failed',
    registrationSubmitted: 'Registration Submitted!',

    personalInformation: 'Personal Information',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Enter your full name',

    emailAddress: 'Email Address',
    emailPlaceholder: 'Enter your email',

    password: 'Password',
    passwordPlaceholder: 'Create a password',
    passwordHint: 'Password must be at least 6 characters',

    confirmPassword: 'Confirm Password',
    confirmPasswordPlaceholder: 'Confirm your password',

    troopInformation: 'Troop Information',
    troop: 'Troop',
    selectTroop: 'Select your troop',
    leaderNotice: 'You are registering as a Leader.',

    locationInformation: 'Location Information',

    province: 'Province',
    selectProvince: 'Select your province',

    district: 'District',
    selectDistrict: 'Select your district',

    sector: 'Sector',
    selectSector: 'Select your sector',

    cell: 'Cell',
    selectCell: 'Select your cell',

    village: 'Village',
    villagePlaceholder: 'Enter your village',
    villageOptional: 'Village is optional.',

    locationSummary: 'Location Summary',
    provinceLabel: 'Province:',
    districtLabel: 'District:',
    sectorLabel: 'Sector:',
    cellLabel: 'Cell:',

    personalDetails: 'Personal Details',

    birthDate: 'Birth Date',

    gender: 'Gender',
    selectGender: 'Select your gender',

    phoneNumber: 'Phone Number',
    phonePlaceholder: 'e.g. 250788123456',
    phoneHint: 'Enter up to 15 digits (e.g., 250788123456)',

    role: 'Role',

    nationalCommissionerHint:
      'National Commissioner accounts are pre-created.',

    districtCommissionerNotice:
      'District Commissioner registration requires National Commissioner approval.',

    termsText: 'I agree to the',
    termsOfService: 'Terms of Service',
    and: 'and',
    privacyPolicy: 'Privacy Policy',

    createAccountButton: 'Create Account',
    creatingAccount: 'Creating Account...',

    alreadyAccount: 'Already have an account?',
    signIn: 'Sign In',

    goToLogin: 'Go to Login Page',

    errors: {
      fullNameRequired: 'Full name is required',
      emailRequired: 'Email is required',
      validEmail: 'Please enter a valid email address',

      passwordRequired: 'Password is required',
      passwordLength: 'Password must be at least 6 characters',

      confirmPassword: 'Please confirm your password',
      passwordsMismatch: 'Passwords do not match',

      troopRequired: 'Troop selection is required',

      provinceRequired: 'Please select your province',
      districtRequired: 'Please select your district',
      sectorRequired: 'Please select your sector',
      cellRequired: 'Please select your cell',

      birthDateRequired: 'Birth date is required',
      genderRequired: 'Please select your gender',

      phoneRequired: 'Phone number is required',
      phoneLength: 'Phone number must be at least 9 digits',

      termsRequired:
        'You must agree to the terms and conditions',

      registrationFailed:
        'Registration failed. Please try again.',

      registrationError:
        'An error occurred during registration. Please try again.',
    },

    successDistrictCommissioner:
      'Your registration has been submitted for approval by the National Commissioner. You will receive an email once your account is approved.',
  },

  rw: {
    backHome: 'Subira ku Rugo',

    createAccount: 'Fungura Konti',
    createAccountDescription:
      'Uzuza amakuru yawe kugira ngo winjire mu muryango wa MSR',

    registrationFailed: 'Kwiyandikisha Byanze',
    registrationSubmitted: 'Kwiyandikisha Byakiriwe!',

    personalInformation: 'Amakuru Bwite',
    fullName: 'Amazina Yuzuye',
    fullNamePlaceholder: 'Andika amazina yawe yuzuye',

    emailAddress: 'Aderesi ya Email',
    emailPlaceholder: 'Andika email yawe',

    password: 'Ijambobanga',
    passwordPlaceholder: 'Shyiraho ijambobanga',
    passwordHint:
      'Ijambobanga rigomba kuba rifite inyuguti nibura 6',

    confirmPassword: 'Emeza Ijambobanga',
    confirmPasswordPlaceholder:
      'Ongera wandike ijambobanga',

    troopInformation: 'Amakuru ya Troop',
    troop: 'Troop',
    selectTroop: 'Hitamo troop yawe',
    leaderNotice: 'Uri kwiyandikisha nka Leader.',

    locationInformation: 'Amakuru y’Aho Utuye',

    province: 'Intara',
    selectProvince: 'Hitamo intara yawe',

    district: 'Akarere',
    selectDistrict: 'Hitamo akarere kawe',

    sector: 'Umurenge',
    selectSector: 'Hitamo umurenge wawe',

    cell: 'Akagari',
    selectCell: 'Hitamo akagari kawe',

    village: 'Umudugudu',
    villagePlaceholder: 'Andika umudugudu wawe',
    villageOptional: 'Umudugudu si ngombwa.',

    locationSummary: 'Incamake y’Aho Utuye',
    provinceLabel: 'Intara:',
    districtLabel: 'Akarere:',
    sectorLabel: 'Umurenge:',
    cellLabel: 'Akagari:',

    personalDetails: 'Amakuru Yihariye',

    birthDate: 'Itariki y’Amavuko',

    gender: 'Igitsina',
    selectGender: 'Hitamo igitsina cyawe',

    phoneNumber: 'Numero ya Telefoni',
    phonePlaceholder: 'urugero: 250788123456',
    phoneHint:
      'Andika imibare igera kuri 15 (urugero: 250788123456)',

    role: 'Uruhare',

    nationalCommissionerHint:
      'Konti za National Commissioner zikorwa mbere.',

    districtCommissionerNotice:
      'Kwiyandikisha nka District Commissioner bisaba kwemezwa na National Commissioner.',

    termsText: 'Nemera',
    termsOfService: 'Amabwiriza y’Imikoreshereze',
    and: 'na',
    privacyPolicy: 'Politiki y’Ibanga',

    createAccountButton: 'Fungura Konti',
    creatingAccount: 'Konti irimo gufungurwa...',

    alreadyAccount: 'Usanzwe ufite konti?',
    signIn: 'Injira',

    goToLogin: 'Jya kuri Login',

    errors: {
      fullNameRequired: 'Amazina yuzuye arakenewe',
      emailRequired: 'Email irakenewe',
      validEmail: 'Andika aderesi ya email yemewe',

      passwordRequired: 'Ijambobanga rirakenewe',
      passwordLength:
        'Ijambobanga rigomba kuba rifite inyuguti nibura 6',

      confirmPassword: 'Emeza ijambobanga',
      passwordsMismatch:
        'Amabwiriza y’ibanga ntabwo ahura',

      troopRequired: 'Guhitamo troop ni ngombwa',

      provinceRequired: 'Hitamo intara yawe',
      districtRequired: 'Hitamo akarere kawe',
      sectorRequired: 'Hitamo umurenge wawe',
      cellRequired: 'Hitamo akagari kawe',

      birthDateRequired: 'Itariki y’amavuko irakenewe',
      genderRequired: 'Hitamo igitsina cyawe',

      phoneRequired: 'Numero ya telefoni irakenewe',
      phoneLength:
        'Numero ya telefoni igomba kuba ifite nibura imibare 9',

      termsRequired:
        'Ugomba kwemera amabwiriza n’amategeko',

      registrationFailed:
        'Kwiyandikisha byanze. Ongera ugerageze.',

      registrationError:
        'Habaye ikibazo mu gihe cyo kwiyandikisha. Ongera ugerageze.',
    },

    successDistrictCommissioner:
      'Kwiyandikisha kwawe koherejwe kuri National Commissioner kugira ngo kwemezwe. Uzakira email igihe konti yawe izaba yemejwe.',
  },
};

const Register = () => {
  const navigate = useNavigate();

  const { register } = useAuth();
  const { language } = useLanguage();

  const currentLanguage =
    language === 'rw' || language === 'en'
      ? language
      : 'en';

  const t = translations[currentLanguage];

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'scout',

    troopName: '',

    province: '',
    provinceCode: '',
    district: '',
    districtCode: '',
    sector: '',
    sectorCode: '',
    cell: '',
    cellCode: '',
    village: '',
    villageCode: '',

    birthDate: '',
    gender: '',
    phoneNumber: '',

    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] =
    useState('');

  const [selectedProvinceCode, setSelectedProvinceCode] =
    useState('');

  const [selectedDistrictCode, setSelectedDistrictCode] =
    useState('');

  const [selectedSectorCode, setSelectedSectorCode] =
    useState('');

  const provinces = useMemo(() => {
    try {
      return [
        NATIONAL_LOCATION,
        ...rwandaLocation.getProvinces(),
      ];
    } catch (error) {
      console.error(
        'Unable to load Rwanda provinces:',
        error
      );

      return [NATIONAL_LOCATION];
    }
  }, []);

  const availableDistricts = useMemo(() => {
    if (!selectedProvinceCode) {
      return [];
    }

    if (selectedProvinceCode === 'NATIONAL') {
      return [NATIONAL_LOCATION];
    }

    try {
      return rwandaLocation.getDistricts(
        Number(selectedProvinceCode)
      );
    } catch (error) {
      console.error(
        'Unable to load districts:',
        error
      );

      return [];
    }
  }, [selectedProvinceCode]);

  const availableSectors = useMemo(() => {
    if (!selectedDistrictCode) {
      return [];
    }

    if (selectedDistrictCode === 'NATIONAL') {
      return [NATIONAL_LOCATION];
    }

    try {
      return rwandaLocation.getSectors(
        Number(selectedDistrictCode)
      );
    } catch (error) {
      console.error(
        'Unable to load sectors:',
        error
      );

      return [];
    }
  }, [selectedDistrictCode]);

  const availableCells = useMemo(() => {
    if (!selectedSectorCode) {
      return [];
    }

    if (selectedSectorCode === 'NATIONAL') {
      return [NATIONAL_LOCATION];
    }

    try {
      return rwandaLocation.getCells(
        String(selectedSectorCode)
      );
    } catch (error) {
      console.error(
        'Unable to load cells:',
        error
      );

      return [];
    }
  }, [selectedSectorCode]);

  const clearError = (fieldName) => {
    setErrors((previous) => ({
      ...previous,
      [fieldName]: '',
    }));
  };

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }));

    clearError(name);
    setRegisterError('');
    setRegistrationSuccess('');
  };

  const handleTroopChange = (e) => {
    const troopName = e.target.value;

    setFormData((previous) => ({
      ...previous,
      troopName,
    }));

    clearError('troopName');
    setRegisterError('');
    setRegistrationSuccess('');
  };

  const handlePhoneChange = (e) => {
    const digitsOnly = e.target.value
      .replace(/\D/g, '')
      .slice(0, 15);

    setFormData((previous) => ({
      ...previous,
      phoneNumber: digitsOnly,
    }));

    clearError('phoneNumber');
    setRegisterError('');
    setRegistrationSuccess('');
  };

  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value;

    const province = provinces.find(
      (item) =>
        String(item.code) ===
        String(provinceCode)
    );

    setSelectedProvinceCode(provinceCode);
    setSelectedDistrictCode('');
    setSelectedSectorCode('');

    setFormData((previous) => ({
      ...previous,

      province: province?.name || '',
      provinceCode: provinceCode || '',

      district: '',
      districtCode: '',

      sector: '',
      sectorCode: '',

      cell: '',
      cellCode: '',

      village: '',
      villageCode: '',
    }));

    clearError('province');
    clearError('district');
    clearError('sector');
    clearError('cell');

    setRegisterError('');
    setRegistrationSuccess('');
  };

  const handleDistrictChange = (e) => {
    const districtCode = e.target.value;

    const district =
      availableDistricts.find(
        (item) =>
          String(item.code) ===
          String(districtCode)
      );

    setSelectedDistrictCode(districtCode);
    setSelectedSectorCode('');

    setFormData((previous) => ({
      ...previous,

      district: district?.name || '',
      districtCode: districtCode || '',

      sector: '',
      sectorCode: '',

      cell: '',
      cellCode: '',

      village: '',
      villageCode: '',
    }));

    clearError('district');
    clearError('sector');
    clearError('cell');

    setRegisterError('');
    setRegistrationSuccess('');
  };

  const handleSectorChange = (e) => {
    const sectorCode = e.target.value;

    const sector =
      availableSectors.find(
        (item) =>
          String(item.code) ===
          String(sectorCode)
      );

    setSelectedSectorCode(sectorCode);

    setFormData((previous) => ({
      ...previous,

      sector: sector?.name || '',
      sectorCode: sectorCode || '',

      cell: '',
      cellCode: '',

      village: '',
      villageCode: '',
    }));

    clearError('sector');
    clearError('cell');

    setRegisterError('');
    setRegistrationSuccess('');
  };

  const handleCellChange = (e) => {
    const cellCode = e.target.value;

    const cell =
      availableCells.find(
        (item) =>
          String(item.code) ===
          String(cellCode)
      );

    setFormData((previous) => ({
      ...previous,

      cell: cell?.name || '',
      cellCode: cellCode || '',

      village: '',
      villageCode: '',
    }));

    clearError('cell');

    setRegisterError('');
    setRegistrationSuccess('');
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName =
        t.errors.fullNameRequired;
    }

    if (!formData.email.trim()) {
      newErrors.email =
        t.errors.emailRequired;
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email
      )
    ) {
      newErrors.email =
        t.errors.validEmail;
    }

    if (!formData.password) {
      newErrors.password =
        t.errors.passwordRequired;
    } else if (
      formData.password.length < 6
    ) {
      newErrors.password =
        t.errors.passwordLength;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        t.errors.confirmPassword;
    } else if (
      formData.password !==
      formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        t.errors.passwordsMismatch;
    }

    if (!formData.troopName) {
      newErrors.troopName =
        t.errors.troopRequired;
    }

    if (!formData.province) {
      newErrors.province =
        t.errors.provinceRequired;
    }

    if (!formData.district) {
      newErrors.district =
        t.errors.districtRequired;
    }

    if (!formData.sector) {
      newErrors.sector =
        t.errors.sectorRequired;
    }

    if (!formData.cell) {
      newErrors.cell =
        t.errors.cellRequired;
    }

    if (!formData.birthDate) {
      newErrors.birthDate =
        t.errors.birthDateRequired;
    }

    if (!formData.gender) {
      newErrors.gender =
        t.errors.genderRequired;
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber =
        t.errors.phoneRequired;
    } else if (
      formData.phoneNumber.length < 9
    ) {
      newErrors.phoneNumber =
        t.errors.phoneLength;
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms =
        t.errors.termsRequired;
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (
      Object.keys(validationErrors).length > 0
    ) {
      setErrors(validationErrors);

      const firstError =
        document.querySelector('.error');

      if (firstError) {
        firstError.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }

      return;
    }

    setIsLoading(true);
    setRegisterError('');
    setRegistrationSuccess('');

    try {
      const userData = {
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        phone: formData.phoneNumber,
        role: formData.role,

        troopName: formData.troopName,

        province: formData.province,
        provinceCode: formData.provinceCode,

        district: formData.district,
        districtCode: formData.districtCode,

        sector: formData.sector,
        sectorCode: formData.sectorCode,

        cell: formData.cell,
        cellCode: formData.cellCode,

        village: formData.village,
        villageCode: formData.villageCode,

        birthDate: formData.birthDate,
        gender: formData.gender,
      };

      const result = await register(userData);

      if (result?.success) {
        if (
          formData.role ===
          'district_commissioner'
        ) {
          setRegistrationSuccess(
            t.successDistrictCommissioner
          );
        } else {
          navigate('/dashboard');
        }
      } else {
        setRegisterError(
          result?.message ||
            t.errors.registrationFailed
        );
      }
    } catch (error) {
      console.error(
        'Registration error:',
        error
      );

      setRegisterError(
        error?.response?.data?.message ||
          error?.message ||
          t.errors.registrationError
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">

      <div className="register-form-panel">

        <div className="register-card">

          <header className="register-header">

            <Link
              to="/"
              className="back-home"
            >
              <i className="fas fa-arrow-left"></i>
              <span>{t.backHome}</span>
            </Link>

            <div className="register-title">

              <div className="register-logo">
                <img
                  src="/logo1.png"
                  alt="MyScout Rwanda"
                />
              </div>

              <h1>{t.createAccount}</h1>

              <p>
                {t.createAccountDescription}
              </p>

            </div>

          </header>

          {registerError && (
            <div className="register-message register-message-error">

              <i className="fas fa-exclamation-circle"></i>

              <div>
                <strong>
                  {t.registrationFailed}
                </strong>

                <p>{registerError}</p>
              </div>

            </div>
          )}

          {registrationSuccess && (
            <div className="register-message register-message-success">

              <i className="fas fa-check-circle"></i>

              <div>
                <strong>
                  {t.registrationSubmitted}
                </strong>

                <p>
                  {registrationSuccess}
                </p>
              </div>

            </div>
          )}

          {!registrationSuccess && (
            <form
              onSubmit={handleSubmit}
              className="register-form"
              noValidate
            >

              {/* PERSONAL INFORMATION */}

              <section className="form-section">

                <h2 className="section-title">
                  <span className="section-icon">
                    <i className="fas fa-user"></i>
                  </span>

                  {t.personalInformation}
                </h2>

                <div className="form-row">

                  <div className="form-group">
                    <label htmlFor="fullName">
                      {t.fullName}
                      <span className="required">
                        *
                      </span>
                    </label>

                    <div className="input-wrapper">
                      <i className="fas fa-user"></i>

                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        placeholder={
                          t.fullNamePlaceholder
                        }
                        value={formData.fullName}
                        onChange={handleChange}
                        className={
                          errors.fullName
                            ? 'error'
                            : ''
                        }
                        autoComplete="name"
                      />
                    </div>

                    {errors.fullName && (
                      <span className="error-message">
                        {errors.fullName}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">
                      {t.emailAddress}
                      <span className="required">
                        *
                      </span>
                    </label>

                    <div className="input-wrapper">
                      <i className="fas fa-envelope"></i>

                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder={
                          t.emailPlaceholder
                        }
                        value={formData.email}
                        onChange={handleChange}
                        className={
                          errors.email
                            ? 'error'
                            : ''
                        }
                        autoComplete="email"
                      />
                    </div>

                    {errors.email && (
                      <span className="error-message">
                        {errors.email}
                      </span>
                    )}
                  </div>

                </div>

                <div className="form-row">

                  <div className="form-group">
                    <label htmlFor="password">
                      {t.password}
                      <span className="required">
                        *
                      </span>
                    </label>

                    <div className="input-wrapper">
                      <i className="fas fa-lock"></i>

                      <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder={
                          t.passwordPlaceholder
                        }
                        value={formData.password}
                        onChange={handleChange}
                        className={
                          errors.password
                            ? 'error'
                            : ''
                        }
                        autoComplete="new-password"
                      />
                    </div>

                    {errors.password && (
                      <span className="error-message">
                        {errors.password}
                      </span>
                    )}

                    <small className="form-hint">
                      {t.passwordHint}
                    </small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">
                      {t.confirmPassword}
                      <span className="required">
                        *
                      </span>
                    </label>

                    <div className="input-wrapper">
                      <i className="fas fa-lock"></i>

                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder={
                          t.confirmPasswordPlaceholder
                        }
                        value={
                          formData.confirmPassword
                        }
                        onChange={handleChange}
                        className={
                          errors.confirmPassword
                            ? 'error'
                            : ''
                        }
                        autoComplete="new-password"
                      />
                    </div>

                    {errors.confirmPassword && (
                      <span className="error-message">
                        {
                          errors.confirmPassword
                        }
                      </span>
                    )}
                  </div>

                </div>

              </section>

              {/* TROOP */}

              <section className="form-section">

                <h2 className="section-title">
                  <span className="section-icon">
                    <i className="fas fa-flag"></i>
                  </span>

                  {t.troopInformation}
                </h2>

                <div className="form-row">

                  <div className="form-group">

                    <label htmlFor="troopName">
                      {t.troop}
                      <span className="required">
                        *
                      </span>
                    </label>

                    <div className="input-wrapper select-wrapper">
                      <i className="fas fa-users"></i>

                      <select
                        id="troopName"
                        name="troopName"
                        value={
                          formData.troopName
                        }
                        onChange={
                          handleTroopChange
                        }
                        className={
                          errors.troopName
                            ? 'error'
                            : ''
                        }
                      >
                        <option value="">
                          {t.selectTroop}
                        </option>

                        {TROOP_OPTIONS.map(
                          (troop) => (
                            <option
                              key={
                                troop.value
                              }
                              value={
                                troop.value
                              }
                            >
                              {troop.label}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {errors.troopName && (
                      <span className="error-message">
                        {errors.troopName}
                      </span>
                    )}

                  </div>

                </div>

                {formData.troopName ===
                  'leader' && (
                  <div className="role-notice">
                    <i className="fas fa-user-shield"></i>
                    <span>
                      {t.leaderNotice}
                    </span>
                  </div>
                )}

              </section>

              {/* LOCATION */}

              <section className="form-section">

                <h2 className="section-title">
                  <span className="section-icon">
                    <i className="fas fa-location-dot"></i>
                  </span>

                  {t.locationInformation}
                </h2>

                <div className="form-row">

                  <div className="form-group">

                    <label htmlFor="province">
                      {t.province}
                      <span className="required">
                        *
                      </span>
                    </label>

                    <div className="input-wrapper select-wrapper">
                      <i className="fas fa-map"></i>

                      <select
                        id="province"
                        value={
                          selectedProvinceCode
                        }
                        onChange={
                          handleProvinceChange
                        }
                        className={
                          errors.province
                            ? 'error'
                            : ''
                        }
                      >
                        <option value="">
                          {t.selectProvince}
                        </option>

                        {provinces.map(
                          (province) => (
                            <option
                              key={
                                province.code
                              }
                              value={
                                province.code
                              }
                            >
                              {province.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {errors.province && (
                      <span className="error-message">
                        {errors.province}
                      </span>
                    )}

                  </div>

                  <div className="form-group">

                    <label htmlFor="district">
                      {t.district}
                      <span className="required">
                        *
                      </span>
                    </label>

                    <div className="input-wrapper select-wrapper">
                      <i className="fas fa-map-pin"></i>

                      <select
                        id="district"
                        value={
                          selectedDistrictCode
                        }
                        onChange={
                          handleDistrictChange
                        }
                        className={
                          errors.district
                            ? 'error'
                            : ''
                        }
                        disabled={
                          !selectedProvinceCode
                        }
                      >
                        <option value="">
                          {t.selectDistrict}
                        </option>

                        {availableDistricts.map(
                          (district) => (
                            <option
                              key={
                                district.code
                              }
                              value={
                                district.code
                              }
                            >
                              {district.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {errors.district && (
                      <span className="error-message">
                        {errors.district}
                      </span>
                    )}

                  </div>

                </div>

                <div className="form-row">

                  <div className="form-group">

                    <label htmlFor="sector">
                      {t.sector}
                      <span className="required">
                        *
                      </span>
                    </label>

                    <div className="input-wrapper select-wrapper">
                      <i className="fas fa-location-dot"></i>

                      <select
                        id="sector"
                        value={
                          selectedSectorCode
                        }
                        onChange={
                          handleSectorChange
                        }
                        className={
                          errors.sector
                            ? 'error'
                            : ''
                        }
                        disabled={
                          !selectedDistrictCode
                        }
                      >
                        <option value="">
                          {t.selectSector}
                        </option>

                        {availableSectors.map(
                          (sector) => (
                            <option
                              key={sector.code}
                              value={sector.code}
                            >
                              {sector.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {errors.sector && (
                      <span className="error-message">
                        {errors.sector}
                      </span>
                    )}

                  </div>

                  <div className="form-group">

                    <label htmlFor="cell">
                      {t.cell}
                      <span className="required">
                        *
                      </span>
                    </label>

                    <div className="input-wrapper select-wrapper">
                      <i className="fas fa-location-dot"></i>

                      <select
                        id="cell"
                        value={
                          formData.cellCode
                        }
                        onChange={
                          handleCellChange
                        }
                        className={
                          errors.cell
                            ? 'error'
                            : ''
                        }
                        disabled={
                          !selectedSectorCode
                        }
                      >
                        <option value="">
                          {t.selectCell}
                        </option>

                        {availableCells.map(
                          (cell) => (
                            <option
                              key={cell.code}
                              value={cell.code}
                            >
                              {cell.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {errors.cell && (
                      <span className="error-message">
                        {errors.cell}
                      </span>
                    )}

                  </div>

                </div>

                <div className="form-row">

                  <div className="form-group">

                    <label htmlFor="village">
                      {t.village}
                    </label>

                    <div className="input-wrapper">
                      <i className="fas fa-house"></i>

                      <input
                        type="text"
                        id="village"
                        name="village"
                        placeholder={
                          t.villagePlaceholder
                        }
                        value={
                          formData.village
                        }
                        onChange={
                          handleChange
                        }
                      />
                    </div>

                    <small className="form-hint">
                      {t.villageOptional}
                    </small>

                  </div>

                </div>

                {formData.province && (
                  <div className="location-summary">

                    <div className="summary-title">
                      <i className="fas fa-map-location-dot"></i>
                      {t.locationSummary}
                    </div>

                    <div className="summary-grid">

                      <div>
                        <span>
                          {t.provinceLabel}
                        </span>

                        <strong>
                          {formData.province}
                        </strong>
                      </div>

                      <div>
                        <span>
                          {t.districtLabel}
                        </span>

                        <strong>
                          {formData.district ||
                            '—'}
                        </strong>
                      </div>

                      <div>
                        <span>
                          {t.sectorLabel}
                        </span>

                        <strong>
                          {formData.sector ||
                            '—'}
                        </strong>
                      </div>

                      <div>
                        <span>
                          {t.cellLabel}
                        </span>

                        <strong>
                          {formData.cell ||
                            '—'}
                        </strong>
                      </div>

                    </div>

                  </div>
                )}

              </section>

              {/* PERSONAL DETAILS */}

              <section className="form-section">

                <h2 className="section-title">
                  <span className="section-icon">
                    <i className="fas fa-address-card"></i>
                  </span>

                  {t.personalDetails}
                </h2>

                <div className="form-row">

                  <div className="form-group">

                    <label htmlFor="birthDate">
                      {t.birthDate}
                      <span className="required">
                        *
                      </span>
                    </label>

                    <div className="input-wrapper">
                      <i className="fas fa-calendar"></i>

                      <input
                        type="date"
                        id="birthDate"
                        name="birthDate"
                        value={
                          formData.birthDate
                        }
                        onChange={
                          handleChange
                        }
                        className={
                          errors.birthDate
                            ? 'error'
                            : ''
                        }
                      />
                    </div>

                    {errors.birthDate && (
                      <span className="error-message">
                        {errors.birthDate}
                      </span>
                    )}

                  </div>

                  <div className="form-group">

                    <label htmlFor="gender">
                      {t.gender}
                      <span className="required">
                        *
                      </span>
                    </label>

                    <div className="input-wrapper select-wrapper">
                      <i className="fas fa-venus-mars"></i>

                      <select
                        id="gender"
                        name="gender"
                        value={
                          formData.gender
                        }
                        onChange={
                          handleChange
                        }
                        className={
                          errors.gender
                            ? 'error'
                            : ''
                        }
                      >
                        <option value="">
                          {t.selectGender}
                        </option>

                        {GENDERS.map(
                          (gender) => (
                            <option
                              key={
                                gender.value
                              }
                              value={
                                gender.value
                              }
                            >
                              {currentLanguage ===
                              'rw'
                                ? gender.value ===
                                  'male'
                                  ? 'Gabo'
                                  : gender.value ===
                                    'female'
                                    ? 'Gore'
                                    : 'Ikindi'
                                : gender.label}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {errors.gender && (
                      <span className="error-message">
                        {errors.gender}
                      </span>
                    )}

                  </div>

                </div>

                <div className="form-row">

                  <div className="form-group">

                    <label htmlFor="phoneNumber">
                      {t.phoneNumber}
                      <span className="required">
                        *
                      </span>
                    </label>

                    <div className="input-wrapper">
                      <i className="fas fa-phone"></i>

                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        placeholder={
                          t.phonePlaceholder
                        }
                        value={
                          formData.phoneNumber
                        }
                        onChange={
                          handlePhoneChange
                        }
                        className={
                          errors.phoneNumber
                            ? 'error'
                            : ''
                        }
                        autoComplete="tel"
                        maxLength={15}
                      />
                    </div>

                    {errors.phoneNumber && (
                      <span className="error-message">
                        {
                          errors.phoneNumber
                        }
                      </span>
                    )}

                    <small className="form-hint">
                      <i className="fas fa-info-circle"></i>
                      {' '}
                      {t.phoneHint}
                    </small>

                  </div>

                  <div className="form-group">

                    <label htmlFor="role">
                      {t.role}
                      <span className="required">
                        *
                      </span>
                    </label>

                    <div className="input-wrapper select-wrapper">
                      <i className="fas fa-user-tag"></i>

                      <select
                        id="role"
                        name="role"
                        value={
                          formData.role
                        }
                        onChange={
                          handleChange
                        }
                      >
                        {ROLES.map(
                          (role) => (
                            <option
                              key={
                                role.value
                              }
                              value={
                                role.value
                              }
                            >
                              {currentLanguage ===
                              'rw'
                                ? role.value ===
                                  'scout'
                                  ? 'Umunyasmuti'
                                  : role.value ===
                                    'district_commissioner'
                                    ? 'Komiseri w’Akarere'
                                    : 'Umufatanyabikorwa w’Inkunga'
                                : role.label}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <small className="form-hint">
                      <i className="fas fa-info-circle"></i>
                      {' '}
                      {t.nationalCommissionerHint}
                    </small>

                    {formData.role ===
                      'district_commissioner' && (
                      <div className="role-notice pending-notice">
                        <i className="fas fa-clock"></i>

                        <span>
                          {
                            t.districtCommissionerNotice
                          }
                        </span>
                      </div>
                    )}

                  </div>

                </div>

              </section>

              {/* TERMS */}

              <section className="form-section terms-section">

                <div className="checkbox-group">

                  <label className="checkbox-label">

                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={
                        formData.agreeTerms
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <span>

                      {t.termsText}{' '}

                      <Link to="/terms">
                        {t.termsOfService}
                      </Link>

                      {' '}{t.and}{' '}

                      <Link to="/privacy">
                        {t.privacyPolicy}
                      </Link>

                      <span className="required">
                        {' '}*
                      </span>

                    </span>

                  </label>

                  {errors.agreeTerms && (
                    <span className="error-message">
                      {errors.agreeTerms}
                    </span>
                  )}

                </div>

              </section>

              {/* SUBMIT */}

              <button
                type="submit"
                className="btn-register"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    {t.creatingAccount}
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus"></i>
                    {t.createAccountButton}
                  </>
                )}
              </button>

            </form>
          )}

          {/* FOOTER */}

          <footer className="register-footer">

            {registrationSuccess ? (
              <Link
                to="/login"
                className="login-link-button"
              >
                <i className="fas fa-arrow-right-to-bracket"></i>
                {t.goToLogin}
              </Link>
            ) : (
              <p>
                {t.alreadyAccount}{' '}

                <Link to="/login">
                  {t.signIn}
                </Link>
              </p>
            )}

          </footer>

        </div>

      </div>

    </div>
  );
};

export default Register;
