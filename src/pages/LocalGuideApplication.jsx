import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import '../styles/localGuide.css';

export default function LocalGuideApplication() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [formData, setFormData] = useState({
        idNo: '',
        reason: '',
        location: '',
        bio: ''
    });

    const [formErrors, setFormErrors] = useState({});
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const userJson = localStorage.getItem('user');
        if (!userJson) {
            navigate('/login', {
                state: { message: 'Please login to apply as a Local Guide' }
            });
            return;
        }

        try {
            const user = JSON.parse(userJson);
            setUserId(user.id || user.userID);
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));

        if (formErrors[id]) {
            setFormErrors(prev => ({
                ...prev,
                [id]: ''
            }));
        }
    };

    const validateForm = () => {
        const errors = {};

        // ID Number (required)
        if (!formData.idNo.trim()) {
            errors.idNo = 'ID number is required';
        } else if (!/^\d+$/.test(formData.idNo.trim())) {
            errors.idNo = 'ID number must contain only numbers';
        }

        // Location (required)
        if (!formData.location.trim()) {
            errors.location = 'Location is required';
        }

        // Bio (required, max 250 characters)
        if (!formData.bio.trim()) {
            errors.bio = 'Bio is required';
        } else if (formData.bio.trim().length > 250) {
            errors.bio = 'Bio must be 250 characters or less';
        }

        // Reason is optional - no validation

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
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
            const user = JSON.parse(localStorage.getItem('user'));
            const currentUserId = user?.id || user?.userID;

            if (!currentUserId || currentUserId <= 0) {
                throw new Error('User not found. Please log in again.');
            }

            const payload = {
                userID: currentUserId,
                idNo: parseInt(formData.idNo.trim(), 10),
                reason: formData.reason.trim(),
                location: formData.location.trim(),
                bio: formData.bio.trim()
            };

            const response = await fetch('/api/local-guide/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const contentType = response.headers.get('content-type');
            let data;
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                throw new Error('Server error. Please ensure the backend is running correctly.');
            }

            if (!response.ok) {
                throw new Error(data.message || 'Application submission failed');
            }

            setSuccessMessage('Your application has been submitted successfully! Redirecting to your profile...');

            setTimeout(() => {
                navigate('/profile', {
                    state: { message: 'Local Guide application submitted successfully!' }
                });
            }, 2000);

        } catch (error) {
            console.error('Application error:', error);
            setApiError(error.message || 'Failed to submit application. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="local-guide-page">
            <NavBar />

            <div className="application-container">
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
                                value={formData.idNo}
                                onChange={handleChange}
                                className={formErrors.idNo ? 'error' : ''}
                                placeholder="Enter your ID number"
                            />
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

                        <button
                            type="submit"
                            className="submit-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
