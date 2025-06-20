"use client";
import React, { useState, useEffect } from "react";
import { useLoginMutation } from "@/store/api";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials, setUserData } from "@/reducers/auth/LoginSlice";
import { useRouter } from "next/navigation";
import { LoginData } from "@/types/auth/page";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
 
  const dispatch = useAppDispatch();

  const [login, { isLoading, error, data }] = useLoginMutation();

  const router = useRouter();

  useEffect(() => {
    
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      console.log("11111111111111111111111111",user)
      if (token && user) {
        const parsedUser = JSON.parse(user);
        console.log("11111111111111111111111111",parsedUser)
        if (parsedUser.role) {
          router.replace(`/${parsedUser.role.toLowerCase()}/dashboard`);
        }
      }
    
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default browser form submission
    setErrorMessage(null); // Clear previous errors

    // Simple validation before attempting mutation
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    try {
      const result = await login({ email, password } as LoginData).unwrap();

      console.log("Login successful:", result);

      localStorage.setItem(
        "user",
        result.user ? JSON.stringify(result.user) : ""
      );
      localStorage.setItem("role", result.user?.role || "");
      localStorage.setItem("token", result.token);

      dispatch(setCredentials(result));
      dispatch(setUserData(result.user));

      if (result.user?.organizationId) {
        router.push(
          `/${result?.user?.role}/dashboard?org=${result.user.organizationId}`
        );
      } else {
        router.push(`/${result?.user?.role}/dashboard`); 
      }
    } catch (err) {
      console.error("Login failed:", err);
      // Display a user-friendly error message
      if (
        err &&
        typeof err === "object" &&
        "data" in err &&
        typeof err.data === "object" &&
        err.data !== null &&
        "error" in err.data
      ) {
        setErrorMessage(
          (err.data.error as string) || "Login failed. Please try again."
        );
      } else {
        setErrorMessage("Login failed. Please try again.");
      }
    }
  };

  

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#E0F2F7]">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="rounded-full p-3 mb-4">
            {/* Assuming cat.jpg is your logo or placeholder */}
            <img
              src="/images/cat.jpg"
              className="h-16 w-16 rounded-full"
              alt="Logo"
            />
          </div>
          <h2 className="text-2xl font-bold text-[#034F75] mb-2">
            Welcome Back!
          </h2>
          <p className="text-gray-500 text-sm">Please login to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email or Username
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-3 px-4 leading-tight focus:outline-none focus:shadow-outline border-gray-300 bg-[#C7DFEA] text-[#034F75]"
              id="email"
              type="text"
              placeholder="Enter your email or username"
              value={email} // Bind value to state
              onChange={(e) => setEmail(e.target.value)} // Update state on change
              required // Make field required
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-3 px-4 leading-tight focus:outline-none focus:shadow-outline border-gray-300 bg-[#C7DFEA] text-[#034F75]"
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password} // Bind value to state
              onChange={(e) => setPassword(e.target.value)} // Update state on change
              required // Make field required
            />
          </div>

          {errorMessage && (
            <div className="text-red-600 text-sm mb-4 text-center">
              {errorMessage}
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            {/* Optional: Remember Me */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-[#034F75] border-gray-300 rounded focus:ring-[#034F75]"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>

            <a
              className="inline-block align-baseline font-bold text-sm text-[#034F75] hover:text-blue-800"
              href="#"
            >
              Forgot Password?
            </a>
          </div>
          <div className="flex items-center justify-center">
            {/* Login Button */}
            <button
              className={`bg-[#034F75] hover:bg-[#023e5b] text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline transition duration-200 ease-in-out ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}{" "}
              {/* Change button text while loading */}
            </button>
          </div>
          {/* Optional: Link to Sign Up */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <a
                className="font-bold text-[#034F75] hover:text-blue-800"
                href="#"
              >
                Sign Up
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
