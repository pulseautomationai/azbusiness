import { useState } from "react";
import { useSearchParams, Link } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/react-router";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { 
  IconUpload,
  IconFile,
  IconTrash,
  IconCheck,
  IconBuildingStore
} from "@tabler/icons-react";

export default function DocumentsPage() {
  const [searchParams] = useSearchParams();
  const claimId = searchParams.get('claim') as Id<"businessModerationQueue"> | null;
  const { user } = useUser();
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get claim details if claimId is provided
  const claimDetails = useQuery(
    claimId && user ? api.moderation.getClaimDetails : "skip",
    claimId ? { claimId } : "skip"
  );

  // Upload mutation
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
      const fileInfo = selectedFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
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
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to upload documents.
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

  if (uploadSuccess) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mb-4">
              <IconCheck className="w-16 h-16 mx-auto text-green-500" />
            </div>
            <CardTitle>Documents Uploaded Successfully</CardTitle>
            <CardDescription>
              Your documents have been submitted and will be reviewed by our team. You'll receive an email update within 24-48 hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/dashboard/claims">
              <Button className="w-full">View My Claims</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" className="w-full">Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no claimId provided, show general document upload page
  if (!claimId) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-6 p-6">
          <div>
            <h1 className="text-3xl font-bold">Document Upload</h1>
            <p className="text-muted-foreground">
              Upload documents for business verification and claims
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconBuildingStore className="h-5 w-5" />
                Upload for Specific Claim
              </CardTitle>
              <CardDescription>
                To upload documents for a specific business claim, please access this page from your claims dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/dashboard/claims">
                <Button className="flex items-center gap-2">
                  <IconBuildingStore className="h-4 w-4" />
                  View My Claims
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (claimDetails === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!claimDetails) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle>Claim Not Found</CardTitle>
            <CardDescription>
              The specified claim could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/claims">
              <Button className="w-full">View My Claims</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-6 p-6 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Submit Additional Documents</h1>
          <p className="text-muted-foreground">
            Upload the requested documents for your business claim: <strong>{claimDetails.businessName}</strong>
          </p>
        </div>

        {/* Instructions */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <IconFile className="h-5 w-5" />
              What you need to provide
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            {claimDetails.latestAdminNote ? (
              <p className="italic mb-4">"{claimDetails.latestAdminNote}"</p>
            ) : (
              <p className="mb-4">Please provide the additional documentation as requested by our moderation team.</p>
            )}
            
            <div className="text-sm">
              <h4 className="font-medium mb-2">Accepted file types:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>PDF documents (.pdf)</li>
                <li>Images (.jpg, .jpeg, .png)</li>
                <li>Maximum file size: 10MB per file</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Documents
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <IconUpload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground mb-4">PDF, JPG, PNG (max 10MB each)</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Selected Files ({selectedFiles.length})</h4>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <IconFile className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <p className="text-red-800">{error}</p>
                  </CardContent>
                </Card>
              )}

              {/* Submit Button */}
              <div className="flex space-x-4">
                <Button
                  type="submit"
                  disabled={uploading || selectedFiles.length === 0}
                  className="flex-1"
                >
                  {uploading ? 'Uploading...' : `Submit ${selectedFiles.length} Document${selectedFiles.length !== 1 ? 's' : ''}`}
                </Button>
                <Link to="/dashboard/claims">
                  <Button variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}