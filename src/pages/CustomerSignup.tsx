import { SignUp } from "@clerk/clerk-react";

export default function CustomerSignup() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#fdfaf6', padding: '2rem 1rem' }}>
      <SignUp path="/customer-signup" routing="path" signInUrl="/customer-login" />
    </div>
  );
}
