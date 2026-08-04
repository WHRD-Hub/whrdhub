import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Image panel — desktop only, mirrors the SAAS auth layout */}
      <div className="relative hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/woman-feature-phone.png"
          alt="A woman using a basic feature phone to reach support"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/35 to-primary/10" />
        <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
          <h2 className="text-3xl font-black leading-tight">Report safely, from any phone.</h2>
          <p className="mt-2 max-w-md text-white/85">
            A secure, confidential space for women human rights defenders. Protect. Heal. Nurture.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
