import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import type { Route } from "./+types/privacy";

export function meta({}: Route.MetaArgs) {
  const title = "Privacy Policy - AZ Business Services";
  const description = "Read AZ Business Services' privacy policy to understand how we collect, use, and protect your personal information.";

  return [
    { title },
    { name: "description", content: description },
  ];
}

export async function loader() {
  return {
    isSignedIn: false,
    hasActiveSubscription: false,
  };
}

export default function PrivacyPage() {
  return (
    <>
      <Header loaderData={{ isSignedIn: false, hasActiveSubscription: false }} />
      <div className="min-h-screen bg-background pt-24">
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <h1 className="text-4xl font-bold tracking-tight mb-8">Privacy Policy</h1>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-muted-foreground mb-8">
                Last updated: January 8, 2025
              </p>

              <h2>Introduction</h2>
              <p>
                AZ Business Services ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
              </p>

              <h2>Information We Collect</h2>
              <h3>Information You Provide</h3>
              <ul>
                <li>Contact information (name, email, phone number)</li>
                <li>Business information (business name, address, services)</li>
                <li>Account credentials</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Communications with us</li>
              </ul>

              <h3>Information Automatically Collected</h3>
              <ul>
                <li>Usage data and analytics</li>
                <li>Device and browser information</li>
                <li>IP address and location data</li>
                <li>Cookies and similar technologies</li>
              </ul>

              <h2>How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul>
                <li>Provide and maintain our services</li>
                <li>Process business listings and customer inquiries</li>
                <li>Communicate with you about our services</li>
                <li>Improve our website and user experience</li>
                <li>Comply with legal obligations</li>
                <li>Prevent fraud and ensure security</li>
              </ul>

              <h2>Information Sharing</h2>
              <p>We may share your information with:</p>
              <ul>
                <li><strong>Service Providers:</strong> Third-party vendors who help us operate our services</li>
                <li><strong>Business Partners:</strong> With your consent, to facilitate business connections</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
              </ul>

              <h2>Data Security</h2>
              <p>
                We implement appropriate security measures to protect your information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
              </p>

              <h2>Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your information (subject to legal requirements)</li>
                <li>Opt out of marketing communications</li>
                <li>Request data portability</li>
              </ul>

              <h2>Cookies</h2>
              <p>
                We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie settings through your browser preferences.
              </p>

              <h2>Third-Party Links</h2>
              <p>
                Our website may contain links to third-party sites. We are not responsible for the privacy practices of these external sites and encourage you to read their privacy policies.
              </p>

              <h2>Children's Privacy</h2>
              <p>
                Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13 years of age.
              </p>

              <h2>Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
              </p>

              <h2>Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <ul>
                <li>Email: privacy@azbusiness.services</li>
                <li>Phone: (555) 123-4567</li>
                <li>Address: 123 Business Blvd, Phoenix, AZ 85001</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}