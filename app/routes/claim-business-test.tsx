import { useSearchParams } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";

export default function ClaimBusinessTest() {
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get("businessId");

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-24">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Claim Business Test Page</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Business ID: {businessId || "Not provided"}</p>
              <Button className="mt-4">Test Button</Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}