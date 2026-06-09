import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#09090d] flex items-center justify-center px-4">
      <SignIn appearance={clerkDark} />
    </div>
  );
}

const clerkDark = {
  variables: {
    colorBackground: "#0e0e16",
    colorPrimary: "#a78bfa",
    colorText: "#edf2ff",
    colorTextSecondary: "#9aa5c4",
    colorInputBackground: "#13131f",
    colorInputText: "#edf2ff",
    colorNeutral: "#edf2ff",
    borderRadius: "10px",
  },
};
