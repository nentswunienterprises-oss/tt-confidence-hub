import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, FileCheck, Loader2 } from "lucide-react";
import { API_URL } from "@/lib/config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type Clause = {
  key: string;
  label: string;
};

type DocumentDefinition = {
  step: number;
  code: string;
  title: string;
  version: string;
  mandatoryClauses: Clause[];
  content: string;
  contentHash: string;
};

type Props = {
  applicationId: string;
  applicationStatus: any;
};

const DEFAULT_STATUSES: Record<string, string> = {
  "1": "pending_upload",
  "2": "not_started",
  "3": "not_started",
  "4": "not_started",
  "5": "not_started",
  "6": "not_started",
  "7": "not_started",
};

function statusLabel(status: string) {
  return status.replace(/_/g, " ");
}

export function TdSequentialAgreementAcceptance({ applicationId, applicationStatus }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeDocument, setActiveDocument] = useState<DocumentDefinition | null>(null);
  const [typedFullName, setTypedFullName] = useState("");
  const [acceptedClauseKeys, setAcceptedClauseKeys] = useState<string[]>([]);
  const [viewStartedAt, setViewStartedAt] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ applicationId: string; documents: DocumentDefinition[] }>({
    queryKey: ["/api/td/onboarding-documents"],
    enabled: Boolean(applicationId),
  });

  const documentsStatus = {
    ...DEFAULT_STATUSES,
    ...(applicationStatus?.documentsStatus || applicationStatus?.documents_status || {}),
  };

  const currentStep = useMemo(() => {
    for (let step = 1; step <= 7; step += 1) {
      if (String(documentsStatus[String(step)] || "not_started") !== "approved") {
        return step;
      }
    }
    return 7;
  }, [documentsStatus]);

  useEffect(() => {
    if (!activeDocument) return;
    setTypedFullName(
      String(
        applicationStatus?.fullName ||
        applicationStatus?.full_name ||
        applicationStatus?.name ||
        ""
      ).trim()
    );
    setAcceptedClauseKeys([]);
    setViewStartedAt(new Date().toISOString());
  }, [activeDocument, applicationStatus]);

  const acceptMutation = useMutation({
    mutationFn: async (document: DocumentDefinition) => {
      const response = await fetch(`${API_URL}/api/td/onboarding-documents/${document.step}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          applicationId,
          documentVersion: document.version,
          documentHash: document.contentHash,
          typedFullName,
          acceptedClauseKeys,
          acceptedTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          locale: navigator.language,
          platform: "web",
          sourceFlow: `td_gateway_step_${document.step}`,
          formData: {
            typedFullName,
            email: applicationStatus?.email || "",
          },
          scrollCompletionPercent: 100,
          viewStartedAt,
          viewCompletedAt: new Date().toISOString(),
          acceptClickedAt: new Date().toISOString(),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || "Failed to accept document");
      }
      return payload;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/td/application-status"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/td/gateway-session"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/td/onboarding-documents"] }),
      ]);
      toast({
        title: "Agreement accepted",
        description: "The next TD onboarding step is now unlocked.",
      });
      setActiveDocument(null);
    },
    onError: (error) => {
      toast({
        title: "Unable to accept agreement",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const documents = data?.documents || [];

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading TD onboarding agreements...
        </div>
      ) : null}

      {documents.map((document) => {
        const stepStatus = String(documentsStatus[String(document.step)] || "not_started");
        const actionable = document.step === currentStep && stepStatus !== "approved";

        return (
          <Card key={document.step} className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">{document.code} - {document.title}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">Step {document.step} of 7</p>
                </div>
                <Badge variant={stepStatus === "approved" ? "default" : "secondary"}>
                  {statusLabel(stepStatus)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {document.mandatoryClauses.length ? (
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {document.mandatoryClauses.map((clause) => (
                    <li key={clause.key}>- {clause.label}</li>
                  ))}
                </ul>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant={stepStatus === "approved" ? "outline" : "default"}
                  style={stepStatus === "approved" ? undefined : { backgroundColor: "#E63946" }}
                  onClick={() => setActiveDocument(document)}
                  disabled={!actionable && stepStatus !== "approved"}
                >
                  {stepStatus === "approved" ? (
                    <>
                      <FileCheck className="mr-2 h-4 w-4" />
                      View Receipt
                    </>
                  ) : actionable ? (
                    "Review and Accept"
                  ) : (
                    "Locked"
                  )}
                </Button>
                {stepStatus === "approved" ? (
                  <span className="inline-flex items-center gap-1 text-sm text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Accepted
                  </span>
                ) : null}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Dialog open={Boolean(activeDocument)} onOpenChange={(open) => !open && setActiveDocument(null)}>
        <DialogContent className="h-[90vh] max-w-4xl overflow-hidden p-0">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>{activeDocument?.code} - {activeDocument?.title}</DialogTitle>
          </DialogHeader>
          {activeDocument ? (
            <div className="flex h-full flex-col">
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-[#1A1A1A]">
                  {activeDocument.content}
                </pre>

                <div className="mt-6 space-y-4 rounded-xl border bg-muted/20 p-4">
                  <div className="space-y-2">
                    <Label htmlFor="td-typed-name">Type your full name to accept</Label>
                    <Input
                      id="td-typed-name"
                      value={typedFullName}
                      onChange={(event) => setTypedFullName(event.target.value)}
                      placeholder="Full legal name"
                    />
                  </div>

                  {activeDocument.mandatoryClauses.map((clause) => {
                    const checked = acceptedClauseKeys.includes(clause.key);
                    return (
                      <label key={clause.key} className="flex items-start gap-3 text-sm">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) => {
                            setAcceptedClauseKeys((current) =>
                              value ? [...current, clause.key] : current.filter((entry) => entry !== clause.key)
                            );
                          }}
                        />
                        <span>{clause.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between border-t px-6 py-4">
                <Button variant="ghost" onClick={() => setActiveDocument(null)}>
                  Close
                </Button>
                <Button
                  style={{ backgroundColor: "#E63946" }}
                  disabled={
                    acceptMutation.isPending ||
                    !typedFullName.trim() ||
                    acceptedClauseKeys.length !== activeDocument.mandatoryClauses.length
                  }
                  onClick={() => acceptMutation.mutate(activeDocument)}
                >
                  {acceptMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Accept Agreement
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
