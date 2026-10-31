import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm({
        email: '',
        password: '',
    });

    function handleSubmit(e) {
        e.preventDefault();

        post('/login', {
            onFinish: () => reset('password'),
        });
    }

    return (
        <>
            <Head title="Sign in" />

            <div className="min-h-screen bg-[#fafbf9] font-sans text-[#202923] lg:grid lg:grid-cols-[42%_58%]">

                {/* =====================================
                    LEFT PANEL — BRANDING
                ===================================== */}

                <aside className="relative flex min-h-[116px] flex-col overflow-hidden bg-[#173b2b] px-7 py-7 text-white sm:px-12 lg:min-h-screen lg:px-14 lg:py-12">

                    {/* Subtle vertical structure */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 right-[15%] hidden w-px bg-white/[0.07] lg:block"
                    />

                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 right-[35%] hidden w-px bg-white/[0.05] lg:block"
                    />

                    {/* Branding */}
                    <div className="relative z-10 flex items-center gap-4">

                        <div className="flex h-11 w-11 items-center justify-center border border-white/40 text-[15px] font-semibold tracking-[-0.04em]">
                            SC
                        </div>

                        <div>
                            <div className="text-[15px] font-semibold tracking-[-0.025em]">
                                SC Canteen
                            </div>

                            <div className="mt-0.5 text-[12px] text-white/55">
                                Management System
                            </div>
                        </div>

                    </div>

                    {/* Main branding text */}
                    <div className="relative z-10 mt-auto hidden pb-16 lg:block">

                        <div className="mb-10 h-[2px] w-10 bg-[#b5cdb7]" />

                        <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-[#b6d0bd]">
                            Operations platform
                        </p>

                        <h2 className="mt-6 max-w-[400px] text-[clamp(38px,4vw,58px)] font-medium leading-[1.08] tracking-[-0.055em]">
                            Canteen
                            <br />
                            management.
                        </h2>

                        <p className="mt-7 max-w-[280px] text-[14px] leading-7 text-white/60">
                            Point of sale, inventory control, and daily
                            sales records.
                        </p>

                    </div>

                    {/* Footer */}
                    <div className="relative z-10 hidden items-center justify-between border-t border-white/15 pt-6 text-[11px] text-white/45 lg:flex">

                        <span>SC Canteen System</span>

                        <span>
                            © {new Date().getFullYear()}
                        </span>

                    </div>

                </aside>


                {/* =====================================
                    RIGHT PANEL — LOGIN
                ===================================== */}

                <main className="relative isolate flex min-h-[calc(100vh-116px)] items-center justify-center overflow-hidden border-l border-[#e4e9e2] bg-[#fafbf9] px-7 py-14 sm:px-12 lg:min-h-screen lg:px-20">

                    {/* Subtle architectural grid */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
                        style={{
                            backgroundImage: `
                                linear-gradient(
                                    to right,
                                    #e8ede7 1px,
                                    transparent 1px
                                ),
                                linear-gradient(
                                    to bottom,
                                    #e8ede7 1px,
                                    transparent 1px
                                )
                            `,
                            backgroundSize: '64px 64px',
                        }}
                    />

                    {/* Top-right geometric detail */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute right-12 top-12 hidden h-20 w-20 border-r border-t border-[#dce7dc] lg:block"
                    />

                    {/* Bottom-right architectural detail */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-0 right-0 hidden h-48 w-48 border-l border-t border-[#dce7dc] lg:block"
                    />

                    {/* Small decorative label */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-12 right-12 hidden text-[10px] font-medium uppercase tracking-[0.18em] text-[#a9b8ab] xl:block"
                    >
                        SC / MANAGEMENT
                    </div>


                    {/* =====================================
                        LOGIN CONTENT
                    ===================================== */}

                    <div className="relative z-10 w-full max-w-[380px]">

                        {/* Heading */}
                        <div className="mb-11">

                            <div className="mb-6 flex items-center gap-2">

                                <span className="h-1.5 w-1.5 rounded-full bg-[#2c694a]" />

                                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#55725f]">
                                    Staff portal
                                </span>

                            </div>

                            <h1 className="text-[38px] font-semibold leading-tight tracking-[-0.055em] text-[#1c2a20]">
                                Welcome back.
                            </h1>

                            <p className="mt-3 text-[14px] leading-6 text-[#79847b]">
                                Sign in with your staff account to continue.
                            </p>

                        </div>


                        {/* =====================================
                            LOGIN FORM
                        ===================================== */}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >

                            {/* Email */}
                            <div>

                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-[13px] font-medium text-[#35463a]"
                                >
                                    Email address
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    autoComplete="username"
                                    placeholder="Enter your email"
                                    required
                                    autoFocus
                                    aria-invalid={Boolean(errors.email)}
                                    aria-describedby={
                                        errors.email
                                            ? 'email-error'
                                            : undefined
                                    }
                                    className={`h-[49px] w-full rounded-[6px] border bg-white px-4 text-[14px] text-[#1f2d23] outline-none transition-colors placeholder:text-[#a3ada5] focus:ring-2 focus:ring-[#dce9df] ${
                                        errors.email
                                            ? 'border-red-500'
                                            : 'border-[#d8dfd8] focus:border-[#306449]'
                                    }`}
                                />

                                {errors.email && (
                                    <p
                                        id="email-error"
                                        role="alert"
                                        className="mt-2 text-[12px] text-red-700"
                                    >
                                        {errors.email}
                                    </p>
                                )}

                            </div>


                            {/* Password */}
                            <div>

                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-[13px] font-medium text-[#35463a]"
                                >
                                    Password
                                </label>

                                <div className="relative">

                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        required
                                        aria-invalid={Boolean(errors.password)}
                                        aria-describedby={
                                            errors.password
                                                ? 'password-error'
                                                : undefined
                                        }
                                        className={`h-[49px] w-full rounded-[6px] border bg-white px-4 pr-16 text-[14px] text-[#1f2d23] outline-none transition-colors placeholder:text-[#a3ada5] focus:ring-2 focus:ring-[#dce9df] ${
                                            errors.password
                                                ? 'border-red-500'
                                                : 'border-[#d8dfd8] focus:border-[#306449]'
                                        }`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        aria-label={
                                            showPassword
                                                ? 'Hide password'
                                                : 'Show password'
                                        }
                                        aria-pressed={showPassword}
                                        className="absolute inset-y-0 right-4 text-[12px] font-medium text-[#52715b] transition-colors hover:text-[#173b2b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#306449]"
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>

                                </div>

                                {errors.password && (
                                    <p
                                        id="password-error"
                                        role="alert"
                                        className="mt-2 text-[12px] text-red-700"
                                    >
                                        {errors.password}
                                    </p>
                                )}

                            </div>


                            {/* Submit button */}
                            <div className="pt-2">

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex h-[49px] w-full items-center justify-center rounded-[6px] bg-[#173b2b] text-[14px] font-semibold text-white transition-colors hover:bg-[#24563e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24563e] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {processing
                                        ? 'Signing in…'
                                        : 'Sign in'}
                                </button>

                            </div>

                        </form>


                        {/* Footer information */}
                        <div className="mt-12 border-t border-[#e1e6df] pt-6">

                            <p className="text-[12px] leading-6 text-[#8a958c]">
                                Access is restricted to authorized personnel.
                                <br />
                                For account assistance, contact your system administrator.
                            </p>

                        </div>

                    </div>

                </main>

            </div>
        </>
    );
}