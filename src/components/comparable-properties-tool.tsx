"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { getComparableProperties, type FormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Loader2, UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const initialState: FormState = {
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Generate Summary
    </Button>
  );
}

export function ComparablePropertiesTool() {
  const [state, formAction] = useFormState(getComparableProperties, initialState);
  const [csvContent, setCsvContent] = React.useState("");
  const [fileName, setFileName] = React.useState("");
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCsvContent(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  React.useEffect(() => {
    if (state.message && state.message !== "Success!") {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.message,
      });
    }
  }, [state, toast]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Comparable Property Tool</CardTitle>
        <CardDescription>Use AI to generate a summary of comparable properties from a CSV list.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" placeholder="e.g., Austin, TX" required />
              {state.errors?.location && <p className="text-sm text-destructive mt-1">{state.errors.location[0]}</p>}
            </div>
            <div>
              <Label htmlFor="radius">Search Radius (miles)</Label>
              <Input id="radius" name="radius" type="number" placeholder="5" required />
              {state.errors?.radius && <p className="text-sm text-destructive mt-1">{state.errors.radius[0]}</p>}
            </div>
            <div>
              <Label htmlFor="squareFootageRange">Square Footage Range</Label>
              <Input id="squareFootageRange" name="squareFootageRange" placeholder="e.g., 1500-2000" required />
              {state.errors?.squareFootageRange && <p className="text-sm text-destructive mt-1">{state.errors.squareFootageRange[0]}</p>}
            </div>
            <div>
              <Label htmlFor="propertyTypes">Property Types</Label>
              <Input id="propertyTypes" name="propertyTypes" placeholder="e.g., single family, duplex" required />
              {state.errors?.propertyTypes && <p className="text-sm text-destructive mt-1">{state.errors.propertyTypes[0]}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="csvUpload">Property Listings CSV</Label>
            <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-border px-6 pt-5 pb-6">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="flex text-sm text-muted-foreground">
                  <Label htmlFor="csvUpload" className="relative cursor-pointer rounded-md bg-background font-medium text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:text-primary/80">
                    <span>Upload a file</span>
                    <Input id="csvUpload" name="csvUpload" type="file" className="sr-only" accept=".csv" onChange={handleFileChange} />
                  </Label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-muted-foreground">{fileName || "CSV up to 10MB"}</p>
              </div>
            </div>
            <textarea name="propertyListingsCsv" value={csvContent} readOnly className="sr-only" aria-hidden="true" />
             {state.errors?.propertyListingsCsv && <p className="text-sm text-destructive mt-1">{state.errors.propertyListingsCsv[0]}</p>}
          </div>

          {state.summary && (
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>Generated Summary</AlertTitle>
              <AlertDescription className="prose prose-sm max-w-none">
                <p>{state.summary}</p>
              </AlertDescription>
            </Alert>
          )}

        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
