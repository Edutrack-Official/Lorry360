// ForgotPassword.tsx - Updated with Frontend OTP Generation and Separate Loading States

import React, { useState, useRef } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { BookOpen, Loader2, ArrowLeft } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import FloatingInput from "../components/FloatingInput";
import api from "../api/client";

const ForgotPassword: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
    email: "", 
    otp: ["", "", "", ""],
    password: "", 
    confirmPassword: "" 
  });
  const [errors, setErrors] = useState<{ 
    email?: string; 
    otp?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(""); // Store generated OTP
  const [resendTimer, setResendTimer] = useState(0); // Cooldown timer for resend
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown effect for resend timer
  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  if (loading) return <LoadingSpinner />;
  if (user) return <Navigate to="/dashboard" replace />;

  // Generate 4-digit OTP
  const generateOtp = () => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    return otp;
  };

  // OTP input handling
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...formData.otp];
    newOtp[index] = value;
    setFormData({ ...formData, otp: newOtp });

    if (value && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !formData.otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    const otpArray = pastedData.split('');
    const newOtp = [...formData.otp];
    
    otpArray.forEach((char, index) => {
      if (index < 4) newOtp[index] = char;
    });
    
    setFormData({ ...formData, otp: newOtp });
  };

  // Validation functions
  const validateEmail = () => {
    const e: typeof errors = {};
    if (!formData.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Enter a valid email.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateOtp = () => {
    const e: typeof errors = {};
    if (formData.otp.some(digit => !digit)) {
      e.otp = "Please enter all 4 digits of OTP.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePassword = () => {
    const e: typeof errors = {};
    if (!formData.password) e.password = "Password is required.";
    else if (formData.password.length < 6) e.password = "Password must be at least 6 characters.";
    
    if (!formData.confirmPassword) e.confirmPassword = "Please confirm your password.";
    else if (formData.password !== formData.confirmPassword) e.confirmPassword = "Passwords do not match.";
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Step 1: Send OTP to email
  const handleSendOtp = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateEmail()) return;

    setIsSendingOtp(true);
    setMessage("");
    
    try {
      // Generate OTP in frontend
      const otp = generateOtp();
      setGeneratedOtp(otp);

      // Send email and OTP to backend
      const { data } = await api.post(`/users/forgot-password`, {
        email: formData.email,
        otp: otp
      });

      setStep(2);
      setMessage("OTP sent to your email!");
      setResendTimer(30); // Set 30 second cooldown
      
      // Clear OTP inputs
      setFormData({ ...formData, otp: ["", "", "", ""] });
      
      // Focus first OTP input
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (error: any) {
      setMessage(error.response?.data?.error || error.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateOtp()) return;

    setIsVerifying(true);
    try {
      const enteredOtp = formData.otp.join('');
      
      // Verify OTP matches generated OTP
      if (enteredOtp !== generatedOtp) {
        throw new Error("Invalid OTP. Please try again.");
      }

      setStep(3);
      setMessage("OTP verified! Set your new password.");
    } catch (error: any) {
      setMessage(error.message || "Invalid OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validatePassword()) return;

    setIsResetting(true);
    try {
      // Call reset password API
      const { data } = await api.post(`/users/reset-password`, {
        email: formData.email,
        password: formData.password
      });

      setMessage("Password reset successful! Redirecting to login...");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      setMessage(error.response?.data?.error || error.message || "Failed to reset password. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
    if (message) setMessage("");
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    setMessage("");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 flex flex-col">
        <div className="h-1/2 bg-blue-600" />
        <div className="h-1/2 bg-white" />
      </div>

      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-10 left-10 h-40 w-40 rounded-full bg-white/25 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-52 w-52 rounded-full bg-blue-300/40 blur-3xl" />
      </div>

      {/* Centered Card */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-5xl rounded-3xl bg-white/90 backdrop-blur-xl shadow-[0_25px_80px_-15px_rgba(0,0,0,0.25)] overflow-hidden ring-1 ring-indigo-100">
          <div className="flex flex-col md:flex-row">
            {/* Left: form */}
            <div className="w-full md:w-1/2 p-8 sm:p-10">
              {/* Back button */}
              <div className="mb-6 flex items-center justify-between">
                {(step === 2 || step === 3) ? (
                  <button
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                  </Link>
                )}
                <div className="text-sm text-gray-500">
                  Step {step} of 3
                </div>
              </div>

              <div className="mb-6 flex items-center gap-2">
                <BookOpen className="h-8 w-8 text-indigo-600" />
                <span className="text-xl font-bold text-gray-900">PAT360</span>
              </div>

              {/* Step 1: Email Input */}
              {step === 1 && (
                <>
                  <h2 className="mb-1 text-3xl font-bold text-gray-900">Reset your password</h2>
                  <p className="mb-6 text-sm text-gray-600">
                    Enter your email address to receive OTP for password reset.
                  </p>

                  <form onSubmit={handleSendOtp} noValidate>
                    <div className="mb-6">
                      <FloatingInput
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        label="Email"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-rose-600">{errors.email}</p>
                      )}
                    </div>

                     {message && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${
                      message.includes("sent") 
                        ? "bg-green-50 text-green-700 border border-green-200" 
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}>
                      {message}
                    </div>
                  )}

                    <button
                      type="submit"
                      disabled={isSendingOtp}
                      className={`group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-white shadow-md transition
                        ${isSendingOtp ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"}
                      `}
                    >
                      {isSendingOtp && <Loader2 className="h-4 w-4 animate-spin" />}
                      Send OTP
                    </button>
                  </form>
                </>
              )}

              {/* Step 2: OTP Verification */}
              {step === 2 && (
                <>
                  <h2 className="mb-1 text-3xl font-bold text-gray-900">Verify OTP</h2>
                  <p className="mb-6 text-sm text-gray-600">
                    Enter the 4-digit OTP sent to {formData.email}
                  </p>

                  {message && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${
                      message.includes("verified") || message.includes("sent")
                        ? "bg-green-50 text-green-700 border border-green-200" 
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}>
                      {message}
                    </div>
                  )}

                  <form onSubmit={handleVerifyOtp} noValidate>
                    <div className="mb-6">
                      <div className="flex justify-center gap-3">
                        {formData.otp.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => otpRefs.current[index] = el}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            onPaste={handleOtpPaste}
                            className="w-16 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                          />
                        ))}
                      </div>
                      {errors.otp && (
                        <p className="mt-3 text-center text-sm text-rose-600">{errors.otp}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isVerifying}
                      className={`group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-white shadow-md transition
                        ${isVerifying ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"}
                      `}
                    >
                      {isVerifying && <Loader2 className="h-4 w-4 animate-spin" />}
                      Verify OTP
                    </button>
                  </form>

                  <div className="mt-4 text-center text-sm text-gray-600">
                    <p>Didn't receive OTP?{" "}
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={resendTimer > 0 || isSendingOtp}
                        className={`font-medium ${
                          resendTimer > 0 || isSendingOtp
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-indigo-600 hover:underline"
                        }`}
                      >
                        {resendTimer > 0 ? `Resend OTP (${resendTimer}s)` : "Resend OTP"}
                      </button>
                    </p>
                  </div>
                </>
              )}

              {/* Step 3: New Password */}
              {step === 3 && (
                <>
                  <h2 className="mb-1 text-3xl font-bold text-gray-900">Set New Password</h2>
                  <p className="mb-6 text-sm text-gray-600">
                    Enter your new password and confirm it.
                  </p>

                  {message && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${
                      message.includes("success") || message.includes("verified")
                        ? "bg-green-50 text-green-700 border border-green-200" 
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}>
                      {message}
                    </div>
                  )}

                  <form onSubmit={handleResetPassword} noValidate>
                    <div className="mb-4">
                      <FloatingInput
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        label="New Password"
                      />
                      {errors.password && (
                        <p className="mt-1 text-sm text-rose-600">{errors.password}</p>
                      )}
                    </div>

                    <div className="mb-6">
                      <FloatingInput
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        label="Confirm New Password"
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-rose-600">{errors.confirmPassword}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isResetting}
                      className={`group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-white shadow-md transition
                        ${isResetting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"}
                      `}
                    >
                      {isResetting && <Loader2 className="h-4 w-4 animate-spin" />}
                      Reset Password
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Right visual */}
            <div className="hidden md:flex w-full md:w-1/2 items-center justify-center p-10 bg-white">
              <div className="w-full text-center">
                <img
                  src="/images/forgot-password_img.png"
                  alt="Password reset illustration"
                  className="mx-auto mb-6 w-[90%] max-w-md drop-shadow-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/login_img.png";
                  }}
                />
                <h3 className="mb-2 text-2xl font-semibold text-gray-900">
                  {step === 1 ? "Reset Password" : step === 2 ? "Verify OTP" : "New Password"}
                </h3>
                <p className="mx-auto max-w-md text-sm text-gray-600">
                  {step === 1 
                    ? "We'll send you an OTP to verify your identity."
                    : step === 2
                    ? "Check your email for the verification code."
                    : "Create a strong new password for your account."
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Blue Footer */}
          <div className="w-full bg-blue-600 py-3 px-6 text-center" />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;