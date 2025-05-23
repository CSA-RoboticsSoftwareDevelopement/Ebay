
// src/components/ui/button.tsx
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button = ({ children, ...props }: ButtonProps) => {
  return (
    <button
      {...props}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded"
    >
      {children}
    </button>
  );
};
