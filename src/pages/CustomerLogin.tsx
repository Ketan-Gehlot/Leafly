import { SignIn } from "@clerk/clerk-react";

export default function CustomerLogin() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#fdfaf6', padding: '2rem 1rem' }}>
      <SignIn path="/customer-login" routing="path" signUpUrl="/customer-signup" />
    </div>
  );
}
