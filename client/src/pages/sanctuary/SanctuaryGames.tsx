import { SanctuaryLayout } from "@/components/sanctuary/SanctuaryLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DareMeCards } from "@/components/sanctuary/games/DareMeCards";
import { DirtyPicture } from "@/components/sanctuary/games/DirtyPicture";
import { FreakOrThink } from "@/components/sanctuary/games/FreakOrThink";
import { PositionExplorer } from "@/components/sanctuary/games/PositionExplorer";

export default function SanctuaryGames() {
  return (
    <SanctuaryLayout title="Games">
      <Tabs defaultValue="dare-me" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="dare-me">Dare Me</TabsTrigger>
          <TabsTrigger value="dirty-picture">Dirty Picture</TabsTrigger>
          <TabsTrigger value="freak-or-think">Freak or Think</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
        </TabsList>

        <TabsContent value="dare-me">
          <DareMeCards />
        </TabsContent>

        <TabsContent value="dirty-picture">
          <DirtyPicture />
        </TabsContent>

        <TabsContent value="freak-or-think">
          <FreakOrThink />
        </TabsContent>

        <TabsContent value="positions">
          <PositionExplorer />
        </TabsContent>
      </Tabs>
    </SanctuaryLayout>
  );
}
