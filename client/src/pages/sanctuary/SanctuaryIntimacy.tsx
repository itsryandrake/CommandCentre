import { SanctuaryLayout } from "@/components/sanctuary/SanctuaryLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DateNightGenerator from "@/components/sanctuary/inspire/DateNightGenerator";
import SensualMusic from "@/components/sanctuary/inspire/SensualMusic";
import { DareMeCards } from "@/components/sanctuary/games/DareMeCards";
import { PositionExplorer } from "@/components/sanctuary/games/PositionExplorer";

export default function SanctuaryIntimacy() {
  return (
    <SanctuaryLayout title="Intimacy">
      <Tabs defaultValue="date-night" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="date-night">Date Night</TabsTrigger>
          <TabsTrigger value="music">Music</TabsTrigger>
          <TabsTrigger value="dare-me">Dare Me</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
        </TabsList>

        <TabsContent value="date-night">
          <DateNightGenerator />
        </TabsContent>

        <TabsContent value="music">
          <SensualMusic />
        </TabsContent>

        <TabsContent value="dare-me">
          <DareMeCards />
        </TabsContent>

        <TabsContent value="positions">
          <PositionExplorer />
        </TabsContent>
      </Tabs>
    </SanctuaryLayout>
  );
}
