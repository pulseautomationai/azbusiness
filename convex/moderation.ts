import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

// Claim request submission
export const submitClaimRequest = mutation({
  args: {
    businessId: v.id("businesses"),
    verificationMethod: v.union(
      v.literal("phone"),
      v.literal("email"), 
      v.literal("documents"),
      v.literal("manual")
    ),
    userRole: v.union(
      v.literal("owner"),
      v.literal("manager"), 
      v.literal("representative")
    ),
    contactInfo: v.object({
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
      preferredContact: v.union(v.literal("phone"), v.literal("email"))
    }),
    businessHours: v.optional(v.object({
      timezone: v.string(),
      availableHours: v.string(),
      bestTimeToCall: v.string()
    })),
    verificationData: v.optional(v.object({
      phoneVerificationCode: v.optional(v.string()),
      emailVerificationToken: v.optional(v.string()),
      documentsUploaded: v.optional(v.array(v.string())),
      additionalNotes: v.optional(v.string())
    })),
    agreesToTerms: v.boolean(),
    fraudCheckData: v.optional(v.object({
      ipAddress: v.string(),
      userAgent: v.string(),
      submissionTime: v.number()
    }))
  },
  handler: async (ctx, args) => {
    // Get current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required to submit claim");
    }

    // Get user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify business exists
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    // Check if business is already claimed
    if (business.claimed && business.ownerId) {
      throw new Error("Business is already claimed by another user");
    }

    // Check if user already has a pending claim for this business
    const existingClaim = await ctx.db
      .query("businessModerationQueue")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .filter((q) => 
        q.and(
          q.eq(q.field("submittedBy"), user._id),
          q.or(
            q.eq(q.field("status"), "pending"),
            q.eq(q.field("status"), "in_review"),
            q.eq(q.field("status"), "info_requested")
          )
        )
      )
      .first();

    if (existingClaim) {
      throw new Error("You already have a pending claim for this business");
    }

    // Validate required fields based on verification method
    if (args.verificationMethod === "phone" && !args.contactInfo.phone) {
      throw new Error("Phone number required for phone verification");
    }

    if (args.verificationMethod === "email" && !args.contactInfo.email) {
      throw new Error("Email address required for email verification");
    }

    if (!args.agreesToTerms) {
      throw new Error("Must agree to terms and conditions");
    }

    // Determine initial status based on verification method
    let initialStatus: "pending" | "verified" | "needs_review" = "pending";
    let priority: "low" | "medium" | "high" | "urgent" = "medium";

    // Auto-verification conditions (for future implementation)
    if (args.verificationMethod === "phone" || args.verificationMethod === "email") {
      // These could be auto-verified if verification codes match
      initialStatus = "pending";
      priority = "low";
    } else if (args.verificationMethod === "documents") {
      initialStatus = "needs_review";
      priority = "high";
    } else {
      initialStatus = "needs_review";
      priority = "medium";
    }

    // Create claim request in moderation queue
    const claimId = await ctx.db.insert("businessModerationQueue", {
      businessId: args.businessId,
      type: "claim_request",
      status: initialStatus,
      priority,
      submittedBy: user._id,
      submittedAt: Date.now(),
      claimData: {
        verificationMethod: args.verificationMethod,
        userRole: args.userRole,
        contactInfo: args.contactInfo,
        businessHours: args.businessHours,
        verificationData: args.verificationData,
        agreesToTerms: args.agreesToTerms,
        fraudCheckData: args.fraudCheckData
      },
      flags: [], // Start with no flags
      adminNotes: [],
      assignedToAdmin: undefined,
      reviewedAt: undefined,
      reviewedBy: undefined
    });

    // Log the claim submission for analytics
    await ctx.db.insert("analyticsEvents", {
      businessId: args.businessId,
      eventType: "claim_submitted",
      timestamp: Date.now(),
      deviceType: "web", // Could be passed from frontend
      metadata: {
        claimId,
        verificationMethod: args.verificationMethod,
        userRole: args.userRole
      }
    });

    // TODO: Send notification emails
    // - Confirmation email to user
    // - Alert email to admin (for high priority claims)

    return {
      success: true,
      claimId,
      status: initialStatus,
      message: "Claim request submitted successfully. You will receive updates via email."
    };
  }
});

// Get claim status for a user
export const getClaimStatus = query({
  args: {
    businessId: v.id("businesses"),
    userId: v.optional(v.id("users"))
  },
  handler: async (ctx, args) => {
    // Get current user if not provided
    let userId = args.userId;
    if (!userId) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return null;
      }

      const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
        .unique();

      if (!user) {
        return null;
      }
      userId = user._id;
    }

    // Get most recent claim for this business by this user
    const claim = await ctx.db
      .query("businessModerationQueue")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .filter((q) => q.eq(q.field("submittedBy"), userId))
      .order("desc")
      .first();

    if (!claim) {
      return null;
    }

    // Get business info
    const business = await ctx.db.get(args.businessId);

    return {
      claimId: claim._id,
      businessId: args.businessId,
      businessName: business?.name,
      status: claim.status,
      submittedAt: claim.submittedAt,
      reviewedAt: claim.reviewedAt,
      verificationMethod: claim.claimData?.verificationMethod,
      userRole: claim.claimData?.userRole,
      adminNotes: claim.adminNotes,
      nextSteps: getNextStepsForStatus(claim.status)
    };
  }
});

// Get pending claims for admin review
export const getPendingClaims = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    assignedToAdmin: v.optional(v.id("users"))
  },
  handler: async (ctx, args) => {
    // Check admin permissions
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }

    // Build query
    let query = ctx.db.query("businessModerationQueue");

    // Filter by type (only claim requests)
    query = query.filter((q) => q.eq(q.field("type"), "claim_request"));

    // Apply filters
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    if (args.priority) {
      query = query.filter((q) => q.eq(q.field("priority"), args.priority));
    }

    if (args.assignedToAdmin) {
      query = query.filter((q) => q.eq(q.field("assignedToAdmin"), args.assignedToAdmin));
    }

    // Get results with limit
    const claims = await query
      .order("desc")
      .take(args.limit || 50);

    // Enrich with business and user data
    const enrichedClaims = await Promise.all(
      claims.map(async (claim) => {
        const business = await ctx.db.get(claim.businessId);
        const submitter = await ctx.db.get(claim.submittedBy);
        const assignedAdmin = claim.assignedToAdmin 
          ? await ctx.db.get(claim.assignedToAdmin)
          : null;

        return {
          ...claim,
          business: business ? {
            name: business.name,
            city: business.city,
            planTier: business.planTier,
            reviewCount: business.reviewCount,
            rating: business.rating
          } : null,
          submitter: submitter ? {
            name: submitter.name,
            email: submitter.email
          } : null,
          assignedAdmin: assignedAdmin ? {
            name: assignedAdmin.name,
            email: assignedAdmin.email
          } : null
        };
      })
    );

    return enrichedClaims;
  }
});

// Process claim request (approve/reject/request more info)
export const processClaimRequest = mutation({
  args: {
    claimId: v.id("businessModerationQueue"),
    action: v.union(
      v.literal("approve"),
      v.literal("reject"),
      v.literal("request_info"),
      v.literal("assign")
    ),
    adminNotes: v.string(),
    requestedInfo: v.optional(v.array(v.string())),
    assignToAdmin: v.optional(v.id("users"))
  },
  handler: async (ctx, args) => {
    // Check admin permissions
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const admin = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!admin || admin.role !== "admin") {
      throw new Error("Admin access required");
    }

    // Get claim
    const claim = await ctx.db.get(args.claimId);
    if (!claim) {
      throw new Error("Claim not found");
    }

    // Get business
    const business = await ctx.db.get(claim.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    const now = Date.now();

    // Process based on action
    switch (args.action) {
      case "approve":
        // Approve the claim
        await ctx.db.patch(args.claimId, {
          status: "approved",
          reviewedAt: now,
          reviewedBy: admin._id,
          adminNotes: [...claim.adminNotes, {
            admin: admin.name || admin.email || "Admin",
            note: args.adminNotes,
            timestamp: now,
            action: "approved"
          }]
        });

        // Update business to mark as claimed
        await ctx.db.patch(claim.businessId, {
          claimed: true,
          ownerId: claim.submittedBy,
          claimedAt: now,
          verified: true, // Claiming includes verification
          // Keep existing plan tier or upgrade to pro
          planTier: business.planTier === "free" ? "free" : business.planTier
        });

        // Log approval event
        await ctx.db.insert("analyticsEvents", {
          businessId: claim.businessId,
          eventType: "claim_approved",
          timestamp: now,
          deviceType: "admin",
          metadata: {
            claimId: args.claimId,
            adminId: admin._id,
            verificationMethod: claim.claimData?.verificationMethod
          }
        });

        // Send approval email to user (after transaction completes)
        const submitter = await ctx.db.get(claim.submittedBy);
        if (submitter?.email) {
          try {
            await ctx.scheduler.runAfter(0, api.emails.sendClaimApprovedEmail, {
              to: submitter.email,
              businessName: business.name,
              claimantName: submitter.name || submitter.email
            });
          } catch (emailError) {
            console.error("Failed to schedule approval email:", emailError);
            // Don't fail the claim approval if email scheduling fails
          }
        }
        break;

      case "reject":
        // Reject the claim
        await ctx.db.patch(args.claimId, {
          status: "rejected",
          reviewedAt: now,
          reviewedBy: admin._id,
          adminNotes: [...claim.adminNotes, {
            admin: admin.name || admin.email || "Admin",
            note: args.adminNotes,
            timestamp: now,
            action: "rejected"
          }]
        });

        // Log rejection event
        await ctx.db.insert("analyticsEvents", {
          businessId: claim.businessId,
          eventType: "claim_rejected",
          timestamp: now,
          deviceType: "admin",
          metadata: {
            claimId: args.claimId,
            adminId: admin._id,
            reason: args.adminNotes
          }
        });

        // Send rejection email to user with reason (after transaction completes)
        const rejectedSubmitter = await ctx.db.get(claim.submittedBy);
        if (rejectedSubmitter?.email) {
          try {
            await ctx.scheduler.runAfter(0, api.emails.sendClaimRejectedEmail, {
              to: rejectedSubmitter.email,
              businessName: business.name,
              claimantName: rejectedSubmitter.name || rejectedSubmitter.email,
              reason: args.adminNotes
            });
          } catch (emailError) {
            console.error("Failed to schedule rejection email:", emailError);
            // Don't fail the claim rejection if email scheduling fails
          }
        }
        break;

      case "request_info":
        // Request additional information
        await ctx.db.patch(args.claimId, {
          status: "info_requested",
          reviewedAt: now,
          reviewedBy: admin._id,
          adminNotes: [...claim.adminNotes, {
            admin: admin.name || admin.email || "Admin",
            note: args.adminNotes,
            timestamp: now,
            action: "info_requested",
            requestedInfo: args.requestedInfo
          }]
        });

        // Send info request email to user (after transaction completes)
        const infoRequestSubmitter = await ctx.db.get(claim.submittedBy);
        if (infoRequestSubmitter?.email) {
          try {
            await ctx.scheduler.runAfter(0, api.emails.sendClaimInfoRequestedEmail, {
              to: infoRequestSubmitter.email,
              businessName: business.name,
              claimantName: infoRequestSubmitter.name || infoRequestSubmitter.email,
              infoRequested: args.adminNotes
            });
          } catch (emailError) {
            console.error("Failed to schedule info request email:", emailError);
            // Don't fail the claim update if email scheduling fails
          }
        }
        break;

      case "assign":
        // Assign to another admin
        if (!args.assignToAdmin) {
          throw new Error("Admin ID required for assignment");
        }

        await ctx.db.patch(args.claimId, {
          assignedToAdmin: args.assignToAdmin,
          adminNotes: [...claim.adminNotes, {
            admin: admin.name || admin.email || "Admin",
            note: args.adminNotes,
            timestamp: now,
            action: "assigned"
          }]
        });

        // TODO: Send assignment notification to assigned admin
        break;
    }

    return {
      success: true,
      action: args.action,
      message: `Claim ${args.action} successfully processed`
    };
  }
});

// Search for existing businesses to prevent duplicates
export const searchExistingBusinesses = query({
  args: {
    name: v.string(),
    city: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Search by name and city (most common search)
    let results = await ctx.db
      .query("businesses")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .collect();

    // Filter by city if provided
    if (args.city) {
      results = results.filter(business => 
        business.city.toLowerCase() === args.city?.toLowerCase()
      );
    }

    // Also search by phone if provided
    if (args.phone && results.length === 0) {
      const phoneResults = await ctx.db
        .query("businesses")
        .filter((q) => q.eq(q.field("phone"), args.phone))
        .collect();
      
      results = [...results, ...phoneResults];
    }

    // Remove duplicates and format results
    const uniqueResults = results.reduce((acc, business) => {
      if (!acc.find(b => b._id === business._id)) {
        acc.push({
          _id: business._id,
          name: business.name,
          address: business.address,
          city: business.city,
          phone: business.phone,
          claimed: business.claimed,
          planTier: business.planTier,
          slug: business.slug,
          similarity: calculateSimilarity(args, business)
        });
      }
      return acc;
    }, [] as any[]);

    // Sort by similarity score (highest first)
    return uniqueResults
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10); // Return top 10 matches
  }
});

// Helper function to calculate business similarity
function calculateSimilarity(search: any, business: any): number {
  let score = 0;
  
  // Name match (most important)
  if (search.name.toLowerCase() === business.name.toLowerCase()) {
    score += 50;
  } else if (business.name.toLowerCase().includes(search.name.toLowerCase())) {
    score += 30;
  }
  
  // City match
  if (search.city && business.city.toLowerCase() === search.city.toLowerCase()) {
    score += 25;
  }
  
  // Phone match
  if (search.phone && business.phone === search.phone) {
    score += 25;
  }
  
  // Address similarity (basic)
  if (search.address && business.address.toLowerCase().includes(search.address.toLowerCase())) {
    score += 15;
  }
  
  return score;
}

// Helper function to get next steps based on status
function getNextStepsForStatus(status: string): string[] {
  switch (status) {
    case "pending":
      return [
        "Your claim is being reviewed",
        "You'll receive an email update within 24-48 hours",
        "Check your spam folder for updates"
      ];
    case "in_review":
      return [
        "An admin is currently reviewing your claim",
        "Additional verification may be required",
        "Response time: 24-48 hours"
      ];
    case "info_requested":
      return [
        "Additional information is required",
        "Check your email for specific requirements",
        "Submit requested information to continue"
      ];
    case "approved":
      return [
        "Congratulations! Your claim has been approved",
        "You can now manage your business listing",
        "Consider upgrading to Pro for additional features"
      ];
    case "rejected":
      return [
        "Your claim was not approved",
        "Check your email for the reason",
        "You may resubmit with additional verification"
      ];
    default:
      return ["Status unknown. Please contact support."];
  }
}

// Get claim analytics for admin dashboard
export const getClaimAnalytics = query({
  args: {
    timeRange: v.optional(v.union(v.literal("7d"), v.literal("30d"), v.literal("90d")))
  },
  handler: async (ctx, args) => {
    // Check admin permissions
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }

    const timeRange = args.timeRange || "30d";
    const daysBack = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const cutoffTime = Date.now() - (daysBack * 24 * 60 * 60 * 1000);

    // Get all claims in time range
    const claims = await ctx.db
      .query("businessModerationQueue")
      .filter((q) => 
        q.and(
          q.eq(q.field("type"), "claim_request"),
          q.gte(q.field("submittedAt"), cutoffTime)
        )
      )
      .collect();

    // Calculate metrics
    const totalClaims = claims.length;
    const approvedClaims = claims.filter(c => c.status === "approved").length;
    const rejectedClaims = claims.filter(c => c.status === "rejected").length;
    const pendingClaims = claims.filter(c => 
      ["pending", "in_review", "info_requested"].includes(c.status)
    ).length;

    const approvalRate = totalClaims > 0 ? (approvedClaims / totalClaims) * 100 : 0;
    const avgProcessingTime = calculateAverageProcessingTime(claims);

    // Verification method breakdown
    const verificationMethods = claims.reduce((acc, claim) => {
      const method = claim.claimData?.verificationMethod || "unknown";
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalClaims,
      approvedClaims,
      rejectedClaims,
      pendingClaims,
      approvalRate: Math.round(approvalRate),
      avgProcessingTime: Math.round(avgProcessingTime),
      verificationMethods,
      timeRange
    };
  }
});

// Get user's claims for dashboard
export const getUserClaims = query({
  handler: async (ctx) => {
    // Get current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    // Get all claims by this user
    const claims = await ctx.db
      .query("businessModerationQueue")
      .filter((q) => q.eq(q.field("submittedBy"), user._id))
      .order("desc")
      .collect();

    // Enrich with business data and format for display
    const enrichedClaims = await Promise.all(
      claims.map(async (claim) => {
        const business = await ctx.db.get(claim.businessId);
        
        return {
          _id: claim._id,
          businessId: claim.businessId,
          businessName: business?.name || "Unknown Business",
          status: claim.status,
          submittedAt: claim.submittedAt,
          reviewedAt: claim.reviewedAt,
          verificationMethod: claim.claimData?.verificationMethod,
          userRole: claim.claimData?.userRole,
          adminNotes: claim.adminNotes || [],
          nextSteps: getNextStepsForStatus(claim.status)
        };
      })
    );

    return enrichedClaims;
  }
});

// Helper function to calculate average processing time
function calculateAverageProcessingTime(claims: any[]): number {
  const processedClaims = claims.filter(c => 
    (c.status === "approved" || c.status === "rejected") && c.reviewedAt
  );

  if (processedClaims.length === 0) return 0;

  const totalTime = processedClaims.reduce((sum, claim) => {
    return sum + (claim.reviewedAt - claim.submittedAt);
  }, 0);

  return totalTime / processedClaims.length / (1000 * 60 * 60); // Convert to hours
}

// Get claim details for document upload page
export const getClaimDetails = query({
  args: {
    claimId: v.id("businessModerationQueue")
  },
  handler: async (ctx, args) => {
    // Get current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    // Get claim
    const claim = await ctx.db.get(args.claimId);
    if (!claim || claim.submittedBy !== user._id) {
      return null; // User doesn't own this claim
    }

    // Get business details
    const business = await ctx.db.get(claim.businessId);
    
    // Get latest admin note that requested info
    const latestInfoRequest = claim.adminNotes?.find(note => note.action === "info_requested");

    return {
      _id: claim._id,
      businessId: claim.businessId,
      businessName: business?.name || "Unknown Business",
      status: claim.status,
      latestAdminNote: latestInfoRequest?.note,
      submittedAt: claim.submittedAt
    };
  }
});

// Submit additional documents (placeholder implementation)
export const submitAdditionalDocuments = mutation({
  args: {
    claimId: v.id("businessModerationQueue"),
    documents: v.array(v.object({
      name: v.string(),
      size: v.number(),
      type: v.string()
      // storageId: v.string() // Would be added when file storage is implemented
    })),
    notes: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Get current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get claim
    const claim = await ctx.db.get(args.claimId);
    if (!claim || claim.submittedBy !== user._id) {
      throw new Error("Claim not found or access denied");
    }

    // Update claim with document info and change status back to pending
    const now = Date.now();
    await ctx.db.patch(args.claimId, {
      status: "pending", // Reset to pending for review
      adminNotes: [...(claim.adminNotes || []), {
        admin: user.name || user.email || "User",
        note: args.notes || `Submitted ${args.documents.length} additional document(s): ${args.documents.map(d => d.name).join(', ')}`,
        timestamp: now,
        action: "documents_submitted"
      }]
    });

    // Log analytics event
    await ctx.db.insert("analyticsEvents", {
      businessId: claim.businessId,
      eventType: "documents_submitted",
      timestamp: now,
      deviceType: "web",
      metadata: {
        claimId: args.claimId,
        documentCount: args.documents.length,
        userId: user._id
      }
    });

    return {
      success: true,
      message: "Documents submitted successfully"
    };
  }
});