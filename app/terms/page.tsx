'use client';

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link href="/" className="mr-4">
              <Button variant="ghost" size="sm" className="p-2 hover:bg-white/80">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900">
                Terms & Conditions
              </h1>
              <p className="text-gray-600 mt-1">Last Updated: 12 August 2025</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 prose prose-lg max-w-none">
          <div className="space-y-8">
            
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to Saydone ("we," "us," "our," or the "Platform"). By accessing or using Saydone, you agree to be bound by these Terms & Conditions ("T&Cs"). If you do not agree, please do not use our services.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Saydone is a newly established company operating legally in the United Kingdom. We comply fully with all applicable UK laws and regulations regarding online platforms and data protection.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Saydone operates as a technology platform connecting users. We do not provide services directly and do not act as an agent, broker, or service provider.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Geographic Scope</h2>
              <p className="text-gray-700 leading-relaxed">
                These T&Cs apply to users located in the United Kingdom and any other jurisdictions where Saydone operates. UK consumer protection, data protection (GDPR), and e-commerce regulations apply as mandatory.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Eligibility</h2>
              <ul className="text-gray-700 leading-relaxed space-y-2">
                <li>• You must be at least 18 years old to register or use Saydone.</li>
                <li>• By registering, you confirm you have full legal capacity under UK law.</li>
                <li>• Use of Saydone is not permitted for individuals barred by UK law from entering contracts or operating online services.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Account Registration and Security</h2>
              <ul className="text-gray-700 leading-relaxed space-y-2">
                <li>• Provide accurate, complete, and up-to-date information during registration.</li>
                <li>• You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>• Notify us immediately of any unauthorized account access or security breach.</li>
                <li>• Multiple or fraudulent accounts are prohibited and may lead to suspension or termination.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Nature of Saydone Services</h2>
              <ul className="text-gray-700 leading-relaxed space-y-2">
                <li>• Saydone provides an online platform enabling users to connect and transact.</li>
                <li>• We do not endorse, verify, or guarantee users, listings, or transactions.</li>
                <li>• Saydone is not responsible for any acts, omissions, or disputes between users.</li>
                <li>• Users must perform their own due diligence before entering agreements or transactions.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. User Responsibilities and Conduct</h2>
              <p className="text-gray-700 leading-relaxed mb-2">• Comply with all applicable UK laws including but not limited to:</p>
              <ul className="text-gray-700 leading-relaxed space-y-1 ml-6">
                <li>○ Consumer Protection from Unfair Trading Regulations 2008</li>
                <li>○ The Consumer Rights Act 2015</li>
                <li>○ The Data Protection Act 2018 and UK GDPR</li>
                <li>○ The Electronic Commerce (EC Directive) Regulations 2002</li>
              </ul>
              <ul className="text-gray-700 leading-relaxed space-y-2 mt-4">
                <li>• Do not post or share illegal, fraudulent, defamatory, obscene, or infringing content.</li>
                <li>• Respect the rights, privacy, and safety of other users.</li>
                <li>• Report any suspicious or unlawful activity promptly.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Payments and Financial Transactions</h2>
              <ul className="text-gray-700 leading-relaxed space-y-2">
                <li>• All financial transactions occur directly between users.</li>
                <li>• Saydone does not process or hold payments and accepts no responsibility for any loss, fraud, or dispute related to payments.</li>
                <li>• Users must ensure compliance with UK tax laws and reporting obligations arising from their transactions.</li>
                <li>• Saydone recommends using secure payment methods and exercising caution.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Protection and Privacy</h2>
              <ul className="text-gray-700 leading-relaxed space-y-2">
                <li>• We comply with the UK GDPR and Data Protection Act 2018 in handling your personal data.</li>
                <li>• Our <Link href="/privacy" className="text-orange-600 hover:text-orange-700 underline">Privacy Policy</Link> explains how we collect, use, and protect your data.</li>
                <li>• By using Saydone, you consent to the processing of your personal data as described in the Privacy Policy.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <ul className="text-gray-700 leading-relaxed space-y-2">
                <li>• Saydone excludes all liability for loss, damage, or injury arising from use of the platform to the fullest extent permitted by UK law.</li>
                <li>• We disclaim all warranties, including those of merchantability and fitness for a particular purpose.</li>
                <li>• Saydone is not liable for indirect, incidental, or consequential damages, including loss of profits or data.</li>
                <li>• Nothing limits liability for death or personal injury caused by our negligence, or any other liability which cannot be excluded by law.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Intellectual Property</h2>
              <ul className="text-gray-700 leading-relaxed space-y-2">
                <li>• All intellectual property rights in Saydone's content, branding, and software are owned or licensed by us.</li>
                <li>• Users grant Saydone a non-exclusive, royalty-free licence to use any content they post for platform operation.</li>
                <li>• Unauthorized use or reproduction of our content is prohibited.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Governing Law and Dispute Resolution</h2>
              <ul className="text-gray-700 leading-relaxed space-y-2">
                <li>• These T&Cs are governed by the laws of England and Wales.</li>
                <li>• Disputes will be resolved exclusively in the courts of England and Wales unless otherwise required by mandatory consumer laws.</li>
                <li>• UK consumers retain all rights under consumer protection legislation.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Termination</h2>
              <ul className="text-gray-700 leading-relaxed space-y-2">
                <li>• We may suspend or terminate your account immediately if you breach these T&Cs or engage in unlawful activity.</li>
                <li>• Upon termination, all rights granted to you cease and you must stop using the platform.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Disclaimer on Fraud and Money Loss</h2>
              <ul className="text-gray-700 leading-relaxed space-y-2">
                <li>• Saydone explicitly disclaims any responsibility or liability for fraudulent acts or financial losses incurred by users.</li>
                <li>• We encourage users to exercise caution, verify counterparties, and report suspicious behaviour to relevant authorities.</li>
                <li>• Saydone does not guarantee transaction safety or user authenticity.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Compliance Statement</h2>
              <ul className="text-gray-700 leading-relaxed space-y-2">
                <li>• Saydone is a newly formed UK company fully compliant with all applicable laws for online services and data protection.</li>
                <li>• We have not engaged in or been subject to any legal issues or enforcement actions related to our platform operations.</li>
                <li>• Our goal is to provide a secure, lawful, and user-friendly environment for all users.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                For queries or support, contact:<br/>
                Email: <a href="mailto:contactsaydone@gmail.com" className="text-orange-600 hover:text-orange-700 underline">contactsaydone@gmail.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update these T&Cs at any time by posting updated versions on our website. Continued use after changes means you accept the revised terms.
              </p>
            </section>

          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            These terms are effective as of the last updated date above. By continuing to use Saydone, you acknowledge that you have read and understood these terms.
          </p>
        </div>
      </div>
    </div>
  );
}
