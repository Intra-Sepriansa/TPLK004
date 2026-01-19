/**
 * English Translation
 * Formal English for professional web applications
 */

import type { TranslationKeys } from './id';

export const en: TranslationKeys = {
    // Common
    common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        search: 'Search',
        loading: 'Loading...',
        saving: 'Saving...',
        success: 'Success',
        error: 'Error',
        confirm: 'Confirm',
        yes: 'Yes',
        no: 'No',
    },

    // Settings Page
    settings: {
        title: 'Settings',
        subtitle: 'Manage Lecturer Preferences',
        description: 'Customize your teaching experience',
        reset: 'Reset',
        saveChanges: 'Save Changes',
        resetSuccess: 'Settings successfully reset',
        saveSuccess: 'Settings successfully saved',
        loadError: 'Failed to load settings',
        saveError: 'Failed to save settings',
        
        // Categories
        categories: {
            general: {
                title: 'General Settings',
                description: 'Manage basic preferences and regional settings',
            },
            teaching: {
                title: 'Teaching',
                description: 'Settings related to teaching methods and evaluation',
            },
            classManagement: {
                title: 'Class Management',
                description: 'Manage preferences for class and student management',
            },
            notifications: {
                title: 'Notifications',
                description: 'Control how and when you receive notifications',
            },
            appearance: {
                title: 'Appearance',
                description: 'Customize the look and feel of your interface',
            },
            privacy: {
                title: 'Privacy',
                description: 'Manage privacy and data sharing preferences',
            },
            security: {
                title: 'Security',
                description: 'Protect your account with security features',
            },
            dataManagement: {
                title: 'Data Management',
                description: 'Manage your data, storage, and backups',
            },
        },

        // General Settings
        general: {
            language: 'Language',
            languageDesc: 'Select interface language',
            timezone: 'Timezone',
            timezoneDesc: 'Set timezone for time display',
            dateFormat: 'Date Format',
            dateFormatDesc: 'Choose date display format',
        },

        // Teaching Settings
        teaching: {
            title: 'Teaching Methods',
            autoApprove: 'Auto-approve Attendance',
            autoApproveDesc: 'Automatically approve student attendance',
            strictGrading: 'Strict Grading Mode',
            strictGradingDesc: 'Use stricter grading system',
        },

        // Class Management
        classManagement: {
            title: 'Class Preferences',
            lateLimit: 'Late Limit (minutes)',
            lateLimitDesc: 'Maximum allowed lateness time',
            minAttendance: 'Minimum Attendance (%)',
            minAttendanceDesc: 'Required minimum attendance percentage',
        },

        // Notifications
        notifications: {
            title: 'Email Notifications',
            newAttendance: 'New Attendance',
            newAttendanceDesc: 'Notify when students check attendance',
            permitRequest: 'Permit Requests',
            permitRequestDesc: 'Notify when there are permit/sick leave requests',
        },

        // Appearance
        appearance: {
            title: 'Theme',
            themeDesc: 'Choose application display theme',
            light: 'Light',
            dark: 'Dark',
            auto: 'Auto',
        },

        // Privacy
        privacy: {
            title: 'Data Privacy',
            publicProfile: 'Public Profile',
            publicProfileDesc: 'Display your profile to students',
            analytics: 'Anonymous Analytics',
            analyticsDesc: 'Allow anonymous data collection for service improvement',
        },

        // Security
        security: {
            title: 'Account Security',
            changePassword: 'Change Password',
            changePasswordDesc: 'Update your account password',
            twoFactor: 'Two-Factor Authentication',
            twoFactorDesc: 'Enable two-factor authentication for additional security',
        },

        // Data Management
        dataManagement: {
            title: 'Data Management',
            exportData: 'Export Data',
            exportDataDesc: 'Download all your data in JSON format',
            deleteAccount: 'Delete Account',
            deleteAccountDesc: 'Permanently delete account and all data',
            exportSuccess: 'Data successfully exported',
            exportError: 'Failed to export data',
        },
    },
};
