import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import type { Route } from "./+types/terms-of-service";

export function meta({}: Route.MetaArgs) {
  const title = "Terms of Service - AZ Business Services";
  const description = "Terms of Service for AZ Business Services - Understanding your rights and responsibilities when using our Arizona business directory service.";

  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: "index, follow" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://azbusiness.services/terms-of-service" },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
}

export default function TermsOfServicePage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-32">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 py-16">
          <div className="prose prose-lg max-w-none">
            <h1 className="font-serif text-4xl font-medium text-ironwood-charcoal mb-8">
              Terms of Service
            </h1>
            
            <div className="space-y-2 mb-8 text-sm text-ironwood-charcoal/70">
              <p><strong>Effective Date:</strong> January 15, 2025</p>
              <p><strong>Last Updated:</strong> January 15, 2025</p>
            </div>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-ironwood-charcoal/80 leading-relaxed">
                By accessing or using AZBusiness.Services ("the Service," "our website," or "we"), located at https://azbusiness.services, you ("User," "you," or "your") agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                2. Description of Service
              </h2>
              <p className="text-ironwood-charcoal/80 leading-relaxed mb-4">
                AZBusiness.Services is a local business directory focused exclusively on Arizona businesses. We provide a platform where:
              </p>
              <ul className="list-disc list-inside text-ironwood-charcoal/80 leading-relaxed space-y-1">
                <li>Arizona businesses can be listed and discovered</li>
                <li>Users can search for local Arizona businesses</li>
                <li>Business information is collected, organized, and presented to the public</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                3. Eligibility and Geographic Scope
              </h2>
              <p className="text-ironwood-charcoal/80 leading-relaxed mb-4">
                Our Service is intended for:
              </p>
              <ul className="list-disc list-inside text-ironwood-charcoal/80 leading-relaxed mb-4 space-y-1">
                <li>Businesses located in Arizona</li>
                <li>Users seeking Arizona business information</li>
                <li>Users who are at least 18 years of age</li>
              </ul>
              <p className="text-ironwood-charcoal/80 leading-relaxed">
                We do not provide services for businesses outside of Arizona.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                4. User Accounts and Authentication
              </h2>
              
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-3">
                Account Creation
              </h3>
              <ul className="list-disc list-inside text-ironwood-charcoal/80 leading-relaxed mb-6 space-y-1">
                <li>Account creation and authentication services are provided through Clerk</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You agree to provide accurate and complete information when creating an account</li>
              </ul>
              
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-3">
                Account Responsibilities
              </h3>
              <p className="text-ironwood-charcoal/80 leading-relaxed mb-2">
                You are responsible for:
              </p>
              <ul className="list-disc list-inside text-ironwood-charcoal/80 leading-relaxed space-y-1">
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use of your account</li>
                <li>Ensuring your account information remains current and accurate</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                5. Business Listings and Content
              </h2>
              
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-3">
                Business Information Submission
              </h3>
              <p className="text-ironwood-charcoal/80 leading-relaxed mb-2">
                When submitting business information, you represent and warrant that:
              </p>
              <ul className="list-disc list-inside text-ironwood-charcoal/80 leading-relaxed mb-6 space-y-1">
                <li>You are authorized to submit information on behalf of the business</li>
                <li>All information provided is accurate, current, and complete</li>
                <li>You own or have the right to use any content you submit</li>
                <li>The business is located in Arizona and legally operating</li>
              </ul>
              
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-3">
                Information Collection
              </h3>
              <p className="text-ironwood-charcoal/80 leading-relaxed mb-2">
                We may collect business information through:
              </p>
              <ul className="list-disc list-inside text-ironwood-charcoal/80 leading-relaxed mb-6 space-y-1">
                <li>Direct submissions via contact forms</li>
                <li>Web scraping of publicly available information</li>
                <li>Other publicly accessible sources</li>
              </ul>
              
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-3">
                Content Guidelines
              </h3>
              <p className="text-ironwood-charcoal/80 leading-relaxed mb-2">
                Business listings must:
              </p>
              <ul className="list-disc list-inside text-ironwood-charcoal/80 leading-relaxed space-y-1">
                <li>Contain accurate and truthful information</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not contain inappropriate, offensive, or misleading content</li>
                <li>Not infringe on third-party intellectual property rights</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                6. Payment Terms
              </h2>
              
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-3">
                Payment Processing
              </h3>
              <ul className="list-disc list-inside text-ironwood-charcoal/80 leading-relaxed mb-6 space-y-1">
                <li>Payment processing is handled by Polar, our third-party payment processor</li>
                <li>By making a payment, you agree to Polar's terms and conditions</li>
                <li>All fees are non-refundable unless otherwise specified</li>
              </ul>
              
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-3">
                Pricing and Billing
              </h3>
              <ul className="list-disc list-inside text-ironwood-charcoal/80 leading-relaxed space-y-1">
                <li>Current pricing is available on our website</li>
                <li>Prices may change with reasonable notice</li>
                <li>You are responsible for all applicable taxes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                7. Intellectual Property Rights
              </h2>
              
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-3">
                Our Content
              </h3>
              <p className="text-ironwood-charcoal/80 leading-relaxed mb-6">
                The Service and its content, including but not limited to text, graphics, logos, and software, are owned by AZBusiness.Services and are protected by intellectual property laws.
              </p>
              
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-3">
                User-Submitted Content
              </h3>
              <p className="text-ironwood-charcoal/80 leading-relaxed mb-2">
                By submitting business information or other content:
              </p>
              <ul className="list-disc list-inside text-ironwood-charcoal/80 leading-relaxed mb-6 space-y-1">
                <li>You retain ownership of your content</li>
                <li>You grant us a non-exclusive, royalty-free license to use, display, and distribute your content through our Service</li>
                <li>You confirm you have the right to grant this license</li>
              </ul>
              
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-3">
                Trademark Policy
              </h3>
              <p className="text-ironwood-charcoal/80 leading-relaxed">
                Business names, logos, and trademarks remain the property of their respective owners. We do not claim ownership of any business trademarks or trade names listed in our directory.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                8. Prohibited Uses
              </h2>
              <p className="text-ironwood-charcoal/80 leading-relaxed mb-2">
                You may not use our Service to:
              </p>
              <ul className="list-disc list-inside text-ironwood-charcoal/80 leading-relaxed space-y-1">
                <li>Submit false, misleading, or inaccurate business information</li>
                <li>Violate any local, state, or federal laws</li>
                <li>Infringe on the rights of others</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use automated tools to extract data without permission</li>
                <li>Interfere with the proper functioning of the Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                9. Data Accuracy and Disclaimers
              </h2>
              
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-3">
                Information Accuracy
              </h3>
              <ul className="list-disc list-inside text-ironwood-charcoal/80 leading-relaxed mb-6 space-y-1">
                <li>We strive to maintain accurate business information but do not guarantee its accuracy</li>
                <li>Business information may become outdated or incorrect over time</li>
                <li>Users should verify business information independently before relying on it</li>
              </ul>
              
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-3">
                Service Availability
              </h3>
              <ul className="list-disc list-inside text-ironwood-charcoal/80 leading-relaxed space-y-1">
                <li>We aim to provide continuous service but do not guarantee uninterrupted access</li>
                <li>We may temporarily suspend the Service for maintenance or updates</li>
                <li>We are not liable for any downtime or service interruptions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                10. Privacy
              </h2>
              <p className="text-ironwood-charcoal/80 leading-relaxed">
                Your privacy is important to us. Please review our <a href="/privacy-policy" className="text-ocotillo-red hover:underline">Privacy Policy</a>, which explains how we collect, use, and protect your information. By using our Service, you consent to our privacy practices as described in the Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                11. Modifications and Updates
              </h2>
              
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-3">
                Listing Changes
              </h3>
              <ul className="list-disc list-inside text-ironwood-charcoal/80 leading-relaxed mb-6 space-y-1">
                <li>Businesses may request updates or corrections to their listings by contacting <a href="mailto:support@azbusiness.services" className="text-ocotillo-red hover:underline">support@azbusiness.services</a></li>
                <li>We reserve the right to modify or remove listings that violate these Terms</li>
                <li>We may update business information based on publicly available sources</li>
              </ul>
              
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-3">
                Service Changes
              </h3>
              <p className="text-ironwood-charcoal/80 leading-relaxed mb-2">
                We reserve the right to:
              </p>
              <ul className="list-disc list-inside text-ironwood-charcoal/80 leading-relaxed space-y-1">
                <li>Modify or discontinue the Service at any time</li>
                <li>Change these Terms with reasonable notice</li>
                <li>Update our features and functionality</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                12. Termination
              </h2>
              
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-3">
                User Termination
              </h3>
              <p className="text-ironwood-charcoal/80 leading-relaxed mb-6">
                You may stop using our Service at any time. If you have an account, you may request account deletion by contacting <a href="mailto:support@azbusiness.services" className="text-ocotillo-red hover:underline">support@azbusiness.services</a>.
              </p>
              
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-3">
                Our Right to Terminate
              </h3>
              <p className="text-ironwood-charcoal/80 leading-relaxed mb-2">
                We may terminate or suspend your access to the Service if you:
              </p>
              <ul className="list-disc list-inside text-ironwood-charcoal/80 leading-relaxed space-y-1">
                <li>Violate these Terms</li>
                <li>Provide false or misleading information</li>
                <li>Engage in prohibited activities</li>
                <li>Request deletion of your business listing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                13. Limitation of Liability
              </h2>
              <p className="text-ironwood-charcoal/80 leading-relaxed mb-2">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW:
              </p>
              <ul className="list-disc list-inside text-ironwood-charcoal/80 leading-relaxed space-y-1">
                <li>OUR LIABILITY IS LIMITED TO THE AMOUNT YOU PAID FOR THE SERVICE</li>
                <li>WE ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES</li>
                <li>WE DO NOT GUARANTEE THE ACCURACY OF BUSINESS INFORMATION</li>
                <li>YOU USE THE SERVICE AT YOUR OWN RISK</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                14. Indemnification
              </h2>
              <p className="text-ironwood-charcoal/80 leading-relaxed mb-2">
                You agree to indemnify and hold harmless AZBusiness.Services from any claims, damages, or expenses arising from:
              </p>
              <ul className="list-disc list-inside text-ironwood-charcoal/80 leading-relaxed space-y-1">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Information you submit to the Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                15. Governing Law and Jurisdiction
              </h2>
              <p className="text-ironwood-charcoal/80 leading-relaxed">
                These Terms are governed by the laws of the State of Arizona, without regard to conflict of law principles. Any disputes arising under these Terms will be resolved in the appropriate courts of Arizona.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                16. Dispute Resolution
              </h2>
              
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-3">
                Initial Contact
              </h3>
              <p className="text-ironwood-charcoal/80 leading-relaxed mb-6">
                Before pursuing formal legal action, parties agree to first attempt to resolve disputes by contacting <a href="mailto:support@azbusiness.services" className="text-ocotillo-red hover:underline">support@azbusiness.services</a>.
              </p>
              
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-3">
                Arizona Jurisdiction
              </h3>
              <p className="text-ironwood-charcoal/80 leading-relaxed">
                Any legal proceedings must be brought in the appropriate courts of Arizona.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                17. Severability
              </h2>
              <p className="text-ironwood-charcoal/80 leading-relaxed">
                If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                18. Entire Agreement
              </h2>
              <p className="text-ironwood-charcoal/80 leading-relaxed">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and AZBusiness.Services regarding your use of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                19. Contact Information
              </h2>
              <p className="text-ironwood-charcoal/80 leading-relaxed mb-4">
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-ironwood-charcoal/80">
                <p><strong>Email:</strong> <a href="mailto:support@azbusiness.services" className="text-ocotillo-red hover:underline">support@azbusiness.services</a></p>
                <p><strong>Website:</strong> <a href="https://azbusiness.services" className="text-ocotillo-red hover:underline">https://azbusiness.services</a></p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                20. Acknowledgment
              </h2>
              <p className="text-ironwood-charcoal/80 leading-relaxed">
                By using AZBusiness.Services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}