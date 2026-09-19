'use client';

export default function WelcomeContext() {
  return (
    <div className="py-6 px-4 md:px-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#111318] mb-1">
        Good morning, Suresh.
      </h1>
      <h2 className="text-[28px] md:text-[36px] font-semibold tracking-tight text-[#111318] mb-2 leading-tight">
        What would you like to do with your inventory right now?
      </h2>
      <p className="text-[14px] text-[#5F6673]">
        Speak naturally, review the action, and confirm.
      </p>
    </div>
  );
}
