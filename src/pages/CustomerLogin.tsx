import { SignIn } from "@clerk/clerk-react";

export default function CustomerLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfaf6] py-12 px-4 sm:px-6 lg:px-8">
      <SignIn path="/customer-login" routing="path" signUpUrl="/customer-signup" />
    </div>
  );
}
