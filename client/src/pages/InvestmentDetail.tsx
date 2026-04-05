import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useInvestmentDetail } from "@/hooks/useInvestment";
import { useUser } from "@/context/UserContext";
import { PaymentTable } from "@/components/investments/PaymentTable";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRoute, useLocation } from "wouter";
import {
  ArrowLeft, Building2, MapPin, Calendar, FileText, Plus, Trash2,
  ExternalLink, Image as ImageIcon,
} from "lucide-react";
import {
  updateInvestmentPayment,
  addInvestmentDocument, deleteInvestmentDocument,
} from "@/lib/api";

// Gallery images for Sobha Solis (scraped from propsearch.ae)
const SOBHA_SOLIS_GALLERY = [
  "https://static.propsearch.ae/dubai-locations/sobha-solis_iPxqL_xl.jpg",
  "https://static.propsearch.ae/dubai-locations/sobha-solis_o0Zsa_xl.jpg",
  "https://static.propsearch.ae/dubai-locations/sobha-solis_kYMKy_xl.jpg",
  "https://static.propsearch.ae/dubai-locations/sobha-solis_2e1Ug_xl.jpg",
  "https://static.propsearch.ae/dubai-locations/sobha-solis_8EdWv_xl.jpg",
  "https://static.propsearch.ae/dubai-locations/sobha-solis_Bgr4X_xl.jpg",
  "https://static.propsearch.ae/dubai-locations/sobha-solis_exkIj_xl.jpg",
  "https://static.propsearch.ae/dubai-locations/sobha-solis_HHT6m_xl.jpg",
  "https://static.propsearch.ae/dubai-locations/sobha-solis_iKuyx_xl.jpg",
  "https://static.propsearch.ae/dubai-locations/sobha-solis_KjgeO_xl.jpg",
  "https://static.propsearch.ae/dubai-locations/sobha-solis_Ms591_xl.jpg",
  "https://static.propsearch.ae/dubai-locations/sobha-solis_QKIgd_xl.jpg",
];

function formatCurrency(n?: number, prefix = "$") {
  if (!n) return "—";
  return `${prefix}${n.toLocaleString("en-AU")}`;
}

export function InvestmentDetail() {
  const [, params] = useRoute("/wealth/investments/:id");
  const [, navigate] = useLocation();
  const { user } = useUser();
  const { investment, isLoading, reload } = useInvestmentDetail(params?.id);

  const [docName, setDocName] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (isLoading) {
    return <DashboardLayout title="Investment"><p className="text-muted-foreground">Loading...</p></DashboardLayout>;
  }
  if (!investment) {
    return <DashboardLayout title="Investment"><p className="text-muted-foreground">Investment not found.</p></DashboardLayout>;
  }

  const paidPayments = investment.payments.filter((p) => p.isPaid);
  const totalPaidAud = paidPayments.reduce((s, p) => s + (p.amountAud || 0), 0);
  const totalPaidLocal = paidPayments.reduce((s, p) => s + p.amountLocal, 0);
  const totalPrice = investment.purchasePriceLocal || 0;
  const paidPct = totalPrice > 0 ? Math.round((totalPaidLocal / totalPrice) * 100) : 0;
  const remainingLocal = totalPrice - totalPaidLocal;
  const exchangeRate = (investment.purchasePriceAud && investment.purchasePriceLocal)
    ? investment.purchasePriceAud / investment.purchasePriceLocal
    : 1;
  const remainingAud = Math.round(remainingLocal * exchangeRate);

  const handleTogglePaid = async (paymentId: string, isPaid: boolean) => {
    await updateInvestmentPayment(paymentId, {
      isPaid,
      datePaid: isPaid ? new Date().toISOString().split("T")[0] : null,
    });
    reload();
  };

  const handleAddDoc = async () => {
    if (!docName.trim() || !docUrl.trim()) return;
    await addInvestmentDocument(investment.id, { name: docName.trim(), fileUrl: docUrl.trim(), uploadedBy: user || undefined });
    setDocName(""); setDocUrl("");
    reload();
  };

  const handleDeleteDoc = async (docId: string) => {
    await deleteInvestmentDocument(docId);
    reload();
  };

  // Check if this is Sobha Solis for gallery/map
  const isSobhaSolis = investment.name.toLowerCase().includes("sobha solis");
  const gallery = isSobhaSolis ? SOBHA_SOLIS_GALLERY : [];

  return (
    <DashboardLayout title={investment.name}>
      <div className="space-y-6 max-w-5xl">
        {/* Back */}
        <button onClick={() => navigate("/wealth/investments")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <ArrowLeft className="size-4" />
          Back to investments
        </button>

        {/* Header */}
        <div className="flex items-start gap-4">
          {investment.imageUrl ? (
            <img src={investment.imageUrl} alt={investment.name} className="size-16 rounded-xl object-cover" />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-xl bg-primary/10">
              <Building2 className="size-8 text-primary" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{investment.name}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
              {investment.unitNumber && <span>Unit {investment.unitNumber}</span>}
              {investment.tower && <span>{investment.tower}</span>}
              {(investment.location || investment.country) && (
                <span className="flex items-center gap-1"><MapPin className="size-3" />{[investment.location, investment.country].filter(Boolean).join(", ")}</span>
              )}
              {investment.completionDate && (
                <span className="flex items-center gap-1"><Calendar className="size-3" />{investment.completionDate}</span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payments">Payments ({investment.payments.length})</TabsTrigger>
            <TabsTrigger value="documents">Documents ({investment.documents.length})</TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW ── */}
          <TabsContent value="overview" className="space-y-6 mt-4">
            {/* Key stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <GlassCard className="bg-blue-50/50 dark:bg-blue-950/20">
                <div className="text-[10px] font-bold tracking-widest text-muted-foreground">PURCHASE (AUD)</div>
                <div className="text-lg font-bold font-mono">{formatCurrency(investment.purchasePriceAud)} AUD</div>
                {investment.purchasePriceLocal && <div className="text-xs text-muted-foreground">{formatCurrency(investment.purchasePriceLocal, `${investment.currency} `)}</div>}
              </GlassCard>
              <GlassCard className="bg-green-50/50 dark:bg-green-950/20">
                <div className="text-[10px] font-bold tracking-widest text-muted-foreground">PAID</div>
                <div className="text-lg font-bold font-mono text-green-600">{paidPct}%</div>
                <div className="text-xs text-muted-foreground">{formatCurrency(totalPaidAud)} AUD</div>
              </GlassCard>
              <GlassCard className="bg-amber-50/50 dark:bg-amber-950/20">
                <div className="text-[10px] font-bold tracking-widest text-muted-foreground">REMAINING</div>
                <div className="text-lg font-bold font-mono text-amber-600">{formatCurrency(remainingAud)} AUD</div>
                {remainingLocal > 0 && <div className="text-xs text-muted-foreground">{formatCurrency(remainingLocal, `${investment.currency} `)}</div>}
              </GlassCard>
              <GlassCard>
                <div className="text-[10px] font-bold tracking-widest text-muted-foreground">SIZE</div>
                <div className="text-lg font-bold font-mono">{investment.areaSqm || "—"} sqm</div>
                {investment.areaSqft && <div className="text-xs text-muted-foreground">{investment.areaSqft} sqft</div>}
              </GlassCard>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Payment Progress</span>
                <span>{paidPct}% paid</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${paidPct}%` }} />
              </div>
            </div>

            {/* Photo Gallery */}
            {gallery.length > 0 && (
              <GlassCard>
                <GlassCardHeader>
                  <GlassCardTitle className="flex items-center gap-2">
                    <ImageIcon className="size-4" /> Gallery
                  </GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {gallery.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(url)}
                        className="aspect-video rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                      >
                        <img src={url} alt={`${investment.name} ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                </GlassCardContent>
              </GlassCard>
            )}

            {/* Description */}
            {investment.description && (
              <GlassCard>
                <GlassCardHeader><GlassCardTitle>About the Development</GlassCardTitle></GlassCardHeader>
                <GlassCardContent>
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{investment.description}</p>
                </GlassCardContent>
              </GlassCard>
            )}

            {/* Development Breakdown */}
            {isSobhaSolis && (
              <GlassCard>
                <GlassCardHeader><GlassCardTitle>Development Breakdown</GlassCardTitle></GlassCardHeader>
                <GlassCardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Developer</p>
                      <p className="font-medium">Sobha Realty</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Project Size</p>
                      <p className="font-medium">11.75 acres</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Towers</p>
                      <p className="font-medium">4 crescent-shaped towers</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Units</p>
                      <p className="font-medium">~2,316 residences</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Floor Range</p>
                      <p className="font-medium">28–46 floors</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Unit Types</p>
                      <p className="font-medium">1, 1.5, 2 & 3 BR</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Payment Plan</p>
                      <p className="font-medium">40/60 (construction/handover)</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">RERA Approved</p>
                      <p className="font-medium">Feb 2025</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Completion</p>
                      <p className="font-medium">Q4 2027</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Key Amenities (25+)</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Arsenal Fitness Zone", "Infinity Pool", "Sunken Pool Deck",
                        "Outdoor Cinema", "Rock Climbing Wall", "Parkour Park",
                        "CrossFit Zone", "Yoga Deck", "Running Track",
                        "Sports Courts", "Co-Working Spaces", "Kids' Pool",
                        "Dog Park", "Zen Garden", "Rooftop Garden",
                        "Sky Golf", "Landscaped Gardens", "Retail Outlets",
                      ].map((a) => (
                        <span key={a} className="text-xs bg-muted/60 rounded-full px-2.5 py-1 text-foreground/80">{a}</span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Nearby</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Mohammed bin Zayed Road", "Al Qudra Road", "Dubai Miracle Garden",
                        "First Avenue Mall", "Emirates Hospital", "GEMS Metropole School",
                        "Dubai Autodrome", "Dubai International Airport (30 min)",
                        "Business Bay (30 min)", "Downtown Dubai (30 min)",
                      ].map((a) => (
                        <span key={a} className="text-xs bg-blue-50 dark:bg-blue-950/30 rounded-full px-2.5 py-1 text-foreground/70">{a}</span>
                      ))}
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            )}

            {/* Map */}
            {isSobhaSolis && (
              <GlassCard>
                <GlassCardHeader><GlassCardTitle className="flex items-center gap-2"><MapPin className="size-4" /> Location</GlassCardTitle></GlassCardHeader>
                <GlassCardContent>
                  <div className="rounded-xl overflow-hidden">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3614.123!2d55.2344!3d25.0456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f6c5e7a7b7b7b%3A0x0!2sMotor+City+Dubai!5e0!3m2!1sen!2sae!4v1"
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Sobha Solis Location"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Motor City, Uptown, Dubai, UAE</p>
                </GlassCardContent>
              </GlassCard>
            )}

            {investment.notes && (
              <GlassCard>
                <GlassCardHeader><GlassCardTitle>Notes</GlassCardTitle></GlassCardHeader>
                <GlassCardContent><p className="text-sm text-muted-foreground">{investment.notes}</p></GlassCardContent>
              </GlassCard>
            )}
          </TabsContent>

          {/* ── PAYMENTS ── */}
          <TabsContent value="payments" className="mt-4">
            <PaymentTable
              payments={investment.payments}
              currency={investment.currency}
              onTogglePaid={handleTogglePaid}
            />
          </TabsContent>

          {/* ── DOCUMENTS ── */}
          <TabsContent value="documents" className="space-y-4 mt-4">
            <div className="flex gap-2">
              <input type="text" value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="Document name" className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              <input type="url" value={docUrl} onChange={(e) => setDocUrl(e.target.value)} placeholder="URL" className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              <button onClick={handleAddDoc} disabled={!docName.trim() || !docUrl.trim()} className="rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm disabled:opacity-50">
                <Plus className="size-4" />
              </button>
            </div>
            {investment.documents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No documents attached yet.</p>
            ) : (
              <div className="space-y-2">
                {investment.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2.5">
                    <FileText className="size-4 text-muted-foreground shrink-0" />
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm text-primary hover:underline flex items-center gap-1">
                      {doc.name} <ExternalLink className="size-3" />
                    </a>
                    <span className="text-xs text-muted-foreground">{new Date(doc.createdAt).toLocaleDateString("en-AU")}</span>
                    <button onClick={() => handleDeleteDoc(doc.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Gallery" className="max-w-[90vw] max-h-[85vh] rounded-xl object-contain" />
        </div>
      )}
    </DashboardLayout>
  );
}
