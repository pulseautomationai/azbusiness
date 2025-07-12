#!/usr/bin/env node

/**
 * Comprehensive Test Suite for AI Model Training System (Phase 5.3)
 * Tests all functions in convex/aiModelTraining.ts
 */

const { ConvexHttpClient } = require("convex/browser");
const { api } = require("./convex/_generated/api");

// Initialize Convex client
const client = new ConvexHttpClient(process.env.CONVEX_URL);

// Mock admin user for testing
const MOCK_ADMIN_TOKEN = "mock_admin_token_123";

// Test data for various scenarios
const TEST_DATA = {
  validTrainingData: {
    modelType: "business_summary",
    inputData: "Phoenix HVAC company, 20 years experience, emergency repairs, residential and commercial service, licensed and bonded",
    expectedOutput: "Trusted HVAC experts serving Phoenix for 20 years. Specializing in emergency repairs, residential and commercial HVAC services. Licensed, bonded, and committed to quality service.",
    actualOutput: "Phoenix HVAC specialists with 20 years experience. Emergency repairs available. Licensed and bonded for residential and commercial services.",
    qualityScore: 4.2,
    feedback: "Good quality output, matches expected tone and content",
    businessContext: {
      category: "HVAC Services",
      city: "Phoenix",
      planTier: "pro"
    }
  },
  invalidTrainingData: {
    modelType: "service_enhancement",
    inputData: "Bad input data with incomplete information",
    expectedOutput: "This is poorly structured expected output",
    qualityScore: 2.1,
    feedback: "Poor quality, needs improvement"
  },
  highQualityData: {
    modelType: "content_optimization",
    inputData: "Mesa plumbing company, 24/7 emergency service, licensed plumbers, drain cleaning, water heater repair, sewer line repair",
    expectedOutput: "Mesa's trusted plumbing experts available 24/7 for emergencies. Licensed plumbers specializing in drain cleaning, water heater repair, and sewer line services. Fast, reliable, and professional.",
    actualOutput: "Mesa's premier plumbing service with 24/7 emergency response. Licensed professionals handling drain cleaning, water heater repairs, and sewer line services with guaranteed satisfaction.",
    qualityScore: 4.8,
    feedback: "Excellent quality, professional tone, good keyword usage",
    businessContext: {
      category: "Plumbing Services",
      city: "Mesa",
      planTier: "power"
    }
  }
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to log test results
function logTest(testName, success, message, details = null) {
  const result = {
    name: testName,
    success,
    message,
    details,
    timestamp: new Date().toISOString()
  };
  
  testResults.tests.push(result);
  
  if (success) {
    testResults.passed++;
    console.log(`✅ ${testName}: ${message}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}: ${message}`);
    if (details) {
      console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
    }
  }
}

// Mock authentication (since we can't use real Clerk auth in tests)
function mockAdminAuth() {
  // In a real implementation, this would set up proper authentication
  // For testing purposes, we'll assume admin access
  return {
    hasAccess: true,
    permissions: ["system_settings", "business_management", "content_moderation"]
  };
}

// Test 1: Training Data Management Tests
async function testTrainingDataManagement() {
  console.log("\n🧪 Testing Training Data Management...");
  
  try {
    // Test 1.1: Add valid training data
    const addResult = await client.mutation(api.aiModelTraining.addTrainingData, TEST_DATA.validTrainingData);
    
    if (addResult.success && addResult.trainingDataId) {
      logTest(
        "Add Valid Training Data",
        true,
        "Successfully added training data with proper validation",
        { trainingDataId: addResult.trainingDataId }
      );
    } else {
      logTest(
        "Add Valid Training Data",
        false,
        "Failed to add training data",
        addResult
      );
    }
    
    // Test 1.2: Add invalid training data (should still work but with lower quality)
    const addInvalidResult = await client.mutation(api.aiModelTraining.addTrainingData, TEST_DATA.invalidTrainingData);
    
    if (addInvalidResult.success) {
      logTest(
        "Add Invalid Training Data",
        true,
        "Successfully added low-quality training data",
        { trainingDataId: addInvalidResult.trainingDataId }
      );
    } else {
      logTest(
        "Add Invalid Training Data",
        false,
        "Failed to add low-quality training data",
        addInvalidResult
      );
    }
    
    // Test 1.3: Add high-quality training data
    const addHighQualityResult = await client.mutation(api.aiModelTraining.addTrainingData, TEST_DATA.highQualityData);
    
    if (addHighQualityResult.success) {
      logTest(
        "Add High Quality Training Data",
        true,
        "Successfully added high-quality training data",
        { trainingDataId: addHighQualityResult.trainingDataId }
      );
    } else {
      logTest(
        "Add High Quality Training Data",
        false,
        "Failed to add high-quality training data",
        addHighQualityResult
      );
    }
    
    // Test 1.4: Retrieve training data for review
    const reviewData = await client.query(api.aiModelTraining.getTrainingDataForReview, {
      needsValidation: true,
      limit: 10
    });
    
    if (Array.isArray(reviewData) && reviewData.length > 0) {
      logTest(
        "Get Training Data for Review",
        true,
        `Retrieved ${reviewData.length} training data entries for review`,
        { count: reviewData.length }
      );
    } else {
      logTest(
        "Get Training Data for Review",
        false,
        "No training data found for review",
        reviewData
      );
    }
    
    // Test 1.5: Validate training data
    if (reviewData.length > 0) {
      const firstEntry = reviewData[0];
      const validationResult = await client.mutation(api.aiModelTraining.validateTrainingData, {
        trainingDataId: firstEntry._id,
        isValid: true,
        validationNotes: "Test validation - approved for training",
        adjustedQualityScore: firstEntry.qualityScore ? firstEntry.qualityScore + 0.2 : 4.0
      });
      
      if (validationResult.success) {
        logTest(
          "Validate Training Data",
          true,
          "Successfully validated training data",
          { trainingDataId: firstEntry._id }
        );
      } else {
        logTest(
          "Validate Training Data",
          false,
          "Failed to validate training data",
          validationResult
        );
      }
    }
    
  } catch (error) {
    logTest(
      "Training Data Management",
      false,
      "Error during training data management tests",
      { error: error.message }
    );
  }
}

// Test 2: Model Performance Tracking Tests
async function testModelPerformanceTracking() {
  console.log("\n📊 Testing Model Performance Tracking...");
  
  try {
    // Test 2.1: Get overall AI model performance
    const performanceData = await client.query(api.aiModelTraining.getAIModelPerformance, {
      timeRange: "30d"
    });
    
    if (performanceData && performanceData.overallMetrics) {
      logTest(
        "Get AI Model Performance (30d)",
        true,
        "Successfully retrieved AI model performance metrics",
        {
          totalGenerations: performanceData.overallMetrics.totalGenerations,
          activeModels: performanceData.overallMetrics.activeModels,
          avgQualityScore: performanceData.overallMetrics.avgQualityScore
        }
      );
    } else {
      logTest(
        "Get AI Model Performance (30d)",
        false,
        "Failed to retrieve AI model performance metrics",
        performanceData
      );
    }
    
    // Test 2.2: Get performance for specific model type
    const specificModelPerformance = await client.query(api.aiModelTraining.getAIModelPerformance, {
      modelType: "business_summary",
      timeRange: "7d"
    });
    
    if (specificModelPerformance && specificModelPerformance.modelPerformance) {
      logTest(
        "Get Specific Model Performance",
        true,
        "Successfully retrieved business_summary model performance",
        {
          modelCount: specificModelPerformance.modelPerformance.length,
          timeRange: specificModelPerformance.timeRange
        }
      );
    } else {
      logTest(
        "Get Specific Model Performance",
        false,
        "Failed to retrieve specific model performance",
        specificModelPerformance
      );
    }
    
    // Test 2.3: Test 90-day performance metrics
    const longTermPerformance = await client.query(api.aiModelTraining.getAIModelPerformance, {
      timeRange: "90d"
    });
    
    if (longTermPerformance && longTermPerformance.optimizationRecommendations) {
      logTest(
        "Get Long-term Performance (90d)",
        true,
        `Retrieved long-term performance with ${longTermPerformance.optimizationRecommendations.length} recommendations`,
        {
          recommendationCount: longTermPerformance.optimizationRecommendations.length,
          timeRange: longTermPerformance.timeRange
        }
      );
    } else {
      logTest(
        "Get Long-term Performance (90d)",
        false,
        "Failed to retrieve long-term performance metrics",
        longTermPerformance
      );
    }
    
  } catch (error) {
    logTest(
      "Model Performance Tracking",
      false,
      "Error during model performance tracking tests",
      { error: error.message }
    );
  }
}

// Test 3: Model Retraining Tests
async function testModelRetraining() {
  console.log("\n🔄 Testing Model Retraining...");
  
  try {
    // Test 3.1: Attempt retraining with insufficient data (should fail)
    try {
      const insufficientDataResult = await client.action(api.aiModelTraining.triggerModelRetraining, {
        modelType: "pricing_suggestions",
        useValidatedDataOnly: true
      });
      
      logTest(
        "Retraining with Insufficient Data",
        false,
        "Should have failed due to insufficient training data",
        insufficientDataResult
      );
    } catch (error) {
      if (error.message.includes("Insufficient training data")) {
        logTest(
          "Retraining with Insufficient Data",
          true,
          "Correctly rejected retraining due to insufficient data",
          { error: error.message }
        );
      } else {
        logTest(
          "Retraining with Insufficient Data",
          false,
          "Failed for unexpected reason",
          { error: error.message }
        );
      }
    }
    
    // Test 3.2: Get retraining history
    const retrainingHistory = await client.query(api.aiModelTraining.getModelRetrainingHistory, {
      limit: 5
    });
    
    if (Array.isArray(retrainingHistory)) {
      logTest(
        "Get Retraining History",
        true,
        `Retrieved ${retrainingHistory.length} retraining history entries`,
        { count: retrainingHistory.length }
      );
    } else {
      logTest(
        "Get Retraining History",
        false,
        "Failed to retrieve retraining history",
        retrainingHistory
      );
    }
    
    // Test 3.3: Get retraining history for specific model
    const specificModelHistory = await client.query(api.aiModelTraining.getModelRetrainingHistory, {
      modelType: "business_summary",
      limit: 3
    });
    
    if (Array.isArray(specificModelHistory)) {
      logTest(
        "Get Specific Model Retraining History",
        true,
        `Retrieved ${specificModelHistory.length} retraining entries for business_summary`,
        { count: specificModelHistory.length }
      );
    } else {
      logTest(
        "Get Specific Model Retraining History",
        false,
        "Failed to retrieve specific model retraining history",
        specificModelHistory
      );
    }
    
  } catch (error) {
    logTest(
      "Model Retraining",
      false,
      "Error during model retraining tests",
      { error: error.message }
    );
  }
}

// Test 4: Content Quality Insights Tests
async function testContentQualityInsights() {
  console.log("\n💎 Testing Content Quality Insights...");
  
  try {
    // Test 4.1: Get content quality insights (30d)
    const qualityInsights = await client.query(api.aiModelTraining.getContentQualityInsights, {
      timeRange: "30d"
    });
    
    if (qualityInsights && qualityInsights.qualityTrends) {
      logTest(
        "Get Content Quality Insights (30d)",
        true,
        "Successfully retrieved content quality insights",
        {
          avgQualityScore: qualityInsights.avgQualityScore,
          totalTrainingData: qualityInsights.totalTrainingData,
          trendsCount: qualityInsights.qualityTrends.length
        }
      );
    } else {
      logTest(
        "Get Content Quality Insights (30d)",
        false,
        "Failed to retrieve content quality insights",
        qualityInsights
      );
    }
    
    // Test 4.2: Get quality insights for different time ranges
    const shortTermInsights = await client.query(api.aiModelTraining.getContentQualityInsights, {
      timeRange: "7d"
    });
    
    if (shortTermInsights && shortTermInsights.qualityRecommendations) {
      logTest(
        "Get Short-term Quality Insights (7d)",
        true,
        `Retrieved 7-day insights with ${shortTermInsights.qualityRecommendations.length} recommendations`,
        {
          recommendationCount: shortTermInsights.qualityRecommendations.length,
          timeRange: shortTermInsights.timeRange
        }
      );
    } else {
      logTest(
        "Get Short-term Quality Insights (7d)",
        false,
        "Failed to retrieve short-term quality insights",
        shortTermInsights
      );
    }
    
    // Test 4.3: Get long-term quality insights
    const longTermInsights = await client.query(api.aiModelTraining.getContentQualityInsights, {
      timeRange: "90d"
    });
    
    if (longTermInsights && longTermInsights.contentPerformance) {
      logTest(
        "Get Long-term Quality Insights (90d)",
        true,
        "Successfully retrieved long-term quality insights",
        {
          avgQualityScore: longTermInsights.avgQualityScore,
          totalTrainingData: longTermInsights.totalTrainingData,
          categoryCount: Object.keys(longTermInsights.contentPerformance.byCategory || {}).length
        }
      );
    } else {
      logTest(
        "Get Long-term Quality Insights (90d)",
        false,
        "Failed to retrieve long-term quality insights",
        longTermInsights
      );
    }
    
  } catch (error) {
    logTest(
      "Content Quality Insights",
      false,
      "Error during content quality insights tests",
      { error: error.message }
    );
  }
}

// Test 5: Permission and Access Control Tests
async function testPermissionAndAccessControl() {
  console.log("\n🔐 Testing Permission and Access Control...");
  
  try {
    // Test 5.1: Test admin access check
    const adminAccess = await client.query(api.admin.checkAdminAccess, {});
    
    if (adminAccess && typeof adminAccess.hasAccess === 'boolean') {
      logTest(
        "Check Admin Access",
        true,
        `Admin access check returned: ${adminAccess.hasAccess}`,
        {
          hasAccess: adminAccess.hasAccess,
          permissions: adminAccess.permissions || []
        }
      );
    } else {
      logTest(
        "Check Admin Access",
        false,
        "Admin access check failed",
        adminAccess
      );
    }
    
    // Test 5.2: Test specific permission check
    const systemSettingsPermission = await client.query(api.admin.hasPermission, {
      permission: "system_settings"
    });
    
    if (typeof systemSettingsPermission === 'boolean') {
      logTest(
        "Check System Settings Permission",
        true,
        `System settings permission: ${systemSettingsPermission}`,
        { hasPermission: systemSettingsPermission }
      );
    } else {
      logTest(
        "Check System Settings Permission",
        false,
        "System settings permission check failed",
        systemSettingsPermission
      );
    }
    
    // Test 5.3: Test business management permission
    const businessManagementPermission = await client.query(api.admin.hasPermission, {
      permission: "business_management"
    });
    
    if (typeof businessManagementPermission === 'boolean') {
      logTest(
        "Check Business Management Permission",
        true,
        `Business management permission: ${businessManagementPermission}`,
        { hasPermission: businessManagementPermission }
      );
    } else {
      logTest(
        "Check Business Management Permission",
        false,
        "Business management permission check failed",
        businessManagementPermission
      );
    }
    
  } catch (error) {
    logTest(
      "Permission and Access Control",
      false,
      "Error during permission and access control tests",
      { error: error.message }
    );
  }
}

// Test 6: Error Handling and Edge Cases
async function testErrorHandlingAndEdgeCases() {
  console.log("\n⚠️ Testing Error Handling and Edge Cases...");
  
  try {
    // Test 6.1: Test with invalid model type
    try {
      await client.mutation(api.aiModelTraining.addTrainingData, {
        ...TEST_DATA.validTrainingData,
        modelType: "invalid_model_type"
      });
      
      logTest(
        "Invalid Model Type",
        false,
        "Should have failed with invalid model type",
        null
      );
    } catch (error) {
      logTest(
        "Invalid Model Type",
        true,
        "Correctly rejected invalid model type",
        { error: error.message }
      );
    }
    
    // Test 6.2: Test with missing required fields
    try {
      await client.mutation(api.aiModelTraining.addTrainingData, {
        modelType: "business_summary",
        inputData: "Test input"
        // Missing expectedOutput
      });
      
      logTest(
        "Missing Required Fields",
        false,
        "Should have failed with missing required fields",
        null
      );
    } catch (error) {
      logTest(
        "Missing Required Fields",
        true,
        "Correctly rejected missing required fields",
        { error: error.message }
      );
    }
    
    // Test 6.3: Test with invalid quality score
    try {
      await client.mutation(api.aiModelTraining.addTrainingData, {
        ...TEST_DATA.validTrainingData,
        qualityScore: 6.5 // Invalid score (should be 1-5)
      });
      
      logTest(
        "Invalid Quality Score",
        false,
        "Should have failed with invalid quality score",
        null
      );
    } catch (error) {
      logTest(
        "Invalid Quality Score",
        true,
        "Correctly rejected invalid quality score",
        { error: error.message }
      );
    }
    
    // Test 6.4: Test querying non-existent training data
    try {
      const nonExistentData = await client.query(api.aiModelTraining.getTrainingDataForReview, {
        modelType: "nonexistent_model",
        limit: 10
      });
      
      if (Array.isArray(nonExistentData) && nonExistentData.length === 0) {
        logTest(
          "Non-existent Model Type Query",
          true,
          "Correctly returned empty array for non-existent model",
          { count: nonExistentData.length }
        );
      } else {
        logTest(
          "Non-existent Model Type Query",
          false,
          "Unexpected result for non-existent model query",
          nonExistentData
        );
      }
    } catch (error) {
      logTest(
        "Non-existent Model Type Query",
        false,
        "Error querying non-existent model type",
        { error: error.message }
      );
    }
    
  } catch (error) {
    logTest(
      "Error Handling and Edge Cases",
      false,
      "Error during error handling tests",
      { error: error.message }
    );
  }
}

// Main test runner
async function runAllTests() {
  console.log("🚀 Starting Comprehensive AI Model Training System Tests");
  console.log("=" .repeat(60));
  
  const startTime = Date.now();
  
  // Run all test suites
  await testTrainingDataManagement();
  await testModelPerformanceTracking();
  await testModelRetraining();
  await testContentQualityInsights();
  await testPermissionAndAccessControl();
  await testErrorHandlingAndEdgeCases();
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Generate test report
  console.log("\n" + "=" .repeat(60));
  console.log("📋 TEST REPORT SUMMARY");
  console.log("=" .repeat(60));
  
  console.log(`Total Tests: ${testResults.tests.length}`);
  console.log(`Passed: ${testResults.passed} ✅`);
  console.log(`Failed: ${testResults.failed} ❌`);
  console.log(`Success Rate: ${((testResults.passed / testResults.tests.length) * 100).toFixed(1)}%`);
  console.log(`Duration: ${duration}ms`);
  
  if (testResults.failed > 0) {
    console.log("\n🔍 FAILED TESTS:");
    testResults.tests
      .filter(test => !test.success)
      .forEach(test => {
        console.log(`  - ${test.name}: ${test.message}`);
      });
  }
  
  console.log("\n📊 DETAILED TEST RESULTS:");
  console.log("=" .repeat(60));
  
  const testsByCategory = testResults.tests.reduce((acc, test) => {
    const category = test.name.split(' ')[0];
    if (!acc[category]) acc[category] = [];
    acc[category].push(test);
    return acc;
  }, {});
  
  Object.entries(testsByCategory).forEach(([category, tests]) => {
    const passed = tests.filter(t => t.success).length;
    const total = tests.length;
    console.log(`${category}: ${passed}/${total} tests passed`);
  });
  
  // Save detailed results to file
  const reportData = {
    summary: {
      totalTests: testResults.tests.length,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: ((testResults.passed / testResults.tests.length) * 100).toFixed(1),
      duration: duration,
      timestamp: new Date().toISOString()
    },
    tests: testResults.tests,
    testsByCategory
  };
  
  const fs = require('fs');
  fs.writeFileSync(
    './ai_model_training_test_report.json',
    JSON.stringify(reportData, null, 2)
  );
  
  console.log("\n💾 Detailed test report saved to: ai_model_training_test_report.json");
  
  // Return overall success
  return testResults.failed === 0;
}

// Run tests if called directly
if (require.main === module) {
  runAllTests()
    .then(success => {
      if (success) {
        console.log("\n🎉 All tests passed!");
        process.exit(0);
      } else {
        console.log("\n💥 Some tests failed!");
        process.exit(1);
      }
    })
    .catch(error => {
      console.error("\n💥 Test runner failed:", error);
      process.exit(1);
    });
}

module.exports = { runAllTests, testResults };