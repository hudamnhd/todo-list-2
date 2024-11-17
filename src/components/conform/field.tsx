import React from "React";

export const Field = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      style={{ animationDelay: `0.07s` }}
      className="animate-slide-top [animation-fill-mode:backwards] flex flex-col gap-2"
    >
      {children}
    </div>
  );
};

export const FieldError = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      style={{ animationDelay: `0.1s` }}
      className="animate-slide-left [animation-fill-mode:backwards] text-sm text-red-600"
    >
      {children}
    </div>
  );
};
