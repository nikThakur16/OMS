import React from "react";

type SuccessToastProps = {
  message: string;
};

export const SuccessToast: React.FC<SuccessToastProps> = ({ message }) => (
  <div className="flex items-center gap-3 p-4 bg-emerald-700 border-l-4 border-emerald-400 rounded-xl shadow-lg w-[300px]">
    <span className="flex items-center justify-center h-10 w-10 rounded-full bg-emerald-600">
      <svg
        className="h-6 w-6 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 13l4 4L19 7"
        />
      </svg>
    </span>
    <div className="text-gray-100">
      <div className="font-semibold">Success</div>
      <div className="text-sm">{message}</div>
    </div>
  </div>
);

type FailedToastProps = {
  message: string;
};

export const FailedToast: React.FC<FailedToastProps> = ({ message }) => (
  <div className="flex items-center gap-3 p-4 bg-red-700 border-l-4 border-red-400 rounded-xl shadow-lg w-[300px]">
    <span className="flex items-center justify-center h-10 w-10 rounded-full bg-red-600">
      <svg
        className="h-6 w-6 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </span>
    <div className="text-gray-100">
      <div className="font-semibold">Failed</div>
      <div className="text-sm">{message}</div>
    </div>
  </div>
);

export default SuccessToast;
