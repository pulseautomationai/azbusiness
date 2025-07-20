/**
 * AI Ranking System Testing Dashboard
 * Admin interface for testing Phases 1 & 2 implementation
 */

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { AlertCircle, CheckCircle, Clock, Play, Trash2, Database } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";

export default function AIRankingTests() {
  const [testConfig, setTestConfig] = useState({
    businessName: "AI Test Business",
    city: "Phoenix", 
    category: "hvac",
    planTier: "pro" as "free" | "starter" | "pro" | "power",
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const runTests = useMutation(api.testAIRankingSystem.runComprehensiveTests);
  const cleanupTest = useMutation(api.testAIRankingSystem.cleanupTestData);
  const systemHealth = useQuery(api.testAIRankingSystem.getSystemHealthStatus);
  const rankingSystemStatus = useQuery(api.batchRankingProcessor.getRankingSystemStatus);

  const handleRunTests = async () => {
    setIsRunning(true);
    setTestResults(null);
    
    try {
      const results = await runTests({
        testBusinessName: testConfig.businessName,
        testCity: testConfig.city,
        testCategory: testConfig.category,
        testPlanTier: testConfig.planTier,
      });
      setTestResults(results);
    } catch (error) {
      setTestResults({
        testRun: { status: "failed", error: String(error) },
        phases: [],
        summary: { totalTests: 0, totalPassed: 0, totalFailed: 1, successRate: 0 },
        recommendations: ["Test execution failed - check console for details"],
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCleanup = async () => {
    try {
      await cleanupTest({ testBusinessName: testConfig.businessName });
      setTestResults(null);
    } catch (error) {
      console.error("Cleanup failed:", error);
    }
  };

  const getStatusColor = (passed: boolean) => {
    return passed ? "text-green-600" : "text-red-600";
  };

  const getStatusIcon = (passed: boolean) => {
    return passed ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Ranking System Tests</h1>
          <p className="text-muted-foreground">
            Comprehensive testing for Phases 1 & 2 implementation
          </p>
        </div>
      </div>

      <Tabs defaultValue="system-health" className="space-y-4">
        <TabsList>
          <TabsTrigger value="system-health">System Health</TabsTrigger>
          <TabsTrigger value="run-tests">Run Tests</TabsTrigger>
          <TabsTrigger value="test-results">Test Results</TabsTrigger>
        </TabsList>

        <TabsContent value="system-health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Health Status
              </CardTitle>
              <CardDescription>
                Current status of the AI ranking system components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {systemHealth && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Database Tables</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Businesses</span>
                        <Badge variant={systemHealth.checks.database.businesses ? "default" : "destructive"}>
                          {systemHealth.checks.database.businesses ? "✓" : "✗"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Categories</span>
                        <Badge variant={systemHealth.checks.database.categories ? "default" : "destructive"}>
                          {systemHealth.checks.database.categories ? "✓" : "✗"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Cities</span>
                        <Badge variant={systemHealth.checks.database.cities ? "default" : "destructive"}>
                          {systemHealth.checks.database.cities ? "✓" : "✗"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Reviews</span>
                        <Badge variant={systemHealth.checks.database.reviews ? "default" : "destructive"}>
                          {systemHealth.checks.database.reviews ? "✓" : "✗"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">AI Ranking Tables</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Performance Metrics</span>
                        <Badge variant={systemHealth.checks.aiRankingTables.performanceMetrics ? "default" : "secondary"}>
                          {systemHealth.checks.aiRankingTables.performanceMetrics ? "✓" : "Empty"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Ranking Cache</span>
                        <Badge variant={systemHealth.checks.aiRankingTables.rankingCache ? "default" : "secondary"}>
                          {systemHealth.checks.aiRankingTables.rankingCache ? "✓" : "Empty"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {rankingSystemStatus && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Ranking System Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold">{rankingSystemStatus.system.totalBusinesses}</div>
                        <div className="text-sm text-muted-foreground">Total Businesses</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{rankingSystemStatus.coverage.scoringCoverage}%</div>
                        <div className="text-sm text-muted-foreground">Scoring Coverage</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{rankingSystemStatus.cacheHealth.totalCaches}</div>
                        <div className="text-sm text-muted-foreground">Cached Rankings</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{rankingSystemStatus.cacheHealth.freshPercentage}%</div>
                        <div className="text-sm text-muted-foreground">Fresh Caches</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="run-tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
              <CardDescription>
                Configure test parameters and run comprehensive AI ranking system tests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Test Business Name</Label>
                  <Input
                    id="businessName"
                    value={testConfig.businessName}
                    onChange={(e) => setTestConfig(prev => ({ ...prev, businessName: e.target.value }))}
                    placeholder="AI Test Business"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Test City</Label>
                  <Select value={testConfig.city} onValueChange={(value) => setTestConfig(prev => ({ ...prev, city: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Phoenix">Phoenix</SelectItem>
                      <SelectItem value="Scottsdale">Scottsdale</SelectItem>
                      <SelectItem value="Tempe">Tempe</SelectItem>
                      <SelectItem value="Mesa">Mesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Test Category</Label>
                  <Select value={testConfig.category} onValueChange={(value) => setTestConfig(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hvac">HVAC</SelectItem>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="landscaping">Landscaping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="planTier">Plan Tier</Label>
                  <Select value={testConfig.planTier} onValueChange={(value: any) => setTestConfig(prev => ({ ...prev, planTier: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="starter">Starter ($9)</SelectItem>
                      <SelectItem value="pro">Pro ($29)</SelectItem>
                      <SelectItem value="power">Power ($97)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleRunTests} 
                  disabled={isRunning}
                  className="flex items-center gap-2"
                >
                  {isRunning ? <Clock className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  {isRunning ? "Running Tests..." : "Run Comprehensive Tests"}
                </Button>

                {testResults && (
                  <Button 
                    variant="outline"
                    onClick={handleCleanup}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Cleanup Test Data
                  </Button>
                )}
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Tests will create temporary data and require OpenAI API access. 
                  Make sure your OPENAI_API_KEY environment variable is set.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test-results" className="space-y-4">
          {testResults ? (
            <div className="space-y-4">
              {/* Overall Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Test Results Summary
                    <Badge variant={testResults.summary.successRate >= 80 ? "default" : "destructive"}>
                      {testResults.summary.successRate}% Success Rate
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {testResults.testRun.status === "failed" ? 
                      `Test failed: ${testResults.testRun.error}` :
                      `Tested ${testResults.testRun.testBusiness?.name} in ${testResults.testRun.testBusiness?.city} (${testResults.testRun.testBusiness?.category})`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{testResults.summary.totalPassed}</div>
                      <div className="text-sm text-muted-foreground">Passed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{testResults.summary.totalFailed}</div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{testResults.summary.totalTests}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                  </div>

                  {testResults.recommendations.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Recommendations:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {testResults.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="text-sm text-muted-foreground">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Phase Results */}
              {testResults.phases.map((phase: any, phaseIndex: number) => (
                <Card key={phaseIndex}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {phase.phase}
                      <Badge variant={phase.summary.failed === 0 ? "default" : "destructive"}>
                        {phase.summary.passed}/{phase.summary.total}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {phase.tests.map((test: any, testIndex: number) => (
                        <div key={testIndex} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className={getStatusColor(test.passed)}>
                            {getStatusIcon(test.passed)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium">{test.name}</h5>
                              <Badge variant={test.passed ? "default" : "destructive"}>
                                {test.passed ? "PASS" : "FAIL"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Expected: {test.expected}
                            </p>
                            <p className="text-sm mt-1">
                              Actual: {test.actual}
                            </p>
                            {test.details && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {test.details}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-muted-foreground">No test results available</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Run tests from the "Run Tests" tab to see results here
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}