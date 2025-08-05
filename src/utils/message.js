import React from 'react';

export const infoMessages = [
    {
      text: "⚠️ Veuillez ne pas fermer ou actualiser la page pendant le traitement.",
      theme: "warning",
      bgColor: "from-orange-50 to-amber-50",
      borderColor: "border-orange-400",
      textColor: "text-orange-700",
      iconColor: "text-orange-500",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    },
    {
      text: "🚀 Redirection automatique après traitement.",
      theme: "info",
      bgColor: "from-blue-50 to-indigo-50",
      borderColor: "border-blue-400",
      textColor: "text-blue-700",
      iconColor: "text-blue-500",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      )
    },
    {
      text: "Le traitement est en cours, veuillez patienter ⚡",
      theme: "success",
      bgColor: "from-green-50 to-emerald-50",
      borderColor: "border-green-400",
      textColor: "text-green-700",
      iconColor: "text-green-500",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      text: "Notre système génère des factures 🚀",
      theme: "success",
      bgColor: "from-green-50 to-teal-50",
      borderColor: "border-green-400",
      textColor: "text-green-700",
      iconColor: "text-green-500",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      text: "💨 Optimiser les calculs pour une efficacité maximale.",
      theme: "info",
      bgColor: "from-cyan-50 to-sky-50",
      borderColor: "border-cyan-400",
      textColor: "text-cyan-700",
      iconColor: "text-cyan-500",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      text: "🧠 Des algorithmes intelligents fonctionnant en coulisses!",
      theme: "purple",
      bgColor: "from-purple-50 to-violet-50",
      borderColor: "border-purple-400",
      textColor: "text-purple-700",
      iconColor: "text-purple-500",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    },
    {
      text: "Opération en cours 🎯",
      theme: "success",
      bgColor: "from-emerald-50 to-green-50",
      borderColor: "border-emerald-400",
      textColor: "text-emerald-700",
      iconColor: "text-emerald-500",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      text: "Quality check in progress - ensuring perfection! ✨",
      theme: "info",
      bgColor: "from-indigo-50 to-blue-50",
      borderColor: "border-indigo-400",
      textColor: "text-indigo-700",
      iconColor: "text-indigo-500",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    }
  ];

  export default infoMessages;