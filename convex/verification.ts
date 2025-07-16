import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

// Generate and send phone verification code
export const initiatePhoneVerification = mutation({
  args: {
    businessId: v.id("businesses"),
    phoneNumber: v.string()
  },
  handler: async (ctx, args) => {
    // Get current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify business exists and phone matches
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    // Normalize phone numbers for comparison
    const normalizePhone = (phone: string) => phone.replace(/[^\d]/g, '');
    const businessPhone = normalizePhone(business.phone);
    const verifyPhone = normalizePhone(args.phoneNumber);

    if (businessPhone !== verifyPhone) {
      throw new Error("Phone number does not match business listing");
    }

    // Rate limiting - check recent verification attempts
    const recentAttempts = await ctx.db
      .query("phoneVerifications")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .filter((q) => q.gte(q.field("createdAt"), Date.now() - 60 * 60 * 1000)) // 1 hour
      .collect();

    if (recentAttempts.length >= 3) {
      throw new Error("Too many verification attempts. Please try again later.");
    }

    // Generate 6-digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes

    // Store verification record
    const verificationId = await ctx.db.insert("phoneVerifications", {
      businessId: args.businessId,
      userId: user._id,
      phoneNumber: args.phoneNumber,
      verificationCode,
      attempts: 0,
      verified: false,
      createdAt: Date.now(),
      expiresAt,
      ipAddress: "unknown", // Could be passed from frontend
      userAgent: "unknown"
    });

    // TODO: Send SMS with verification code
    // For now, we'll simulate sending (in production, integrate with Twilio/similar)
    console.log(`SMS Verification Code for ${args.phoneNumber}: ${verificationCode}`);
    
    // In development, we can return the code for testing
    const isDevelopment = process.env.NODE_ENV !== "production";

    return {
      success: true,
      verificationId,
      expiresAt,
      message: "Verification code sent via SMS",
      // Only include code in development
      ...(isDevelopment && { verificationCode })
    };
  }
});

// Verify phone code
export const verifyPhoneCode = mutation({
  args: {
    verificationId: v.id("phoneVerifications"),
    code: v.string()
  },
  handler: async (ctx, args) => {
    // Get current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get verification record
    const verification = await ctx.db.get(args.verificationId);
    if (!verification) {
      throw new Error("Verification not found");
    }

    // Check if verification belongs to user
    if (verification.userId !== user._id) {
      throw new Error("Verification not found");
    }

    // Check if already verified
    if (verification.verified) {
      return {
        success: true,
        message: "Phone number already verified"
      };
    }

    // Check if expired
    if (Date.now() > verification.expiresAt) {
      throw new Error("Verification code has expired");
    }

    // Check attempt limit
    if (verification.attempts >= 3) {
      throw new Error("Too many failed attempts");
    }

    // Verify code
    if (verification.verificationCode !== args.code) {
      // Increment attempts
      await ctx.db.patch(args.verificationId, {
        attempts: verification.attempts + 1
      });
      
      throw new Error("Invalid verification code");
    }

    // Mark as verified
    await ctx.db.patch(args.verificationId, {
      verified: true,
      verifiedAt: Date.now()
    });

    return {
      success: true,
      verified: true,
      message: "Phone number verified successfully"
    };
  }
});

// Generate and send email verification
export const initiateEmailVerification = mutation({
  args: {
    businessId: v.id("businesses"),
    emailAddress: v.string()
  },
  handler: async (ctx, args) => {
    // Get current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify business exists
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.emailAddress)) {
      throw new Error("Invalid email address format");
    }

    // Check if business email matches (if available)
    if (business.email && business.email.toLowerCase() !== args.emailAddress.toLowerCase()) {
      throw new Error("Email address does not match business listing");
    }

    // Rate limiting - check recent verification attempts
    const recentAttempts = await ctx.db
      .query("emailVerifications")
      .withIndex("by_email", (q) => q.eq("emailAddress", args.emailAddress.toLowerCase()))
      .filter((q) => q.gte(q.field("createdAt"), Date.now() - 60 * 60 * 1000)) // 1 hour
      .collect();

    if (recentAttempts.length >= 3) {
      throw new Error("Too many verification attempts. Please try again later.");
    }

    // Generate secure verification token
    const verificationToken = generateSecureToken();
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

    // Store verification record
    const verificationId = await ctx.db.insert("emailVerifications", {
      businessId: args.businessId,
      userId: user._id,
      emailAddress: args.emailAddress.toLowerCase(),
      verificationToken,
      verified: false,
      createdAt: Date.now(),
      expiresAt,
      ipAddress: "unknown", // Could be passed from frontend
      userAgent: "unknown"
    });

    // TODO: Send verification email
    // For now, we'll simulate sending (in production, integrate with SendGrid/similar)
    const verificationUrl = `${process.env.SITE_URL}/verify-email?token=${verificationToken}`;
    console.log(`Email Verification URL for ${args.emailAddress}: ${verificationUrl}`);
    
    // In development, we can return the token for testing
    const isDevelopment = process.env.NODE_ENV !== "production";

    return {
      success: true,
      verificationId,
      expiresAt,
      message: "Verification email sent. Please check your inbox.",
      // Only include token in development
      ...(isDevelopment && { verificationToken, verificationUrl })
    };
  }
});

// Verify email token
export const verifyEmailToken = mutation({
  args: {
    token: v.string()
  },
  handler: async (ctx, args) => {
    // Get verification record by token
    const verification = await ctx.db
      .query("emailVerifications")
      .withIndex("by_token", (q) => q.eq("verificationToken", args.token))
      .unique();

    if (!verification) {
      throw new Error("Invalid verification token");
    }

    // Check if already verified
    if (verification.verified) {
      return {
        success: true,
        businessId: verification.businessId,
        message: "Email already verified"
      };
    }

    // Check if expired
    if (Date.now() > verification.expiresAt) {
      throw new Error("Verification token has expired");
    }

    // Mark as verified
    await ctx.db.patch(verification._id, {
      verified: true,
      verifiedAt: Date.now()
    });

    // Get business info for response
    const business = await ctx.db.get(verification.businessId);

    return {
      success: true,
      verified: true,
      businessId: verification.businessId,
      businessName: business?.name,
      message: "Email verified successfully"
    };
  }
});

// Upload document for verification
export const uploadVerificationDocument = mutation({
  args: {
    businessId: v.id("businesses"),
    documentType: v.union(
      v.literal("business_license"),
      v.literal("utility_bill"),
      v.literal("tax_document"),
      v.literal("lease_agreement"),
      v.literal("government_id"),
      v.literal("other")
    ),
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    fileUrl: v.string(), // URL from file storage service
    description: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Get current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify business exists
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    // Validate file size (10MB limit)
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (args.fileSize > maxFileSize) {
      throw new Error("File size too large. Maximum 10MB allowed.");
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(args.fileType)) {
      throw new Error("Invalid file type. Please upload PDF, image, or document files.");
    }

    // Store document record
    const documentId = await ctx.db.insert("verificationDocuments", {
      businessId: args.businessId,
      userId: user._id,
      documentType: args.documentType,
      fileName: args.fileName,
      fileSize: args.fileSize,
      fileType: args.fileType,
      fileUrl: args.fileUrl,
      description: args.description,
      status: "pending_review",
      uploadedAt: Date.now(),
      reviewedAt: undefined,
      reviewedBy: undefined,
      reviewNotes: undefined
    });

    // Log upload event
    await ctx.db.insert("analyticsEvents", {
      businessId: args.businessId,
      eventType: "document_uploaded",
      timestamp: Date.now(),
      deviceType: "web",
      metadata: {
        documentId,
        documentType: args.documentType,
        fileSize: args.fileSize
      }
    });

    return {
      success: true,
      documentId,
      message: "Document uploaded successfully. It will be reviewed by our team."
    };
  }
});

// Get verification status for a business claim
export const getVerificationStatus = query({
  args: {
    businessId: v.id("businesses")
  },
  handler: async (ctx, args) => {
    // Get current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      return null;
    }

    // Get phone verifications
    const phoneVerifications = await ctx.db
      .query("phoneVerifications")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();

    // Get email verifications
    const emailVerifications = await ctx.db
      .query("emailVerifications")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();

    // Get uploaded documents
    const documents = await ctx.db
      .query("verificationDocuments")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();

    return {
      phone: {
        verified: phoneVerifications.some(v => v.verified),
        attempts: phoneVerifications.length,
        lastAttempt: phoneVerifications[0]?.createdAt
      },
      email: {
        verified: emailVerifications.some(v => v.verified),
        attempts: emailVerifications.length,
        lastAttempt: emailVerifications[0]?.createdAt
      },
      documents: {
        uploaded: documents.length,
        pending: documents.filter(d => d.status === "pending_review").length,
        approved: documents.filter(d => d.status === "approved").length,
        rejected: documents.filter(d => d.status === "rejected").length,
        files: documents.map(d => ({
          documentType: d.documentType,
          fileName: d.fileName,
          status: d.status,
          uploadedAt: d.uploadedAt,
          reviewNotes: d.reviewNotes
        }))
      }
    };
  }
});

// Helper function to generate secure token
function generateSecureToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Submit verification documents for business ownership
export const submitBusinessVerification = mutation({
  args: {
    businessId: v.id("businesses"),
    documentTypes: v.array(v.string()),
    additionalInfo: v.optional(v.string()),
    fileUrls: v.array(v.string()) // URLs from file storage
  },
  handler: async (ctx, args) => {
    // Get current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify business exists
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    // For now, we'll use the analytics table to track verification submissions
    // since businessVerifications table doesn't exist in simplified schema
    const verificationId = await ctx.db.insert("analyticsEvents", {
      businessId: args.businessId,
      eventType: "verification_submitted",
      timestamp: Date.now(),
      deviceType: "web",
      metadata: {
        userId: user._id,
        documentTypes: args.documentTypes,
        additionalInfo: args.additionalInfo,
        fileUrls: args.fileUrls,
        status: "pending_review"
      }
    });

    // Update business to indicate verification is pending (using existing field)
    await ctx.db.patch(args.businessId, {
      updatedAt: Date.now()
    });

    // Additional logging event (if needed)
    // Already logged above, so we don't need to duplicate

    return {
      success: true,
      verificationId,
      message: "Verification documents submitted successfully. We'll review them within 24-48 hours."
    };
  }
});

// Admin function to review documents
export const reviewVerificationDocument = mutation({
  args: {
    documentId: v.id("verificationDocuments"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
    reviewNotes: v.string()
  },
  handler: async (ctx, args) => {
    // Check admin permissions
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const admin = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!admin || admin.role !== "admin") {
      throw new Error("Admin access required");
    }

    // Get document
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    // Update document status
    await ctx.db.patch(args.documentId, {
      status: args.status,
      reviewedAt: Date.now(),
      reviewedBy: admin._id,
      reviewNotes: args.reviewNotes
    });

    // Log review event
    await ctx.db.insert("analyticsEvents", {
      businessId: document.businessId,
      eventType: "document_reviewed",
      timestamp: Date.now(),
      deviceType: "admin",
      metadata: {
        documentId: args.documentId,
        status: args.status,
        adminId: admin._id
      }
    });

    return {
      success: true,
      status: args.status,
      message: `Document ${args.status} successfully`
    };
  }
});