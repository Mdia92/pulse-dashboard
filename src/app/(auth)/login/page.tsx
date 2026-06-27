export default function LoginPage() {
  return (
    <div className="flex min-h-full items-center justify-center bg-zinc-950 p-8">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-zinc-800 bg-zinc-900 p-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">Pulse</p>
          <h1 className="text-xl font-semibold text-zinc-100">Merchant login</h1>
          <p className="mt-2 text-sm text-zinc-400">
            WhatsApp OTP — enter your phone number to receive a code.
          </p>
        </div>
        <form className="space-y-4">
          <label className="block text-sm text-zinc-400">
            Phone (WhatsApp)
            <input
              type="tel"
              placeholder="+221 77 000 00 00"
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 placeholder:text-zinc-600"
              disabled
            />
          </label>
          <button
            type="button"
            className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white opacity-50"
            disabled
          >
            Send OTP (coming soon)
          </button>
        </form>
      </div>
    </div>
  );
}
