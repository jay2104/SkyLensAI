/**
 * Registration Page
 * User account creation page
 */

import RegistrationForm from '@/components/auth/registration-form';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <RegistrationForm />
    </div>
  );
}