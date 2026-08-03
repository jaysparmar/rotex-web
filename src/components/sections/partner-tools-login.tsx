"use client";
import { useState } from "react";

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M1.84 10S5 4.17 10 4.17 18.16 10 18.16 10 15 15.83 10 15.83 1.84 10 1.84 10Z"
        stroke="#78716c"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.5" stroke="#78716c" strokeWidth="1.5" />
      {!open && (
        <path d="M3 17 17 3" stroke="#78716c" strokeWidth="1.5" strokeLinecap="round" />
      )}
    </svg>
  );
}

/* Figma: 185×175 white ring-with-hex mark, centred on the orange panel */
function HexMark() {
  return (
    <svg
      width="185"
      height="175"
      viewBox="0 0 185 175"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6.95735 122.388C11.6755 132.946 18.1583 142.205 26.4141 150.108C34.7242 157.954 44.4508 164.088 55.6552 168.454C66.8562 172.818 79.1183 175 92.5018 175C105.885 175 117.969 172.818 129.23 168.454C140.489 164.088 150.334 157.954 158.708 150.108C167.079 142.205 173.564 132.946 178.161 122.27C182.758 111.652 185 100.033 185 87.4687C185 74.9042 182.757 63.288 178.161 52.6697C173.563 42.0538 167.136 32.7949 158.826 24.8893C150.512 16.9861 140.725 10.8521 129.348 6.54622C117.968 2.1801 105.647 0 92.2645 0C78.8822 0 66.855 2.1801 55.654 6.54622C44.4508 10.8521 34.7242 16.9259 26.4129 24.7712C18.1571 32.5587 11.6743 41.8176 6.95617 52.5516C2.29944 63.288 0 74.9065 0 87.4687C0 100.031 2.29944 111.83 6.95735 122.388ZM38.1438 83.0447L61.5502 42.5262C62.9065 40.2256 65.3216 38.8084 67.9173 38.8084L114.727 38.8084C117.438 38.8084 119.795 40.2256 121.091 42.5262L144.498 83.0447C145.796 85.3453 145.796 88.1773 144.498 90.4176L121.091 131C119.796 133.24 117.438 134.655 114.727 134.655H67.9173C65.3204 134.655 62.9053 133.241 61.5502 131L38.1438 90.4176C36.8454 88.1773 36.8454 85.3465 38.1438 83.0447Z"
        fill="white"
      />
    </svg>
  );
}

export function PartnerToolsLogin({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    setPending(true);

    try {
      const res = await fetch("/api/v1/partner-tools/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();

      if (json.success) {
        onUnlock();
        return;
      }
      setError(json.error?.message ?? "Incorrect password. Please try again.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="flex flex-col lg:flex-row lg:min-h-210">
      {/* Left panel — orange radial with the hex mark. Desktop only, per Figma. */}
      <div className="hidden lg:flex lg:w-150.25 shrink-0 items-center justify-center overflow-hidden bg-gradient-yellow">
        <HexMark />
      </div>

      {/* Right panel — copy + password gate */}
      <div className="flex-1 flex items-center">
        <div className="w-full px-5 py-14 lg:px-33 lg:py-0">
          <div className="flex flex-col gap-7 lg:gap-16 lg:max-w-143">
            <div className="flex flex-col gap-3">
              <h1 className="text-stone-900 font-montserrat font-normal text-3xl lg:text-5xl leading-10 lg:leading-15">
                Sales Partner Portal
              </h1>
              <p className="text-stone-900 lg:text-zinc-800 font-montserrat font-medium text-sm lg:text-base leading-5 lg:leading-6">
                Access configuration tools, datasheet generation, product codes, service
                requests, and much more.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 lg:gap-7 lg:w-96">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="partner-password"
                  className="text-stone-500 font-montserrat font-medium text-sm leading-5"
                >
                  Enter Password
                </label>
                <div className="relative">
                  <input
                    id="partner-password"
                    type={visible ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    autoComplete="current-password"
                    className="w-full h-11 pl-3 pr-11 bg-gray-50 rounded-lg outline outline-1 -outline-offset-1 outline-gray-200 text-sm font-medium font-montserrat leading-5 text-stone-900 placeholder:text-stone-400 focus:outline-stone-400"
                  />
                  <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center"
                  >
                    <EyeIcon open={visible} />
                  </button>
                </div>
                {error && (
                  <p className="text-red-500 text-xs font-montserrat mt-0.5">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={pending}
                className="w-full lg:w-60 h-12 px-6 rounded-[100px] bg-stone-900 text-white font-montserrat font-semibold text-sm uppercase leading-5 hover:bg-primary transition-colors duration-150 disabled:opacity-60"
              >
                {pending ? "Checking…" : "Access Portal"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
