import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { getCurrencySymbol } from "@/lib/currency";
import { ThemeToggle } from "@/components/ThemeToggle";

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_type: string;
  invoice_date: string;
  client_name: string;
  total: number;
  status: string;
  currency: string;
}

interface InvoiceListProps {
  onCreateInvoice: () => void;
  onEditInvoice: (id: string) => void;
  onViewSettings: () => void;
}

export const InvoiceList = ({ onCreateInvoice, onEditInvoice, onViewSettings }: InvoiceListProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotations, setQuotations] = useState<Invoice[]>([]);
  const [proformas, setProformas] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const allInvoices = data || [];
      setInvoices(allInvoices.filter(inv => inv.invoice_type === "invoice"));
      setQuotations(allInvoices.filter(inv => inv.invoice_type === "quote"));
      setProformas(allInvoices.filter(inv => inv.invoice_type === "proforma"));
    } catch (error) {
      console.error("Error loading invoices:", error);
      toast({
        title: "Error",
        description: "Failed to load invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-accent text-accent-foreground";
      case "sent":
        return "bg-primary text-primary-foreground";
      case "overdue":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen p-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-5xl font-bold text-foreground mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Invoice Manager
            </h1>
            <p className="text-muted-foreground">Create and manage your invoices and quotes with ease</p>
          </div>
          <div className="flex gap-3">
            <ThemeToggle />
            <Button variant="outline" onClick={onViewSettings} className="glass hover:glass-card">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button onClick={onCreateInvoice} className="gradient-primary hover:shadow-glow transition-all duration-300">
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 glass-card rounded-2xl animate-pulse">
            <p className="text-muted-foreground">Loading your invoices...</p>
          </div>
        ) : invoices.length === 0 && quotations.length === 0 && proformas.length === 0 ? (
          <Card className="glass-card rounded-2xl border-none overflow-hidden animate-fade-in">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mb-6">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No invoices or quotes yet</h3>
              <p className="text-muted-foreground mb-8">Create your first document to get started</p>
              <Button onClick={onCreateInvoice} className="gradient-primary hover:shadow-glow">
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Invoices Section */}
            {invoices.length > 0 && (
              <div className="animate-slide-in">
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Invoices</h2>
                <div className="grid gap-4">
                  {invoices.map((invoice, index) => (
                    <Card
                      key={invoice.id}
                      className="glass-card rounded-2xl border-none cursor-pointer hover:shadow-hover transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => onEditInvoice(invoice.id)}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl mb-2 font-semibold">
                              Invoice #{invoice.invoice_number}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {invoice.client_name} • {format(new Date(invoice.invoice_date), "MMM dd, yyyy")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                              {getCurrencySymbol(invoice.currency)}{invoice.total.toFixed(2)}
                            </p>
                            <Badge className={getStatusColor(invoice.status) + " mt-2"}>
                              {invoice.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Quotations Section */}
            {quotations.length > 0 && (
              <div className="animate-slide-in" style={{ animationDelay: "0.2s" }}>
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">Quotations</h2>
                <div className="grid gap-4">
                  {quotations.map((quote, index) => (
                    <Card
                      key={quote.id}
                      className="glass-card rounded-2xl border-none cursor-pointer hover:shadow-hover transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                      style={{ animationDelay: `${(index + quotations.length) * 0.1}s` }}
                      onClick={() => onEditInvoice(quote.id)}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl mb-2 font-semibold">
                              Quote #{quote.invoice_number}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {quote.client_name} • {format(new Date(quote.invoice_date), "MMM dd, yyyy")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                              {getCurrencySymbol(quote.currency)}{quote.total.toFixed(2)}
                            </p>
                            <Badge className={getStatusColor(quote.status) + " mt-2"}>
                              {quote.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Proforma Invoices Section */}
            {proformas.length > 0 && (
              <div className="animate-slide-in" style={{ animationDelay: "0.4s" }}>
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Proforma Invoices</h2>
                <div className="grid gap-4">
                  {proformas.map((proforma, index) => (
                    <Card
                      key={proforma.id}
                      className="glass-card rounded-2xl border-none cursor-pointer hover:shadow-hover transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                      style={{ animationDelay: `${(index + invoices.length + quotations.length) * 0.1}s` }}
                      onClick={() => onEditInvoice(proforma.id)}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl mb-2 font-semibold">
                              Proforma Invoice #{proforma.invoice_number}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {proforma.client_name} • {format(new Date(proforma.invoice_date), "MMM dd, yyyy")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                              {getCurrencySymbol(proforma.currency)}{proforma.total.toFixed(2)}
                            </p>
                            <Badge className={getStatusColor(proforma.status) + " mt-2"}>
                              {proforma.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
