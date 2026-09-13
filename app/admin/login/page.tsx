import LoginForm from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gold-500/20 bg-ghat-800/80 p-8 backdrop-blur-md">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl tracking-wide text-cream">
            CHHATH GEET
          </h1>
          <p className="mt-1 text-sm uppercase tracking-widest text-gold-400">
            Admin Panel
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
