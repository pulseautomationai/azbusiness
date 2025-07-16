import { useState, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Upload, FileText, AlertCircle, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";

interface DocumentVerificationProps {
  onVerificationSubmitted: (verificationData: VerificationData) => void;
  onSkip: () => void;
}

interface VerificationData {
  documents: File[];
  documentTypes: string[];
  additionalInfo: string;
}

const ACCEPTED_DOCUMENT_TYPES = [
  { id: "business_license", label: "Business License", description: "Official business registration or license" },
  { id: "tax_id", label: "Tax ID Document", description: "EIN or other tax identification" },
  { id: "utility_bill", label: "Utility Bill", description: "Recent utility bill showing business address" },
  { id: "lease_agreement", label: "Lease Agreement", description: "Current lease or property ownership document" },
  { id: "bank_statement", label: "Bank Statement", description: "Recent business bank statement" },
  { id: "insurance_certificate", label: "Insurance Certificate", description: "Current business insurance certificate" },
  { id: "other", label: "Other", description: "Any other document proving business ownership" }
];

export function DocumentVerification({ onVerificationSubmitted, onSkip }: DocumentVerificationProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported file type. Please use JPG, PNG, or PDF.`);
        return false;
      }
      
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleDocumentType = (typeId: string) => {
    setSelectedDocTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleSubmit = () => {
    if (selectedFiles.length === 0) {
      toast.error("Please upload at least one document");
      return;
    }

    if (selectedDocTypes.length === 0) {
      toast.error("Please select at least one document type");
      return;
    }

    const verificationData: VerificationData = {
      documents: selectedFiles,
      documentTypes: selectedDocTypes,
      additionalInfo
    };

    onVerificationSubmitted(verificationData);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <CheckCircle className="h-8 w-8 text-green-500" />
          <div>
            <CardTitle>Verify Your Business Ownership</CardTitle>
            <CardDescription>
              Upload documents to verify that you own or represent this business
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            To maintain directory quality, we require verification for business claims. 
            Your documents will be reviewed within 24-48 hours.
          </AlertDescription>
        </Alert>

        {/* Document Types */}
        <div>
          <Label className="text-base font-semibold">Document Types *</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Select which types of documents you'll be uploading
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ACCEPTED_DOCUMENT_TYPES.map((docType) => (
              <div
                key={docType.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedDocTypes.includes(docType.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50"
                }`}
                onClick={() => toggleDocumentType(docType.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{docType.label}</p>
                    <p className="text-xs text-muted-foreground">{docType.description}</p>
                  </div>
                  {selectedDocTypes.includes(docType.id) && (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* File Upload */}
        <div>
          <Label className="text-base font-semibold">Upload Documents *</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Supported formats: JPG, PNG, PDF. Maximum size: 10MB per file.
          </p>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Upload business license, tax documents, or other proof of ownership
            </p>
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <Button asChild variant="outline">
              <label htmlFor="file-upload" className="cursor-pointer">
                Choose Files
              </label>
            </Button>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <Label className="text-sm font-medium">Selected Files:</Label>
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div>
          <Label htmlFor="additional-info">Additional Information</Label>
          <Textarea
            id="additional-info"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder="Provide any additional context about your business ownership or these documents..."
            className="mt-1"
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onSkip}>
            Skip for Now
          </Button>
          
          <Button 
            onClick={handleSubmit}
            disabled={selectedFiles.length === 0 || selectedDocTypes.length === 0}
          >
            Submit for Verification
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          By submitting documents, you confirm that you have the right to represent this business 
          and that all information provided is accurate.
        </p>
      </CardContent>
    </Card>
  );
}