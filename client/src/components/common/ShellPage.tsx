import React from 'react';

interface ShellPageProps {
  title: string;
  subtitle?: string;
  role?: string;
}

const ShellPage: React.FC<ShellPageProps> = ({ title, subtitle, role }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#10b981]/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-24 h-24 bg-[#10b981]/10 border border-[#10b981]/30 rounded-full flex items-center justify-center text-[#10b981] mb-8 animate-bounce shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <span className="text-4xl">⏳</span>
        </div>

        <h1 className="text-5xl font-newsreader font-bold text-[#EBEBEB] mb-4 tracking-tight">
          {title}
        </h1>

        {subtitle && (
          <p className="text-[#EBEBEB]/60 font-inter mb-12 max-w-md text-lg leading-relaxed">
            {subtitle}
          </p>
        )}

        <div className="px-6 py-2 bg-[#10b981]/10 border border-[#10b981]/40 rounded-full text-[#10b981] font-space-grotesk text-xs uppercase tracking-[0.3em] shadow-[0_0_10px_rgba(16,185,129,0.1)]">
          {role ? `Restricted to ${role} access` : 'Coming Soon in Sprint 2'}
        </div>
      </div>
    </div>
  );
};

export default ShellPage;
