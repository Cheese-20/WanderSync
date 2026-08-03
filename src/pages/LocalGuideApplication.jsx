import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import '../styles/localGuide.css';

export default function LocalGuideApplication() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isEligible, setIsEligible] = useState(false);
    const [activityCount, setActivityCount] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        age: '',
        idNumber: '',
        location: '',
        experience: '',
        reason: '',
        profileImage: null,
        idCopy: null
    });

    const [formErrors, setFormErrors] = useState({});
    const [previewImages, setPreviewImages] = useState({
        profile: null,
        idCopy: null
    });

    // Check user eligibility (must have participated in at least 5 activities)
    useEffect(() => {
        const checkEligibility = async () => {
            try {
                // Get current user from localStorage or context
                const user = JSON.parse(localStorage.getItem('user'));

                if (!user) {
                    // No user in localStorage — redirect to login
                    navigate('/login', {
                        state: { message: 'Please login to apply as a Local Guide' }
                    });
                    return;
                }

                // Fetch user's activity participation count via Vite proxy (/api → localhost:5200)
                const response = await fetch(`/api/user/activities/count/${user.id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    const count = data.activityCount || 0;
                    setActivityCount(count);
                    setIsEligible(count >= 5);

                    // Pre-fill form with user data
                    setFormData(prev => ({
                        ...prev,
                        firstName: user.name || '',
                        lastName: user.surname || '',
                        email: user.email || '',
                        phoneNumber: user.phoneNumber || '',
                        age: user.age || ''
                    }));
                } else {
                    // If API fails, use mock data for demonstration
                    // Remove this in production
                    const mockCount = 7;
                    setActivityCount(mockCount);
                    setIsEligible(mockCount >= 5);

                    // Pre-fill with mock user data
                    const mockUser = {
                        name: 'John',
                        surname: 'Doe',
                        email: 'john@example.com',
                        phoneNumber: '0821234567',
                        age: 28
                    };
                    setFormData(prev => ({
                        ...prev,
                        firstName: mockUser.name,
                        lastName: mockUser.surname,
                        email: mockUser.email,
                        phoneNumber: mockUser.phoneNumber,
                        age: mockUser.age
                    }));
                }
            } catch (error) {
                console.error('Error checking eligibility:', error);
                // For demo purposes, set mock data
                setActivityCount(7);
                setIsEligible(true);
            } finally {
                setLoading(false);
            }
        };

        checkEligibility();
    }, [navigate]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));

        // Clear error for this field
        if (formErrors[id]) {
            setFormErrors(prev => ({
                ...prev,
                [id]: ''
            }));
        }
    };

    const handleFileChange = (e) => {
        const { id, files } = e.target;
        const file = files[0];

        if (file) {
            setFormData(prev => ({
                ...prev,
                [id]: file
            }));

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImages(prev => ({
                    ...prev,
                    [id === 'profileImage' ? 'profile' : 'idCopy']: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        const errors = {};

        // First Name
        if (!formData.firstName.trim()) {
            errors.firstName = 'First name is required';
        } else if (formData.firstName.trim().length < 2) {
            errors.firstName = 'First name must be at least 2 characters';
        }

        // Last Name
        if (!formData.lastName.trim()) {
            errors.lastName = 'Last name is required';
        } else if (formData.lastName.trim().length < 2) {
            errors.lastName = 'Last name must be at least 2 characters';
        }

        // Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Phone Number
        const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
        if (!formData.phoneNumber.trim()) {
            errors.phoneNumber = 'Phone number is required';
        } else if (!phoneRegex.test(formData.phoneNumber)) {
            errors.phoneNumber = 'Please enter a valid phone number';
        }

        // Age
        if (!formData.age) {
            errors.age = 'Please select your age';
        } else if (parseInt(formData.age) < 18) {
            errors.age = 'You must be at least 18 years old to apply';
        }

        // ID Number
        if (!formData.idNumber.trim()) {
            errors.idNumber = 'ID number is required';
        } else if (formData.idNumber.trim().length !== 13) {
            errors.idNumber = 'Please enter a valid 13-digit ID number';
        } else if (!/^\d{13}$/.test(formData.idNumber)) {
            errors.idNumber = 'ID number must contain only numbers';
        }

        // Location
        if (!formData.location.trim()) {
            errors.location = 'Location is required';
        }

        // Experience
        if (!formData.experience.trim()) {
            errors.experience = 'Please describe your experience';
        } else if (formData.experience.trim().length < 20) {
            errors.experience = 'Please provide more detail (minimum 20 characters)';
        }

        // Reason
        if (!formData.reason.trim()) {
            errors.reason = 'Please tell us why you want to become a Local Guide';
        } else if (formData.reason.trim().length < 30) {
            errors.reason = 'Please provide more detail (minimum 30 characters)';
        }

        // Profile Image
        if (!formData.profileImage) {
            errors.profileImage = 'Profile picture is required';
        } else if (formData.profileImage.size > 5 * 1024 * 1024) {
            errors.profileImage = 'Profile picture must be less than 5MB';
        }

        // ID Copy
        if (!formData.idCopy) {
            errors.idCopy = 'ID copy is required';
        } else if (formData.idCopy.size > 5 * 1024 * 1024) {
            errors.idCopy = 'ID copy must be less than 5MB';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        setSuccessMessage('');

        if (!isEligible) {
            setApiError(`You need to participate in at least 5 activities to apply. You have participated in ${activityCount} activities.`);
            return;
        }

        if (!validateForm()) {
            // Scroll to first error
            const firstError = document.querySelector('.error-message');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        setIsSubmitting(true);

        try {
            // Get current user
            const user = JSON.parse(localStorage.getItem('user'));

            if (!user) {
                throw new Error('You must be logged in to submit an application.');
            }

            // Create FormData for file uploads
            const submitData = new FormData();
            submitData.append('userId', user.id);
            submitData.append('firstName', formData.firstName.trim());
            submitData.append('lastName', formData.lastName.trim());
            submitData.append('email', formData.email.trim());
            submitData.append('phoneNumber', formData.phoneNumber.trim());
            submitData.append('age', formData.age);
            submitData.append('idNumber', formData.idNumber.trim());
            submitData.append('location', formData.location.trim());
            submitData.append('experience', formData.experience.trim());
            submitData.append('reason', formData.reason.trim());
            submitData.append('profileImage', formData.profileImage);
            submitData.append('idCopy', formData.idCopy);
            submitData.append('activityCount', activityCount);

            // Submit via Vite proxy (/api → localhost:5200)
            const response = await fetch('/api/local-guide/apply', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: submitData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Application submission failed');
            }

            setSuccessMessage('Your application has been submitted successfully! We will review it and get back to you within 48 hours.');

            // Reset form after successful submission
            setTimeout(() => {
                navigate('/application-status', {
                    state: { message: 'Application submitted successfully!' }
                });
            }, 3000);

        } catch (error) {
            console.error('Application error:', error);
            setApiError(error.message || 'Failed to submit application. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Generate age options
    const ageOptions = [];
    for (let i = 18; i <= 80; i++) {
        ageOptions.push(i);
    }

    if (loading) {
        return (
            <div className="local-guide-page">
                <NavBar />
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Checking your eligibility...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="local-guide-page">
            <NavBar />

            <div className="application-container">
                <div className="application-card">
                    {/* Eligibility Banner */}
                    <div className={`eligibility-banner ${isEligible ? 'eligible' : 'not-eligible'}`}>
                        <div className="eligibility-icon">
                            {isEligible ? '✓' : '⚠'}
                        </div>
                        <div className="eligibility-content">
                            <h3>
                                {isEligible
                                    ? 'You are eligible to apply!'
                                    : 'You are not yet eligible'}
                            </h3>
                            <p>
                                {isEligible
                                    ? `You have participated in ${activityCount} activities. Great job!`
                                    : `You have participated in ${activityCount} out of 5 required activities. Keep exploring!`}
                            </p>
                            {!isEligible && (
                                <Link to="/explore" className="explore-link">
                                    Discover more activities →
                                </Link>
                            )}
                        </div>
                    </div>

                    {apiError && (
                        <div className="api-error-message">
                            <span className="error-icon">⚠</span>
                            {apiError}
                        </div>
                    )}

                    {successMessage && (
                        <div className="success-message">
                            <span className="success-icon">✓</span>
                            {successMessage}
                        </div>
                    )}

                    <div className="form-title">
                        <h2>Local Guide Application Form</h2>
                        <p>Join our community of local guides and share your expertise</p>
                    </div>

                    <form id="guideForm" onSubmit={handleSubmit} encType="multipart/form-data">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="firstName">First Name *</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className={formErrors.firstName ? 'error' : ''}
                                    disabled={!isEligible}
                                    placeholder="Enter your first name"
                                />
                                {formErrors.firstName && <span className="error-message">{formErrors.firstName}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="lastName">Last Name *</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className={formErrors.lastName ? 'error' : ''}
                                    disabled={!isEligible}
                                    placeholder="Enter your last name"
                                />
                                {formErrors.lastName && <span className="error-message">{formErrors.lastName}</span>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="email">Email *</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={formErrors.email ? 'error' : ''}
                                    disabled={!isEligible}
                                    placeholder="Enter your email address"
                                />
                                {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="phoneNumber">Phone Number *</label>
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className={formErrors.phoneNumber ? 'error' : ''}
                                    disabled={!isEligible}
                                    placeholder="Enter your phone number"
                                />
                                {formErrors.phoneNumber && <span className="error-message">{formErrors.phoneNumber}</span>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="age">Age *</label>
                                <select
                                    id="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    className={formErrors.age ? 'error' : ''}
                                    disabled={!isEligible}
                                >
                                    <option value="">Select Age</option>
                                    {ageOptions.map(age => (
                                        <option key={age} value={age}>{age}</option>
                                    ))}
                                </select>
                                {formErrors.age && <span className="error-message">{formErrors.age}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="idNumber">ID Number *</label>
                                <input
                                    type="text"
                                    id="idNumber"
                                    maxLength="13"
                                    value={formData.idNumber}
                                    onChange={handleChange}
                                    className={formErrors.idNumber ? 'error' : ''}
                                    disabled={!isEligible}
                                    placeholder="Enter 13-digit ID number"
                                />
                                {formErrors.idNumber && <span className="error-message">{formErrors.idNumber}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="location">Location *</label>
                            <input
                                type="text"
                                id="location"
                                value={formData.location}
                                onChange={handleChange}
                                className={formErrors.location ? 'error' : ''}
                                disabled={!isEligible}
                                placeholder="Enter your city/area"
                            />
                            {formErrors.location && <span className="error-message">{formErrors.location}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="experience">Years of Experience *</label>
                            <textarea
                                id="experience"
                                rows="5"
                                value={formData.experience}
                                onChange={handleChange}
                                className={formErrors.experience ? 'error' : ''}
                                disabled={!isEligible}
                                placeholder="Describe your experience as a guide or in relevant fields..."
                            />
                            {formErrors.experience && <span className="error-message">{formErrors.experience}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="reason">Why do you want to become a Local Guide? *</label>
                            <textarea
                                id="reason"
                                rows="6"
                                value={formData.reason}
                                onChange={handleChange}
                                className={formErrors.reason ? 'error' : ''}
                                disabled={!isEligible}
                                placeholder="Tell us your motivation and what you can contribute..."
                            />
                            {formErrors.reason && <span className="error-message">{formErrors.reason}</span>}
                        </div>

                        <div className="form-row">
                            <div className="form-group file-upload-group">
                                <label htmlFor="profileImage">Upload Profile Picture *</label>
                                <div className="file-upload-wrapper">
                                    <input
                                        type="file"
                                        id="profileImage"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className={formErrors.profileImage ? 'error' : ''}
                                        disabled={!isEligible}
                                    />
                                    <div className="file-upload-label">
                                        <span>Choose a profile picture</span>
                                    </div>
                                </div>
                                {formErrors.profileImage && <span className="error-message">{formErrors.profileImage}</span>}
                                {previewImages.profile && (
                                    <div className="image-preview">
                                        <img src={previewImages.profile} alt="Profile preview" />
                                        <button
                                            type="button"
                                            className="remove-image"
                                            onClick={() => {
                                                setPreviewImages(prev => ({ ...prev, profile: null }));
                                                setFormData(prev => ({ ...prev, profileImage: null }));
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="form-group file-upload-group">
                                <label htmlFor="idCopy">Upload ID Copy (PDF/Image) *</label>
                                <div className="file-upload-wrapper">
                                    <input
                                        type="file"
                                        id="idCopy"
                                        accept=".pdf,image/*"
                                        onChange={handleFileChange}
                                        className={formErrors.idCopy ? 'error' : ''}
                                        disabled={!isEligible}
                                    />
                                    <div className="file-upload-label">
                                        <span>Upload ID document</span>
                                    </div>
                                </div>
                                {formErrors.idCopy && <span className="error-message">{formErrors.idCopy}</span>}
                                {previewImages.idCopy && (
                                    <div className="image-preview">
                                        <img src={previewImages.idCopy} alt="ID copy preview" />
                                        <button
                                            type="button"
                                            className="remove-image"
                                            onClick={() => {
                                                setPreviewImages(prev => ({ ...prev, idCopy: null }));
                                                setFormData(prev => ({ ...prev, idCopy: null }));
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="submit-button"
                            disabled={!isEligible || isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="spinner"></span>
                                    Submitting Application...
                                </>
                            ) : (
                                'Submit Application'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}