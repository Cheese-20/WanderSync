import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../components/NavBar';
import '../styles/localGuide.css';
import { getStoredUser, isPendingGuide, setStoredRole } from '../utils/session';
import { MIN_GUIDE_AGE, withdrawGuideApplication, messageFromError } from '../utils/guideApplication';
import { validateSaIdNumber, SA_ID_LENGTH } from '../utils/saId';

export default function LocalGuideApplication() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [apiError, setApiError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // An application already awaiting review means the form is replaced by a status panel.
    const [hasPendingApplication, setHasPendingApplication] = useState(isPendingGuide());

    const [formData, setFormData] = useState({
        idNo: '',
        reason: '',
        location: '',
        bio: ''
    });

    const [formErrors, setFormErrors] = useState({});
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const user = getStoredUser();
        if (!user) {
            navigate('/login', {
                state: { message: 'Please login to apply as a Local Guide' }
            });
            return;
        }
        setUserId(user.id || user.userID);
    }, [navigate]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        // The ID field only ever holds digits, capped at the exact SA ID length.
        const nextValue = id === 'idNo'
            ? value.replace(/\D/g, '').slice(0, SA_ID_LENGTH)
            : value;

        setFormData(prev => ({ ...prev, [id]: nextValue }));

        if (formErrors[id]) {
            setFormErrors(prev => ({ ...prev, [id]: '' }));
        }
    };

    const isFormDirty = () =>
        Object.values(formData).some(value => value.trim() !== '');

    const validateForm = () => {
        const errors = {};

        // ID number: exactly 13 digits, and the encoded date of birth must clear the age bar.
        const idError = validateSaIdNumber(formData.idNo, MIN_GUIDE_AGE);
        if (idError) errors.idNo = idError;

        if (!formData.location.trim()) {
            errors.location = 'Location is required';
        }

        if (!formData.bio.trim()) {
            errors.bio = 'Bio is required';
        } else if (formData.bio.trim().length > 250) {
            errors.bio = 'Bio must be 250 characters or less';
        }

        // Reason is optional - no validation

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleCancel = () => {
        if (isFormDirty() && !window.confirm('Discard this application? Anything you have typed will be lost.')) {
            return;
        }
        setFormData({ idNo: '', reason: '', location: '', bio: '' });
        setFormErrors({});
        navigate('/profile');
    };

    const handleWithdraw = async () => {
        if (!window.confirm('Cancel your Local Guide application? You can apply again later.')) {
            return;
        }

        setApiError('');
        setSuccessMessage('');
        setIsWithdrawing(true);

        try {
            await withdrawGuideApplication(userId);
            setHasPendingApplication(false);
            setSuccessMessage('Your application has been cancelled. Redirecting to your profile...');
            setTimeout(() => {
                navigate('/profile', {
                    state: { message: 'Local Guide application cancelled.' }
                });
            }, 1500);
        } catch (error) {
            setApiError(messageFromError(error, 'Failed to cancel your application. Please try again.'));
        } finally {
            setIsWithdrawing(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        setSuccessMessage('');

        if (!validateForm()) {
            const firstError = document.querySelector('.error-message');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        setIsSubmitting(true);

        try {
            const currentUserId = userId;
            if (!currentUserId || currentUserId <= 0) {
                throw new Error('User not found. Please log in again.');
            }

            await axios.post('/api/local-guide/apply', {
                userID: currentUserId,
                idNo: formData.idNo,
                reason: formData.reason.trim(),
                location: formData.location.trim(),
                bio: formData.bio.trim()
            });

            // The server moved the account to PendingGuide; keep the cached role in step.
            setStoredRole('PendingGuide');
            setHasPendingApplication(true);
            setSuccessMessage('Your application has been submitted successfully! Redirecting to your profile...');

            setTimeout(() => {
                navigate('/profile', {
                    state: { message: 'Local Guide application submitted successfully!' }
                });
            }, 2000);
        } catch (error) {
            console.error('Application error:', error);
            setApiError(messageFromError(error, 'Failed to submit application. Please try again.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <NavBar />
            <div className="local-guide-page">
                <div className="application-container">
                    <button type="button" className="lg-back-link" onClick={handleBack}>
                        &#8592; Back
                    </button>

                    <div className="application-card">
                        {apiError && (
                            <div className="api-error-message">
                                <span className="error-icon">!</span>
                                {apiError}
                            </div>
                        )}

                        {successMessage && (
                            <div className="success-message">
                                <span className="success-icon">&#10003;</span>
                                {successMessage}
                            </div>
                        )}

                        {hasPendingApplication ? (
                            <div className="pending-panel">
                                <span className="pending-badge">Awaiting review</span>
                                <h2>Your application is with our admins</h2>
                                <p>
                                    We are reviewing your Local Guide application. You will be notified as
                                    soon as a decision has been made.
                                </p>
                                <p>
                                    Changed your mind? You can cancel it while it is still awaiting review.
                                    Once it has been approved it can no longer be cancelled here.
                                </p>
                                <div className="pending-actions">
                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={() => navigate('/profile')}
                                    >
                                        Back to profile
                                    </button>
                                    <button
                                        type="button"
                                        className="danger-button"
                                        onClick={handleWithdraw}
                                        disabled={isWithdrawing}
                                    >
                                        {isWithdrawing ? 'Cancelling...' : 'Cancel application'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="form-title">
                                    <h2>Local Guide Application Form</h2>
                                    <p>Join our community of local guides and share your expertise</p>
                                </div>

                                <form id="guideForm" onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="idNo">ID Number *</label>
                                        <input
                                            type="text"
                                            id="idNo"
                                            inputMode="numeric"
                                            maxLength={SA_ID_LENGTH}
                                            value={formData.idNo}
                                            onChange={handleChange}
                                            className={formErrors.idNo ? 'error' : ''}
                                            placeholder={`${SA_ID_LENGTH}-digit ID number`}
                                            aria-describedby="idNo-hint"
                                        />
                                        <p id="idNo-hint" className="field-hint">
                                            Exactly {SA_ID_LENGTH} digits. You must be older than {MIN_GUIDE_AGE} to
                                            become a Local Guide, which we check against your ID.
                                        </p>
                                        {formErrors.idNo && <span className="error-message">{formErrors.idNo}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="location">Location *</label>
                                        <input
                                            type="text"
                                            id="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            className={formErrors.location ? 'error' : ''}
                                            placeholder="Enter your city/area"
                                        />
                                        {formErrors.location && <span className="error-message">{formErrors.location}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="bio">Bio * <span className="char-count">({formData.bio.length}/250)</span></label>
                                        <textarea
                                            id="bio"
                                            rows="4"
                                            maxLength="250"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            className={formErrors.bio ? 'error' : ''}
                                            placeholder="Tell us about yourself and your guiding expertise..."
                                        />
                                        {formErrors.bio && <span className="error-message">{formErrors.bio}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="reason">Why do you want to become a Local Guide? (Optional)</label>
                                        <textarea
                                            id="reason"
                                            rows="4"
                                            value={formData.reason}
                                            onChange={handleChange}
                                            placeholder="Tell us your motivation..."
                                        />
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            type="button"
                                            className="secondary-button"
                                            onClick={handleCancel}
                                            disabled={isSubmitting}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="submit-button"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting && <span className="lg-spinner" />}
                                            {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
