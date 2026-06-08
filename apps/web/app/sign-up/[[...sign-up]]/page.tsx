import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#09090d] flex items-center justify-center px-4">
      <SignUp />
    </div>
  );
}
