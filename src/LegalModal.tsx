import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, FileText } from "lucide-react";
import { useAppContext } from "./AppContext";

export const LegalModal = () => {
  const { legalModal, setLegalModal } = useAppContext();
  if (!legalModal) return null;

  const content = {
    privacy: {
      title: "Privacy Notice & Policy",
      date: "Effective from: August 2026",
      subtitle: "Compliant with the Digital Personal Data Protection (DPDP) Act, 2023",
      icon: <ShieldCheck className="w-6 h-6 text-[var(--color-accent-mint)]" />,
      sections: [
        {
          heading: "1. Information We Collect & Purpose",
          text: "Under the DPDP Act 2023, we collect digital personal data strictly for specified, lawful purposes. We collect your Name and Email Address exclusively to: (a) Deliver digital templates to your inbox, (b) Authenticate your account, and (c) Provide customer support. If you opted into marketing, your email is used for promotional updates.",
        },
        {
          heading: "2. Your Rights as a Data Principal",
          text: "You possess the following rights under the DPDP Act 2023:\n• Right to Access: Request a summary of your personal data being processed.\n• Right to Correction & Erasure: Request updates to inaccurate data or deletion of your data.\n• Right of Grievance Redressal: File a complaint regarding your data.\n• Right to Nominate: Appoint an individual to exercise your rights in the event of death or incapacity.",
        },
        {
          heading: "3. Withdrawal of Consent",
          text: "Consent is the primary basis for our data processing. You may withdraw your consent at any time. To withdraw marketing consent, use the Unsubscribe link in the footer. To withdraw consent for account data, email our Grievance Officer, and we will cease processing and erase your data within 15 days, unless retention is legally required.",
        },
        {
          heading: "4. Data Retention & Security",
          text: "We implement reasonable security safeguards (including Row Level Security and SSL encryption) to protect your personal data from breaches. We retain your data only as long as necessary to fulfill the stated purposes. Accounts inactive for 3 years will be securely deleted.",
        },
        {
          heading: "5. Grievance Redressal Mechanism",
          text: "Pursuant to the DPDP Act and IT Rules, if you have privacy concerns or wish to exercise your rights, please contact our Grievance Officer:\nName: Adarsh Yadav\nEmail: canvasbuildsofficial@gmail.com\nWe will acknowledge your request within 48 hours and resolve it within 30 days. If unresolved, you hold the right to appeal to the Data Protection Board of India (DPBI).",
        },
      ],
    },
    terms: {
      title: "Terms of Service & E-Commerce Disclosures",
      date: "Effective from: August 2026",
      subtitle: "Compliant with the Consumer Protection (E-Commerce) Rules, 2020",
      icon: <FileText className="w-6 h-6 text-[var(--color-accent-purple)]" />,
      sections: [
        {
          heading: "1. Entity & Platform Disclosures",
          text: "Canvas Builds operates as an inventory e-commerce entity. All digital goods and services provided on this platform are owned and sold directly by Canvas Builds, registered at 12/4, Sindhi Colony, Ashok Nagar, Shahganj, Agra, Uttar Pradesh - 282010, India. The country of origin for all proprietary software and templates is India.",
        },
        {
          heading: "2. Pricing & Payments",
          text: "All pricing displayed on the platform is all-inclusive. The final price shown at checkout represents the total cost, including any applicable taxes. We charge a one-time fee for lifetime access to the purchased digital template. We do not engage in drip pricing or hidden charges.",
        },
        {
          heading: "3. Refund & Cancellation Policy",
          text: "Due to the irrevocable nature of digital goods (source code and downloadable assets), all sales are final. We do not offer refunds, returns, or exchanges once the digital product has been accessed or downloaded. If you experience technical defects, please contact support for a resolution.",
        },
        {
          heading: "4. User Conduct & Misuse",
          text: "You are granted a non-exclusive license to use the templates for personal or business purposes. However, you may not resell, redistribute, or claim ownership of the raw source code. Unauthorized bot activities, scraping, or exploiting API endpoints is strictly prohibited.",
        },
        {
          heading: "5. Grievance Officer & Dispute Resolution",
          text: "Under the Consumer Protection (E-Commerce) Rules, 2020, user grievances regarding products or services can be directed to our Grievance Officer:\nName: Adarsh Yadav\nContact: canvasbuildsofficial@gmail.com\nComplaints will be acknowledged within 48 hours and addressed within one month. Disputes shall be subject to the exclusive jurisdiction of the courts in Agra, India.",
        },
      ],
    },
  };

  const currentContent = content[legalModal];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setLegalModal(null)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-[var(--color-bg-primary)] rounded-[2rem] border border-[var(--color-bg-secondary)] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh]"
        >
          <div className="flex items-start justify-between p-6 sm:p-8 border-b border-[var(--color-bg-secondary)]/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shrink-0">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-[var(--color-bg-secondary)] dark:border-slate-700 shrink-0">
                {currentContent.icon}
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[var(--color-text-primary)] tracking-tight">
                  {currentContent.title}
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                  <span className="text-[var(--color-text-primary)]/50 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                    {currentContent.date}
                  </span>
                  <span className="hidden sm:block text-[var(--color-text-primary)]/20">•</span>
                  <span className="text-[var(--color-accent-mint)] text-[10px] sm:text-xs font-bold">
                    {currentContent.subtitle}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setLegalModal(null)}
              className="p-2 bg-white dark:bg-slate-800 rounded-full text-[var(--color-text-primary)]/50 hover:bg-rose-50 hover:text-rose-500 transition-colors shadow-sm cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar bg-[var(--color-bg-primary)]">
            <div className="space-y-8">
              {currentContent.sections.map((section, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-[var(--color-bg-secondary)]/40 dark:border-slate-800 shadow-sm">
                  <h3 className="text-sm sm:text-base font-bold text-[var(--color-text-primary)] mb-3">
                    {section.heading}
                  </h3>
                  <p className="text-[var(--color-text-primary)]/70 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {section.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-6 border-t border-[var(--color-bg-secondary)]/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex justify-end shrink-0">
            <button
              onClick={() => setLegalModal(null)}
              className="px-8 py-3 bg-[var(--color-text-primary)] hover:bg-[var(--color-accent-purple)] text-white dark:bg-slate-100 dark:text-slate-900 font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
            >
              I Understand & Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};