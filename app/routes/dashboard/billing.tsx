import { useUser } from "@clerk/react-router";
import { usePlanFeatures } from "~/hooks/usePlanFeatures";
import { FeatureGate } from "~/components/FeatureGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Link } from "react-router";
import { 
  IconCreditCard,
  IconCrown,
  IconCheck,
  IconX,
  IconCalendar,
  IconReceipt
} from "@tabler/icons-react";

export default function BillingPage() {
  const { user } = useUser();
  const planFeatures = usePlanFeatures();

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to manage your billing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/sign-in">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const mockSubscription = {
    plan: planFeatures.planTier,
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    amount: planFeatures.planTier === 'power' ? 97 : planFeatures.planTier === 'pro' ? 29 : 0,
    interval: 'month',
  };

  const mockInvoices = [
    {
      id: 'inv_001',
      date: new Date('2024-12-13'),
      amount: mockSubscription.amount,
      status: 'paid',
    },
    {
      id: 'inv_002', 
      date: new Date('2024-11-13'),
      amount: mockSubscription.amount,
      status: 'paid',
    },
    {
      id: 'inv_003',
      date: new Date('2024-10-13'),
      amount: mockSubscription.amount,
      status: 'paid',
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-6 p-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription, payment methods, and billing history
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconCrown className="h-5 w-5" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold">{planFeatures.planTier.charAt(0).toUpperCase() + planFeatures.planTier.slice(1)}</h3>
                    <Badge variant={planFeatures.planTier === 'power' ? 'default' : planFeatures.planTier === 'pro' ? 'secondary' : 'outline'}>
                      {mockSubscription.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-3xl font-bold">
                    ${mockSubscription.amount}
                    <span className="text-base font-normal text-muted-foreground">/month</span>
                  </p>
                </div>
              </div>

              {mockSubscription.amount > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IconCalendar className="h-4 w-4" />
                  Next billing date: {mockSubscription.currentPeriodEnd.toLocaleDateString()}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Logo Upload</span>
                  {planFeatures.logoUpload ? 
                    <IconCheck className="h-4 w-4 text-green-500" /> : 
                    <IconX className="h-4 w-4 text-red-500" />
                  }
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Image Gallery</span>
                  {planFeatures.imageGallery ? 
                    <IconCheck className="h-4 w-4 text-green-500" /> : 
                    <IconX className="h-4 w-4 text-red-500" />
                  }
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Lead Tracking</span>
                  {planFeatures.leadTracking ? 
                    <IconCheck className="h-4 w-4 text-green-500" /> : 
                    <IconX className="h-4 w-4 text-red-500" />
                  }
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>AI Content Tools</span>
                  {planFeatures.aiContentGeneration ? 
                    <IconCheck className="h-4 w-4 text-green-500" /> : 
                    <IconX className="h-4 w-4 text-red-500" />
                  }
                </div>
              </div>

              <div className="flex space-x-2">
                {planFeatures.planTier !== 'power' && (
                  <Link to="/pricing" className="flex-1">
                    <Button className="w-full">Upgrade Plan</Button>
                  </Link>
                )}
                {mockSubscription.amount > 0 && (
                  <Button variant="outline">Manage Subscription</Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <FeatureGate 
            featureId="billingManagement"
            fallback={
              <Card className="opacity-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconCreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                  <CardDescription>
                    Upgrade to a paid plan to manage payment methods
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/pricing">
                    <Button>Upgrade Plan</Button>
                  </Link>
                </CardContent>
              </Card>
            }
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconCreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                    VISA
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/27</p>
                  </div>
                  <Badge variant="outline">Default</Badge>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Add Payment Method</Button>
                  <Button variant="outline" size="sm">Update</Button>
                </div>
              </CardContent>
            </Card>
          </FeatureGate>

        </div>

        {/* Billing History */}
        <FeatureGate 
          featureId="billingManagement"
          fallback={
            <Card className="opacity-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconReceipt className="h-5 w-5" />
                  Billing History
                </CardTitle>
                <CardDescription>
                  View your billing history with a paid plan
                </CardDescription>
              </CardHeader>
            </Card>
          }
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconReceipt className="h-5 w-5" />
                Billing History
              </CardTitle>
              <CardDescription>
                Your recent invoices and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{invoice.date.toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">Invoice #{invoice.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${invoice.amount}</p>
                      <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                        {invoice.status.toUpperCase()}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">Download</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FeatureGate>

        {/* Plan Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>
              Compare features and upgrade your plan anytime
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Free Plan */}
              <div className={`p-4 border rounded-lg ${planFeatures.planTier === 'free' ? 'border-primary bg-primary/5' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Free</h3>
                  {planFeatures.planTier === 'free' && <Badge>Current</Badge>}
                </div>
                <p className="text-2xl font-bold mb-4">$0<span className="text-sm font-normal">/month</span></p>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <IconCheck className="h-3 w-3 text-green-500" />
                    Basic listing
                  </li>
                  <li className="flex items-center gap-2">
                    <IconCheck className="h-3 w-3 text-green-500" />
                    Logo upload
                  </li>
                  <li className="flex items-center gap-2">
                    <IconX className="h-3 w-3 text-red-500" />
                    Lead tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <IconX className="h-3 w-3 text-red-500" />
                    Image gallery
                  </li>
                </ul>
              </div>

              {/* Pro Plan */}
              <div className={`p-4 border rounded-lg ${planFeatures.planTier === 'pro' ? 'border-primary bg-primary/5' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Pro</h3>
                  {planFeatures.planTier === 'pro' && <Badge>Current</Badge>}
                </div>
                <p className="text-2xl font-bold mb-4">$29<span className="text-sm font-normal">/month</span></p>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <IconCheck className="h-3 w-3 text-green-500" />
                    Everything in Free
                  </li>
                  <li className="flex items-center gap-2">
                    <IconCheck className="h-3 w-3 text-green-500" />
                    Lead tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <IconCheck className="h-3 w-3 text-green-500" />
                    Image gallery
                  </li>
                  <li className="flex items-center gap-2">
                    <IconX className="h-3 w-3 text-red-500" />
                    AI content tools
                  </li>
                </ul>
                {planFeatures.planTier !== 'pro' && (
                  <Button className="w-full mt-4" size="sm">
                    {planFeatures.planTier === 'free' ? 'Upgrade to Pro' : 'Downgrade to Pro'}
                  </Button>
                )}
              </div>

              {/* Power Plan */}
              <div className={`p-4 border rounded-lg ${planFeatures.planTier === 'power' ? 'border-primary bg-primary/5' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold flex items-center gap-1">
                    <IconCrown className="h-4 w-4" />
                    Power
                  </h3>
                  {planFeatures.planTier === 'power' && <Badge>Current</Badge>}
                </div>
                <p className="text-2xl font-bold mb-4">$97<span className="text-sm font-normal">/month</span></p>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <IconCheck className="h-3 w-3 text-green-500" />
                    Everything in Pro
                  </li>
                  <li className="flex items-center gap-2">
                    <IconCheck className="h-3 w-3 text-green-500" />
                    AI content tools
                  </li>
                  <li className="flex items-center gap-2">
                    <IconCheck className="h-3 w-3 text-green-500" />
                    Priority support
                  </li>
                  <li className="flex items-center gap-2">
                    <IconCheck className="h-3 w-3 text-green-500" />
                    Monthly blog posts
                  </li>
                </ul>
                {planFeatures.planTier !== 'power' && (
                  <Button className="w-full mt-4" size="sm">
                    Upgrade to Power
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}