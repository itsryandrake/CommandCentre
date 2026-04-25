import { SanctuaryLayout } from "@/components/sanctuary/SanctuaryLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DateNightGenerator from "@/components/sanctuary/inspire/DateNightGenerator";
import VisualInspiration from "@/components/sanctuary/inspire/VisualInspiration";
import SensualMusic from "@/components/sanctuary/inspire/SensualMusic";

export default function SanctuaryInspire() {
  return (
    <SanctuaryLayout title="Inspiration">
      <Tabs defaultValue="date-night" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="date-night">Date Night</TabsTrigger>
          <TabsTrigger value="visual">Visual</TabsTrigger>
          <TabsTrigger value="music">Music</TabsTrigger>
        </TabsList>

        <TabsContent value="date-night">
          <DateNightGenerator />
        </TabsContent>

        <TabsContent value="visual">
          <VisualInspiration />
        </TabsContent>

        <TabsContent value="music">
          <SensualMusic />
        </TabsContent>
      </Tabs>
    </SanctuaryLayout>
  );
}
