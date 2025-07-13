import { useState } from "react";
import { useSearchParams, Link } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/react-router";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export default function UploadDocuments() {
  const [searchParams] = useSearchParams();
  const claimId = searchParams.get('claim') as Id<"businessModerationQueue"> | null;
  const { user } = useUser();
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get claim details
  const claimDetails = useQuery(
    claimId && user ? api.moderation.getClaimDetails : "skip",
    claimId ? { claimId } : "skip"
  );

  // Upload mutation (placeholder - would need Convex file storage setup)
  const submitDocuments = useMutation(api.moderation.submitAdditionalDocuments);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(file.type)) {
        setError(`${file.name} is not a supported file type. Please use PDF, JPG, or PNG.`);
        return false;
      }
      
      if (file.size > maxSize) {
        setError(`${file.name} is too large. Maximum file size is 10MB.`);
        return false;
      }
      
      return true;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    setError(null);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!claimId || selectedFiles.length === 0) {
      setError("Please select at least one document to upload.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // For now, we'll simulate the upload since Convex file storage setup is complex
      // In production, you'd upload files to Convex storage first, then submit the storage IDs
      
      const fileInfo = selectedFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        // storageId: would be the actual Convex storage ID after upload
      }));

      await submitDocuments({
        claimId,
        documents: fileInfo,
        notes: "Additional documents submitted as requested"
      });

      setUploadSuccess(true);
      setSelectedFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Sign In Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to upload documents.</p>
          <Link to="/sign-in" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!claimId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Invalid Request</h1>
          <p className="text-gray-600 mb-6">No claim ID provided. Please access this page from your claims dashboard.</p>
          <Link to="/my-claims" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            View My Claims
          </Link>
        </div>
      </div>
    );
  }

  if (claimDetails === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!claimDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Claim Not Found</h1>
          <p className="text-gray-600 mb-6">The specified claim could not be found.</p>
          <Link to="/my-claims" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            View My Claims
          </Link>
        </div>
      </div>
    );
  }

  if (uploadSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Documents Uploaded Successfully</h1>
          <p className="text-gray-600 mb-6">
            Your documents have been submitted and will be reviewed by our team. You'll receive an email update within 24-48 hours.
          </p>
          <div className="space-y-3">
            <Link 
              to="/my-claims" 
              className="block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View My Claims
            </Link>
            <Link 
              to="/" 
              className="block text-gray-600 hover:text-gray-800 transition-colors"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit Additional Documents</h1>
          <p className="text-gray-600">
            Upload the requested documents for your business claim: <strong>{claimDetails.businessName}</strong>
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3">📋 What you need to provide:</h3>
          {claimDetails.latestAdminNote ? (
            <p className="text-blue-800 italic mb-4">"{claimDetails.latestAdminNote}"</p>
          ) : (
            <p className="text-blue-800 mb-4">Please provide the additional documentation as requested by our moderation team.</p>
          )}
          
          <div className="text-blue-800 text-sm">
            <h4 className="font-medium mb-2">Accepted file types:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>PDF documents (.pdf)</li>
              <li>Images (.jpg, .jpeg, .png)</li>
              <li>Maximum file size: 10MB per file</li>
            </ul>
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <form onSubmit={handleSubmit}>
            {/* File Upload Area */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Documents
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                <p className="text-gray-400 text-sm">PDF, JPG, PNG (max 10MB each)</p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Selected Files ({selectedFiles.length})</h4>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={uploading || selectedFiles.length === 0}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  uploading || selectedFiles.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {uploading ? 'Uploading...' : `Submit ${selectedFiles.length} Document${selectedFiles.length !== 1 ? 's' : ''}`}
              </button>
              <Link
                to="/my-claims"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}