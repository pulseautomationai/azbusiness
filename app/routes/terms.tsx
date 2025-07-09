import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import type { Route } from "./+types/terms";

export function meta({}: Route.MetaArgs) {
  const title = "Terms of Service - AZ Business Services";
  const description = "Read the terms of service for AZ Business Services. Understand your rights and responsibilities when using our platform.";

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

export default function TermsPage() {
  return (
    <>
      <Header loaderData={{ isSignedIn: false, hasActiveSubscription: false }} />
      <div className="min-h-screen bg-background pt-24">
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <h1 className="text-4xl font-bold tracking-tight mb-8">Terms of Service</h1>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-muted-foreground mb-8">
                Last updated: January 8, 2025
              </p>

              <h2>Acceptance of Terms</h2>
              <p>
                By accessing and using AZ Business Services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>

              <h2>Description of Service</h2>
              <p>
                AZ Business Services is a digital platform that connects Arizona businesses with local customers. We provide business listing services, lead generation tools, and marketing solutions for service-based businesses.
              </p>

              <h2>User Accounts</h2>
              <h3>Account Registration</h3>
              <p>
                To access certain features, you must register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
              </p>

              <h3>Account Security</h3>
              <p>
                You are responsible for safeguarding your password and all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>

              <h2>Business Listings</h2>
              <h3>Content Requirements</h3>
              <p>Business listings must:</p>
              <ul>
                <li>Represent a legitimate, operating business</li>
                <li>Contain accurate and truthful information</li>
                <li>Comply with applicable laws and regulations</li>
                <li>Not contain offensive, misleading, or inappropriate content</li>
              </ul>

              <h3>Verification Process</h3>
              <p>
                We reserve the right to verify business information and may require documentation to confirm business legitimacy. Verified status may be revoked if information is found to be false or misleading.
              </p>

              <h2>Prohibited Uses</h2>
              <p>You may not use our service:</p>
              <ul>
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To transmit or procure the sending of any advertising or promotional material without our prior written consent</li>
                <li>To impersonate or attempt to impersonate another business or person</li>
                <li>To harvest or collect information about users without their consent</li>
              </ul>

              <h2>Payment Terms</h2>
              <h3>Subscription Plans</h3>
              <p>
                Our paid plans are billed on a recurring basis. You agree to pay all fees associated with your chosen plan. Fees are non-refundable except as required by law.
              </p>

              <h3>Automatic Renewal</h3>
              <p>
                Your subscription will automatically renew unless cancelled before the next billing cycle. You may cancel your subscription at any time through your account settings.
              </p>

              <h2>Reviews and Ratings</h2>
              <p>
                Our platform allows customers to leave reviews and ratings. Reviews must be honest and based on actual experiences. We reserve the right to remove reviews that violate our guidelines.
              </p>

              <h2>Intellectual Property</h2>
              <p>
                The service and its original content, features, and functionality are and will remain the exclusive property of AZ Business Services and its licensors. The service is protected by copyright, trademark, and other laws.
              </p>

              <h2>Disclaimer</h2>
              <p>
                The information on this website is provided on an "as is" basis. We disclaim all warranties, express or implied, including but not limited to implied warranties of merchantability and fitness for a particular purpose.
              </p>

              <h2>Limitation of Liability</h2>
              <p>
                In no event shall AZ Business Services be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>

              <h2>Indemnification</h2>
              <p>
                You agree to defend, indemnify, and hold harmless AZ Business Services from and against any loss, damage, liability, claim, or demand made by any third party due to or arising out of your use of the service.
              </p>

              <h2>Termination</h2>
              <p>
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>

              <h2>Governing Law</h2>
              <p>
                These Terms shall be interpreted and governed by the laws of the State of Arizona, without regard to conflict of law provisions.
              </p>

              <h2>Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will provide notice of material changes by posting the new terms on this page and updating the "Last updated" date.
              </p>

              <h2>Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <ul>
                <li>Email: legal@azbusiness.services</li>
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