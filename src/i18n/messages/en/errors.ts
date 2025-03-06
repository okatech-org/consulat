export default {
  common: {
    error_title: 'Error',
    success_title: 'Success',
    unknown_error: 'An unexpected error occurred',
    try_again: 'Please try again later',
  },
  auth: {
    update_profile: 'Error updating profile',
    user_not_found: 'User not found',
    unauthorized: 'You must be logged in to perform this action',
    forbidden: "You don't have the necessary permissions to perform this action",
    session_expired: 'Your session has expired, please log in again',
    invalid_credentials: 'Invalid credentials',
  },
  form: {
    submission_failed: 'Form submission failed',
    invalid_data: 'Invalid data',
    required_field: 'This field is required',
    try_again: 'Please try again',
  },
} as const;
