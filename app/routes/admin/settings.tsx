import { useUser } from "@clerk/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import { 
  IconUser, 
  IconBell, 
  IconShield, 
  IconDatabase,
  IconKey,
  IconMail
} from "@tabler/icons-react";

export default function AdminSettings() {
  const { user } = useUser();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <h1 className="text-3xl font-semibold">Admin Settings</h1>
        <p className="text-muted-foreground">
          Manage your admin account and system preferences
        </p>
      </div>
      
      <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
        <nav className="grid gap-4 text-sm text-muted-foreground">
          <a href="#profile" className="font-semibold text-primary">
            Profile
          </a>
          <a href="#notifications">Notifications</a>
          <a href="#security">Security</a>
          <a href="#system">System</a>
        </nav>
        
        <div className="grid gap-6">
          
          {/* Profile Settings */}
          <Card id="profile">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconUser className="h-5 w-5" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Update your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  defaultValue={user?.fullName || user?.firstName || ""}
                  disabled
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  defaultValue={user?.primaryEmailAddress?.emailAddress || ""}
                  disabled
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Input 
                  id="role" 
                  defaultValue="Administrator"
                  disabled
                />
              </div>
              
              <p className="text-sm text-muted-foreground">
                Profile information is managed through your Clerk account.
              </p>
            </CardContent>
          </Card>
          
          {/* Notification Settings */}
          <Card id="notifications">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconBell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch checked={true} />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Business Claim Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new business claims are submitted
                  </p>
                </div>
                <Switch checked={true} />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Important system updates and maintenance notifications
                  </p>
                </div>
                <Switch checked={true} />
              </div>
              
              <Separator />
              
              <Button>Save Notification Settings</Button>
            </CardContent>
          </Card>
          
          {/* Security Settings */}
          <Card id="security">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconShield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security and access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
                <Button variant="outline" className="w-fit">
                  <IconKey className="h-4 w-4 mr-2" />
                  Configure 2FA
                </Button>
              </div>
              
              <Separator />
              
              <div className="grid gap-2">
                <Label>Active Sessions</Label>
                <p className="text-sm text-muted-foreground">
                  Manage your active login sessions
                </p>
                <Button variant="outline" className="w-fit">
                  View Active Sessions
                </Button>
              </div>
              
              <Separator />
              
              <div className="grid gap-2">
                <Label>API Access</Label>
                <p className="text-sm text-muted-foreground">
                  Manage API keys and integrations
                </p>
                <Button variant="outline" className="w-fit">
                  <IconKey className="h-4 w-4 mr-2" />
                  Manage API Keys
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* System Settings */}
          <Card id="system">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconDatabase className="h-5 w-5" />
                System Settings
              </CardTitle>
              <CardDescription>
                System-wide configuration and maintenance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable maintenance mode to prevent public access
                  </p>
                </div>
                <Switch checked={false} />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Debug Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable debug logging for troubleshooting
                  </p>
                </div>
                <Switch checked={false} />
              </div>
              
              <Separator />
              
              <div className="grid gap-2">
                <Label>System Health</Label>
                <p className="text-sm text-muted-foreground">
                  Check system status and performance
                </p>
                <Button variant="outline" className="w-fit">
                  View System Health
                </Button>
              </div>
              
              <Separator />
              
              <div className="grid gap-2">
                <Label>Database Backup</Label>
                <p className="text-sm text-muted-foreground">
                  Create and manage database backups
                </p>
                <Button variant="outline" className="w-fit">
                  <IconDatabase className="h-4 w-4 mr-2" />
                  Backup Database
                </Button>
              </div>
            </CardContent>
          </Card>
          
        </div>
      </div>
    </div>
  );
}