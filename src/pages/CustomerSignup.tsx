import { SignUp } from "@clerk/clerk-react";

export default function CustomerSignup() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfaf6] py-12 px-4 sm:px-6 lg:px-8">
      <SignUp path="/customer-signup" routing="path" signInUrl="/customer-login" />
    </div>
  );
}
