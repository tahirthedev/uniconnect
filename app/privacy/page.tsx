'use client';

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
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
                Privacy Policy
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
                At Saydone, we are committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, store, and protect your information when you use our platform.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We comply with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Information</h3>
              <ul className="text-gray-700 leading-relaxed space-y-2 mb-4">
                <li>• Name and contact details (email, phone number)</li>
                <li>• Account credentials and profile information</li>
                <li>• Location data (when you enable location services)</li>
                <li>• Payment information (processed by third-party providers)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Usage Information</h3>
              <ul className="text-gray-700 leading-relaxed space-y-2">
                <li>• How you interact with our platform</li>
                <li>• Search queries and preferences</li>
                <li>• Device information and browser type</li>
                <li>• IP address and general location data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <ul className="text-gray-700 leading-relaxed space-y-2">
                <li>• To provide and improve our services</li>
                <li>• To connect you with other users</li>
                <li>• To send you relevant notifications and updates</li>
                <li>• To ensure platform security and prevent fraud</li>
                <li>• To comply with legal obligations</li>
                <li>• To analyze usage patterns and improve user experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Legal Basis for Processing</h2>
              <p className="text-gray-700 leading-relaxed mb-2">We process your personal data based on:</p>
              <ul className="text-gray-700 leading-relaxed space-y-2">
                <li>• <strong>Contractual necessity:</strong> To provide our services</li>
                <li>• <strong>Legitimate interests:</strong> To improve our platform and prevent fraud</li>
                <li>• <strong>Consent:</strong> For marketing communications (where required)</li>
                <li>• <strong>Legal obligation:</strong> To comply with applicable laws</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Sharing and Disclosure</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not sell your personal data. We may share your information in the following circumstances:
              </p>
              <ul className="text-gray-700 leading-relaxed space-y-2">
                <li>• With other users as necessary for platform functionality</li>
                <li>• With service providers who help us operate the platform</li>
                <li>• When required by law or to protect our rights</li>
                <li>• In case of business transfer or merger</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Security</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <ul className="text-gray-700 leading-relaxed space-y-2">
                <li>• Encryption of data in transit and at rest</li>
                <li>• Regular security assessments</li>
                <li>• Limited access to personal data on a need-to-know basis</li>
                <li>• Secure data centers and hosting infrastructure</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy or as required by law. When you delete your account, we will delete your personal data within 30 days, except where we need to retain certain information for legal or regulatory reasons.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Your Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-2">Under UK GDPR, you have the right to:</p>
              <ul className="text-gray-700 leading-relaxed space-y-2">
                <li>• <strong>Access:</strong> Request a copy of your personal data</li>
                <li>• <strong>Rectification:</strong> Correct inaccurate personal data</li>
                <li>• <strong>Erasure:</strong> Request deletion of your personal data</li>
                <li>• <strong>Restriction:</strong> Limit how we process your data</li>
                <li>• <strong>Portability:</strong> Receive your data in a structured format</li>
                <li>• <strong>Object:</strong> Object to processing based on legitimate interests</li>
                <li>• <strong>Withdraw consent:</strong> Where processing is based on consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Cookies and Tracking</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies and similar technologies to enhance your experience on our platform. These include:
              </p>
              <ul className="text-gray-700 leading-relaxed space-y-2">
                <li>• <strong>Essential cookies:</strong> Required for platform functionality</li>
                <li>• <strong>Analytics cookies:</strong> To understand how you use our platform</li>
                <li>• <strong>Preference cookies:</strong> To remember your settings</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                You can manage cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. International Transfers</h2>
              <p className="text-gray-700 leading-relaxed">
                Your personal data may be transferred to and processed in countries outside the UK. When we do this, we ensure appropriate safeguards are in place to protect your data in accordance with UK data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our platform is not intended for users under 18 years of age. We do not knowingly collect personal data from children under 18. If we become aware that we have collected personal data from a child under 18, we will take steps to delete such information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on our platform and updating the "Last Updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:
              </p>
              <p className="text-gray-700 leading-relaxed">
                Email: <a href="mailto:contactsaydone@gmail.com" className="text-orange-600 hover:text-orange-700 underline">contactsaydone@gmail.com</a>
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                If you are not satisfied with our response, you have the right to lodge a complaint with the Information Commissioner's Office (ICO), the UK's data protection authority.
              </p>
            </section>

          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            This privacy policy is effective as of the last updated date above. By continuing to use Saydone, you acknowledge that you have read and understood this policy.
          </p>
        </div>
      </div>
    </div>
  );
}
