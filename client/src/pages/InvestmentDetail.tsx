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

// Gallery images for 29 Bearberry Street (scraped from realestate.com.au)
const BANKSIA_BEACH_GALLERY = [
  "https://i2.au.reastatic.net/800x600/0042e9858752d53bdeda07fa777cb9df65a25a0ee39be1cfa3fd0d41cd25d4ef/image.jpg",
  "https://i2.au.reastatic.net/800x600/04ef4242ca3c6da5bb88c5a72abf941ecb8bc6e85739391196cff18bdcc5a56c/image.jpg",
  "https://i2.au.reastatic.net/800x600/18fe270ec7b5d4a61b54adddcf1875dd8a5e1be2ca11d3c56fd872d6c79c300b/image.jpg",
  "https://i2.au.reastatic.net/800x600/1a376857b21f75fd72a16e95592fc9aa14da32bde10d1808da3817360ef981e0/image.jpg",
  "https://i2.au.reastatic.net/800x600/2d0cda287e3d35513f7e600dfa9f27ebdd861963199219d44a94f2e9a6df961e/image.jpg",
  "https://i2.au.reastatic.net/800x600/3d7e380f2afcb21a9377c963a83191c088051012dce3bec8734e9993b5177ebe/image.jpg",
  "https://i2.au.reastatic.net/800x600/46f2664bcd8f2c74fa9303265efca379bcb8722ccd5c8b005421a500aeaffb33/image.jpg",
  "https://i2.au.reastatic.net/800x600/4e48b191f1112f066b5df05ca9f54468b1ea6705b49da7e7becbe1114d68a590/image.jpg",
  "https://i2.au.reastatic.net/800x600/4f128996454854ea54040a74ad50408ca20bd7cd9d97c5766746571b4677bc0b/image.jpg",
  "https://i2.au.reastatic.net/800x600/5e02f6afa1ea3d4ac7bbe23f3e553355e71cebebd461c91e64d67b829f90c029/image.jpg",
  "https://i2.au.reastatic.net/800x600/627a32b16304997544809b098404020980a721c1834b6cd117a36d1c8b8d0139/image.jpg",
  "https://i2.au.reastatic.net/800x600/66cfe37bc0abd801f4005fc2fdd65e148bcfb98e2b3c4b1816730cca12cd915d/image.jpg",
  "https://i2.au.reastatic.net/800x600/a2bcd0fc579cdc73ce9df51c1373f347c505c0b9a9688f79aaa5175e06780468/image.jpg",
  "https://i2.au.reastatic.net/800x600/b6a72f6f513f0158398d2e963d5a1c0c0c6773d0d525f94b17519baa8c391248/image.png",
  "https://i2.au.reastatic.net/800x600/bad33e7e918980b844dc56d29fbfdffc3028c33c30910940ccc01df296e75ba2/image.jpg",
  "https://i2.au.reastatic.net/800x600/bd3441e47a022de0571ac4fed01782b9aee2c29524f1c57b1acb097b338c9a24/image.jpg",
  "https://i2.au.reastatic.net/800x600/ca0b3570a2a2a95bc3dd81b5bafef728d375999b35a555553c6f0db2ffe65b0b/image.jpg",
  "https://i2.au.reastatic.net/800x600/ccdfd4c15b51b1b635cadda419895e8add0b40619a806771fd2f442aac2eb2bd/image.jpg",
  "https://i2.au.reastatic.net/800x600/d8d25c22154ceafcf54c96e21e2364b8ecfec9bcae71ed01c73ca6b9ea525dd1/image.jpg",
  "https://i2.au.reastatic.net/800x600/f7fc44a070148abde1a6d86c2973ac26b094b1aa9e41a2772751ff16ffdebf7b/image.jpg",
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

  // Check which property for gallery/map/details
  const isSobhaSolis = investment.name.toLowerCase().includes("sobha solis");
  const isBanksiaBeach = investment.name.toLowerCase().includes("bearberry") || investment.location?.toLowerCase().includes("banksia beach");
  const gallery = isSobhaSolis ? SOBHA_SOLIS_GALLERY : isBanksiaBeach ? BANKSIA_BEACH_GALLERY : [];

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
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([investment.location, investment.country].filter(Boolean).join(", "))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <MapPin className="size-3" />{[investment.location, investment.country].filter(Boolean).join(", ")}
                </a>
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
            {/* Key stats — Banksia Beach shows property value + mortgage info */}
            {isBanksiaBeach ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassCard className="bg-blue-50/50 dark:bg-blue-950/20">
                  <div className="text-[10px] font-bold tracking-widest text-muted-foreground">PURCHASE PRICE</div>
                  <div className="text-lg font-bold font-mono">{formatCurrency(investment.purchasePriceAud)}</div>
                  <div className="text-xs text-muted-foreground">Land purchased 2020</div>
                </GlassCard>
                <GlassCard className="bg-green-50/50 dark:bg-green-950/20">
                  <div className="text-[10px] font-bold tracking-widest text-muted-foreground">ESTIMATED VALUE</div>
                  <div className="text-lg font-bold font-mono text-green-600">$1,400,000</div>
                  <div className="text-xs text-muted-foreground">+$1,108,000 since purchase</div>
                </GlassCard>
                <GlassCard className="bg-amber-50/50 dark:bg-amber-950/20">
                  <div className="text-[10px] font-bold tracking-widest text-muted-foreground">MORTGAGE REMAINING</div>
                  <div className="text-lg font-bold font-mono text-amber-600">$412,945</div>
                  <div className="text-xs text-muted-foreground">of $458,391 approved</div>
                </GlassCard>
                <GlassCard>
                  <div className="text-[10px] font-bold tracking-widest text-muted-foreground">LAND SIZE</div>
                  <div className="text-lg font-bold font-mono">{investment.areaSqm || 713} sqm</div>
                  <div className="text-xs text-muted-foreground">Built 2021</div>
                </GlassCard>
              </div>
            ) : (
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
            )}

            {/* Progress bar (for off-plan/construction payment tracking) */}
            {!isBanksiaBeach && (
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Payment Progress</span>
                  <span>{paidPct}% paid</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${paidPct}%` }} />
                </div>
              </div>
            )}

            {/* Mortgage progress bar for Banksia Beach */}
            {isBanksiaBeach && (
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Mortgage Repayment Progress</span>
                  <span>{Math.round(((458391 - 412945.07) / 458391) * 100)}% repaid</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${((458391 - 412945.07) / 458391) * 100}%` }} />
                </div>
              </div>
            )}

            {/* Photo Gallery */}
            {gallery.length > 0 && (
              <GlassCard>
                <GlassCardHeader>
                  <GlassCardTitle className="flex items-center gap-2">
                    <ImageIcon className="size-4" /> Gallery
                  </GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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

            {/* Banksia Beach — Property Details */}
            {isBanksiaBeach && (
              <GlassCard>
                <GlassCardHeader><GlassCardTitle>Property Details</GlassCardTitle></GlassCardHeader>
                <GlassCardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Property Type</p>
                      <p className="font-medium">House</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Bedrooms</p>
                      <p className="font-medium">4</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Bathrooms</p>
                      <p className="font-medium">2</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Car Spaces</p>
                      <p className="font-medium">2</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Land Size</p>
                      <p className="font-medium">713 sqm</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Floor Area</p>
                      <p className="font-medium">370 sqm</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Year Built</p>
                      <p className="font-medium">2021</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Council</p>
                      <p className="font-medium">Moreton Bay</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Internet</p>
                      <p className="font-medium">NBN FTTP</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Features</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Solar Panels", "4G Coverage", "NBN Fibre to Premises",
                      ].map((a) => (
                        <span key={a} className="text-xs bg-muted/60 rounded-full px-2.5 py-1 text-foreground/80">{a}</span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Overlays</p>
                    <div className="flex flex-wrap gap-2">
                      {["Bushfire Overlay", "Flood Overlay"].map((a) => (
                        <span key={a} className="text-xs bg-amber-50 dark:bg-amber-950/30 rounded-full px-2.5 py-1 text-amber-700 dark:text-amber-300">{a}</span>
                      ))}
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            )}

            {/* Banksia Beach — Mortgage Details */}
            {isBanksiaBeach && (
              <GlassCard>
                <GlassCardHeader><GlassCardTitle>Mortgage Details</GlassCardTitle></GlassCardHeader>
                <GlassCardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Lender</p>
                      <p className="font-medium">Bendigo Bank</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Product</p>
                      <p className="font-medium">Bendigo Flex Variable Home Loan</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Interest Rate</p>
                      <p className="font-medium">6.04% <span className="text-xs text-muted-foreground">(variable)</span></p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Approval Amount</p>
                      <p className="font-medium">$458,391.00</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Current Balance</p>
                      <p className="font-medium text-amber-600">$412,945.07</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Payment Frequency</p>
                      <p className="font-medium">Monthly</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Remaining Repayments</p>
                      <p className="font-medium">294</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Next Payment Due</p>
                      <p className="font-medium">2 May 2026</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Loan Opened</p>
                      <p className="font-medium">2 Dec 2025</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">BSB</p>
                      <p className="font-medium">633000</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Account No.</p>
                      <p className="font-medium">704664887</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">In Arrears</p>
                      <p className="font-medium text-red-600">Yes — $2,631.00</p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      Estimated equity: <span className="font-bold">$987,055</span> (current value $1,400,000 minus mortgage $412,945)
                    </p>
                  </div>
                </GlassCardContent>
              </GlassCard>
            )}

            {/* Map */}
            {isBanksiaBeach && (
              <GlassCard>
                <GlassCardHeader><GlassCardTitle className="flex items-center gap-2"><MapPin className="size-4" /> Location</GlassCardTitle></GlassCardHeader>
                <GlassCardContent>
                  <div className="rounded-xl overflow-hidden">
                    <iframe
                      src="https://maps.google.com/maps?q=-27.02505779,153.15108905&z=17&output=embed"
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="29 Bearberry Street, Banksia Beach"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">29 Bearberry Street, Banksia Beach QLD 4507</p>
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
