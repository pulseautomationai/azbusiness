import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

// Initialize Resend with API key from environment variable
// Note: Set RESEND_API_KEY in your .env.local file
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "your_resend_api_key_here") {
    throw new Error("RESEND_API_KEY environment variable is not configured. Please add your Resend API key to .env.local");
  }
  return new Resend(apiKey);
};

// Email Templates
const emailTemplates = {
  claimApproved: (businessName: string, claimantName: string) => ({
    subject: `🎉 Your claim for ${businessName} has been approved!`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="background-color: #10b981; color: white; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 16px;">
              ✓
            </div>
            <h1 style="color: #065f46; margin: 0; font-size: 24px; font-weight: bold;">Claim Approved!</h1>
          </div>
          
          <p style="color: #374151; line-height: 1.6; margin-bottom: 24px;">
            Hi ${claimantName},
          </p>
          
          <p style="color: #374151; line-height: 1.6; margin-bottom: 24px;">
            Great news! Your claim for <strong>${businessName}</strong> has been approved by our moderation team.
          </p>
          
          <div style="background-color: #ecfdf5; border: 1px solid #d1fae5; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
            <h3 style="color: #065f46; margin: 0 0 12px 0; font-size: 16px;">What happens next?</h3>
            <ul style="color: #059669; margin: 0; padding-left: 20px;">
              <li>Your business listing is now marked as verified</li>
              <li>You can manage your listing and update information</li>
              <li>Consider upgrading to Pro for enhanced features and lead generation</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="https://azbusiness.services/my-claims" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
              Manage Your Listing
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          
          <p style="color: #6b7280; font-size: 14px; margin: 0; text-align: center;">
            Need help? Reply to this email or contact us at support@azbusiness.services
          </p>
        </div>
      </div>
    `
  }),

  claimRejected: (businessName: string, claimantName: string, reason: string) => ({
    subject: `Your claim for ${businessName} requires attention`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="background-color: #ef4444; color: white; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 16px;">
              !
            </div>
            <h1 style="color: #991b1b; margin: 0; font-size: 24px; font-weight: bold;">Claim Update Required</h1>
          </div>
          
          <p style="color: #374151; line-height: 1.6; margin-bottom: 24px;">
            Hi ${claimantName},
          </p>
          
          <p style="color: #374151; line-height: 1.6; margin-bottom: 24px;">
            We've reviewed your claim for <strong>${businessName}</strong> and need additional information before we can approve it.
          </p>
          
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
            <h3 style="color: #991b1b; margin: 0 0 12px 0; font-size: 16px;">Reason for review:</h3>
            <p style="color: #dc2626; margin: 0; font-style: italic;">${reason}</p>
          </div>
          
          <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
            <h3 style="color: #1e40af; margin: 0 0 12px 0; font-size: 16px;">Next steps:</h3>
            <ul style="color: #2563eb; margin: 0; padding-left: 20px;">
              <li>Review the feedback above</li>
              <li>Gather any additional documentation</li>
              <li>Submit a new claim with the required information</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="https://azbusiness.services/claim-business" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
              Submit New Claim
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          
          <p style="color: #6b7280; font-size: 14px; margin: 0; text-align: center;">
            Questions? Reply to this email or contact us at support@azbusiness.services
          </p>
        </div>
      </div>
    `
  }),

  claimInfoRequested: (businessName: string, claimantName: string, infoRequested: string) => ({
    subject: `Additional information needed for ${businessName} claim`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="background-color: #f59e0b; color: white; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 16px;">
              📋
            </div>
            <h1 style="color: #92400e; margin: 0; font-size: 24px; font-weight: bold;">Additional Information Needed</h1>
          </div>
          
          <p style="color: #374151; line-height: 1.6; margin-bottom: 24px;">
            Hi ${claimantName},
          </p>
          
          <p style="color: #374151; line-height: 1.6; margin-bottom: 24px;">
            We're reviewing your claim for <strong>${businessName}</strong> and need some additional information to complete the verification process.
          </p>
          
          <div style="background-color: #fffbeb; border: 1px solid #fed7aa; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
            <h3 style="color: #92400e; margin: 0 0 12px 0; font-size: 16px;">Please provide:</h3>
            <p style="color: #d97706; margin: 0; font-style: italic;">${infoRequested}</p>
          </div>
          
          <div style="background-color: #ecfdf5; border: 1px solid #d1fae5; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
            <h3 style="color: #065f46; margin: 0 0 12px 0; font-size: 16px;">How to submit documents:</h3>
            <ul style="color: #059669; margin: 0; padding-left: 20px;">
              <li>Use the secure upload portal below</li>
              <li>Accepted formats: PDF, JPG, PNG (max 10MB each)</li>
              <li>Your information is securely encrypted</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="https://azbusiness.services/upload-documents?claim=temp-id" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
              Upload Documents
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          
          <p style="color: #6b7280; font-size: 14px; margin: 0; text-align: center;">
            Need help? Reply to this email or contact us at support@azbusiness.services
          </p>
        </div>
      </div>
    `
  })
};

// Send claim approved email
export const sendClaimApprovedEmail = action({
  args: {
    to: v.string(),
    businessName: v.string(),
    claimantName: v.string()
  },
  handler: async (ctx, args) => {
    try {
      const resend = getResendClient();
      const template = emailTemplates.claimApproved(args.businessName, args.claimantName);
      
      const result = await resend.emails.send({
        from: 'AZ Business Directory <noreply@azbusiness.services>',
        to: args.to,
        subject: template.subject,
        html: template.html,
      });

      console.log("Claim approved email sent:", result);
      return { success: true, messageId: result.data?.id };
    } catch (error) {
      console.error("Failed to send claim approved email:", error);
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

// Send claim rejected email
export const sendClaimRejectedEmail = action({
  args: {
    to: v.string(),
    businessName: v.string(),
    claimantName: v.string(),
    reason: v.string()
  },
  handler: async (ctx, args) => {
    try {
      const resend = getResendClient();
      const template = emailTemplates.claimRejected(args.businessName, args.claimantName, args.reason);
      
      const result = await resend.emails.send({
        from: 'AZ Business Directory <noreply@azbusiness.services>',
        to: args.to,
        subject: template.subject,
        html: template.html,
      });

      console.log("Claim rejected email sent:", result);
      return { success: true, messageId: result.data?.id };
    } catch (error) {
      console.error("Failed to send claim rejected email:", error);
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

// Send claim info requested email
export const sendClaimInfoRequestedEmail = action({
  args: {
    to: v.string(),
    businessName: v.string(),
    claimantName: v.string(),
    infoRequested: v.string()
  },
  handler: async (ctx, args) => {
    try {
      const resend = getResendClient();
      const template = emailTemplates.claimInfoRequested(args.businessName, args.claimantName, args.infoRequested);
      
      const result = await resend.emails.send({
        from: 'AZ Business Directory <noreply@azbusiness.services>',
        to: args.to,
        subject: template.subject,
        html: template.html,
      });

      console.log("Claim info requested email sent:", result);
      return { success: true, messageId: result.data?.id };
    } catch (error) {
      console.error("Failed to send claim info requested email:", error);
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});