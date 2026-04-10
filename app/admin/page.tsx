"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Loader2, CheckCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function AdminPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cleared, setCleared] = useState(false);

  const handleClearData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/clear-data", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setCleared(true);
        toast.success("All data cleared successfully!");
        console.log("[v0] Clear results:", data.results);
      } else {
        toast.error(data.message || "Failed to clear data");
      }
    } catch (error) {
      toast.error("Error clearing data");
      console.error("[v0] Error:", error);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Admin Panel</CardTitle>
            <CardDescription>Database management tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    These actions cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            {cleared && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className="text-sm text-green-700">Database cleared successfully</p>
              </div>
            )}

            <Button
              onClick={() => setIsOpen(true)}
              variant="destructive"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Clear All Data
            </Button>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all data from your database including:
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>All jobs and quotes</li>
                <li>All customers and leads</li>
                <li>All transactions and payments</li>
                <li>All agents and referrals</li>
              </ul>
              <p className="mt-3 font-semibold text-foreground">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearData}
              className="bg-destructive text-destructive-foreground"
            >
              Clear Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
