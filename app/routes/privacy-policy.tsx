import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import type { Route } from "./+types/privacy-policy";

export function meta({}: Route.MetaArgs) {
  const title = "Privacy Policy - AZ Business Services";
  const description = "Privacy Policy for AZ Business Services - Learn how we collect, use, and protect information when you use our Arizona business directory service.";

  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: "index, follow" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://azbusiness.services/privacy-policy" },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-32">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 py-16">
          <div className="prose prose-lg max-w-none">
            <h1 className="font-serif text-4xl font-medium text-ironwood-charcoal mb-8">
              Privacy Policy
            </h1>
            
            <div className="space-y-2 mb-8 text-sm text-ironwood-charcoal/70">
              <p><strong>Effective Date:</strong> January 15, 2025</p>
              <p><strong>Last Updated:</strong> January 15, 2025</p>
            </div>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                Introduction
              </h2>
              <p className="text-ironwood-charcoal/80 leading-relaxed">
                AZBusiness.Services ("we," "us," or "our") operates the website https://azbusiness.services (the "Service"). This Privacy Policy explains how we collect, use, and protect information when you use our Arizona business directory service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                Information We Collect
              </h2>
              
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-3">
                Business Information
              </h3>
              <p className="text-ironwood-charcoal/80 leading-relaxed mb-4">
                We collect the following types of business information:
              </p>
              <ul className="list-disc list-inside text-ironwood-charcoal/80 leading-relaxed mb-6 space-y-1">
                <li>Business name</li>
                <li>Business website URL</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Business address</li>
                <li>Other publicly available business details</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                How We Collect Information
              </h2>
              <p className="text-ironwood-charcoal/80 leading-relaxed mb-4">
                We collect business information through:
              </p>
              <ul className="list-disc list-inside text-ironwood-charcoal/80 leading-relaxed mb-6 space-y-1">
                <li><strong>Contact forms:</strong> When businesses submit their information directly through our website</li>
                <li><strong>Web scraping:</strong> We may collect publicly available business information from various online sources</li>
                <li><strong>Direct communication:</strong> Information provided through email or other direct contact</li>
              </ul>
              
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-3">
                Technical Information
              </h3>
              <p className="text-ironwood-charcoal/80 leading-relaxed">
                We use analytics tools to understand how our website is used, but we do not use cookies or tracking technologies that identify individual users.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                How We Use Your Information
              </h2>
              <p className="text-ironwood-charcoal/80 leading-relaxed mb-4">
                We use the collected business information for the following purposes:
              </p>
              <ul className="list-disc list-inside text-ironwood-charcoal/80 leading-relaxed space-y-1">
                <li>Creating and maintaining business listings in our directory</li>
                <li>Customer outreach and communication</li>
                <li>Improving our directory services</li>
                <li>Responding to inquiries and providing customer support</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                Information Sharing and Disclosure
              </h2>
              <p className="text-ironwood-charcoal/80 leading-relaxed mb-4">
                We do not sell, trade, or share your business information with third parties for their marketing purposes. We may share information only in the following limited circumstances:
              </p>
              
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-3">
                Service Providers
              </h3>
              <p className="text-ironwood-charcoal/80 leading-relaxed mb-4">
                We work with trusted service providers who assist us in operating our website:
              </p>
              <ul className="list-disc list-inside text-ironwood-charcoal/80 leading-relaxed mb-6 space-y-1">
                <li><strong>Polar:</strong> Payment processing services</li>
                <li><strong>Clerk:</strong> User authentication and authorization services</li>
              </ul>
              <p className="text-ironwood-charcoal/80 leading-relaxed mb-6">
                These providers have access to information only as necessary to perform their services and are obligated to protect your information.
              </p>
              
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-3">
                Legal Requirements
              </h3>
              <p className="text-ironwood-charcoal/80 leading-relaxed mb-4">
                We may disclose information if required by law or if we believe such disclosure is necessary to:
              </p>
              <ul className="list-disc list-inside text-ironwood-charcoal/80 leading-relaxed space-y-1">
                <li>Comply with legal obligations</li>
                <li>Protect our rights or property</li>
                <li>Prevent fraud or illegal activities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                Data Retention
              </h2>
              <p className="text-ironwood-charcoal/80 leading-relaxed">
                We retain business information indefinitely to maintain the comprehensiveness and accuracy of our business directory. This allows us to provide consistent and reliable directory services to our users.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                Your Rights and Choices
              </h2>
              
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-3">
                Deletion Requests
              </h3>
              <p className="text-ironwood-charcoal/80 leading-relaxed mb-4">
                You have the right to request deletion of your business information from our directory. To submit a deletion request, please contact us at <a href="mailto:support@azbusiness.services" className="text-ocotillo-red hover:underline">support@azbusiness.services</a> with the following information:
              </p>
              <ul className="list-disc list-inside text-ironwood-charcoal/80 leading-relaxed mb-6 space-y-1">
                <li>Business name</li>
                <li>Contact information associated with the listing</li>
                <li>Specific details about the information you want removed</li>
              </ul>
              <p className="text-ironwood-charcoal/80 leading-relaxed mb-6">
                We will process deletion requests within a reasonable timeframe.
              </p>
              
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-3">
                Corrections and Updates
              </h3>
              <p className="text-ironwood-charcoal/80 leading-relaxed">
                If you need to update or correct your business information in our directory, please contact us at <a href="mailto:support@azbusiness.services" className="text-ocotillo-red hover:underline">support@azbusiness.services</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                Data Security
              </h2>
              <p className="text-ironwood-charcoal/80 leading-relaxed">
                We implement appropriate technical and organizational measures to protect the business information we collect against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                Geographic Scope
              </h2>
              <p className="text-ironwood-charcoal/80 leading-relaxed">
                Our services are focused exclusively on Arizona businesses and are intended for use within Arizona. We do not knowingly collect information from businesses outside of Arizona.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                Age Restrictions
              </h2>
              <p className="text-ironwood-charcoal/80 leading-relaxed">
                Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children under 18. If you become aware that a child has provided us with personal information, please contact us so we can take appropriate action.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                Changes to This Privacy Policy
              </h2>
              <p className="text-ironwood-charcoal/80 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time. When we make changes, we will:
              </p>
              <ul className="list-disc list-inside text-ironwood-charcoal/80 leading-relaxed mb-6 space-y-1">
                <li>Update the "Last Updated" date at the top of this policy</li>
                <li>Post the updated policy on our website</li>
                <li>For significant changes, we may provide additional notice</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                Contact Us
              </h2>
              <p className="text-ironwood-charcoal/80 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="space-y-2 text-ironwood-charcoal/80">
                <p><strong>Email:</strong> <a href="mailto:support@azbusiness.services" className="text-ocotillo-red hover:underline">support@azbusiness.services</a></p>
                <p><strong>Website:</strong> <a href="https://azbusiness.services" className="text-ocotillo-red hover:underline">https://azbusiness.services</a></p>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}