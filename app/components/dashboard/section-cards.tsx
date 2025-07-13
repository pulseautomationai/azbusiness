import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { useQuery } from "convex/react"
import { api } from "convex/_generated/api"

import { Badge } from "~/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"

export function SectionCards() {
  const metrics = useQuery(api.adminAnalytics.getAdminDashboardMetrics);

  if (!metrics) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <CardDescription>Loading...</CardDescription>
              <CardTitle className="text-2xl font-semibold">--</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Monthly Recurring Revenue */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Monthly Revenue (MRR)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(metrics.revenue.total)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {metrics.revenue.trend === "up" ? <IconTrendingUp /> : <IconTrendingDown />}
              {formatPercentage(metrics.revenue.growth)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {metrics.subscriptions.active} active subscriptions
            {metrics.revenue.trend === "up" ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            From Pro and Power plan subscriptions
          </div>
        </CardFooter>
      </Card>

      {/* New Customers */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>New Customers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.customers.new.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {metrics.customers.trend === "up" ? <IconTrendingUp /> : <IconTrendingDown />}
              {formatPercentage(metrics.customers.growth)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {metrics.customers.trend === "up" ? "Growing" : "Declining"} this period
            {metrics.customers.trend === "up" ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            New signups in the last 30 days
          </div>
        </CardFooter>
      </Card>

      {/* Active Accounts */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Accounts</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.activeAccounts.total.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {metrics.activeAccounts.trend === "up" ? <IconTrendingUp /> : <IconTrendingDown />}
              {formatPercentage(metrics.activeAccounts.growth)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {metrics.activeAccounts.claimed} claimed businesses
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Users with subscriptions or claimed listings
          </div>
        </CardFooter>
      </Card>

      {/* Business Claim Rate */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Business Claim Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.businesses.claimRate.toFixed(1)}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {metrics.businesses.trend === "up" ? <IconTrendingUp /> : <IconTrendingDown />}
              {formatPercentage(metrics.businesses.growth)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {metrics.businesses.claimed} of {metrics.businesses.total} claimed
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Percentage of businesses with owners
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
