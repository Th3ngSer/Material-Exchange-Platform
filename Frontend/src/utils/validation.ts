/**
 * Validation Utilities
 * Reusable validation functions for form inputs
 */

/**
 * Validate email format
 * @param email - Email to validate
 * @returns Error message or empty string if valid
 */
export function validateEmail(email: string): string {
    if (!email) {
        return 'Email is required'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        return 'Please enter a valid email address'
    }

    return ''
}

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * @param password - Password to validate
 * @returns Error message or empty string if valid
 */
export function validatePassword(password: string): string {
    if (!password) {
        return 'Password is required'
    }

    if (password.length < 8) {
        return 'Password must be at least 8 characters'
    }

    if (!/[A-Z]/.test(password)) {
        return 'Password must contain at least one uppercase letter'
    }

    if (!/[a-z]/.test(password)) {
        return 'Password must contain at least one lowercase letter'
    }

    if (!/[0-9]/.test(password)) {
        return 'Password must contain at least one number'
    }

    return ''
}

/**
 * Check password strength level
 * @param password - Password to check
 * @returns Strength level: 'weak', 'medium', or 'strong'
 */
export function checkPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
    if (!password) return 'weak'

    let strength = 0

    // Length
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++

    // Complexity
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[!@#$%^&*]/.test(password)) strength++

    if (strength <= 2) return 'weak'
    if (strength <= 4) return 'medium'
    return 'strong'
}

/**
 * Validate confirm password matches password
 * @param password - Original password
 * @param confirmPassword - Confirm password
 * @returns Error message or empty string if valid
 */
export function validatePasswordMatch(password: string, confirmPassword: string): string {
    if (!confirmPassword) {
        return 'Please confirm your password'
    }

    if (password !== confirmPassword) {
        return 'Passwords do not match'
    }

    return ''
}
