import { SanctuaryLayout } from "@/components/sanctuary/SanctuaryLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileCard } from "@/components/sanctuary/profiles/ProfileCard";
import {
  ryanProfile,
  emilyProfile,
  eroticRecipes,
} from "@/data/sanctuary/profilesData";

export default function SanctuaryProfiles() {
  return (
    <SanctuaryLayout title="Profiles">
      <Tabs defaultValue="both" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="both">Both</TabsTrigger>
          <TabsTrigger value="ryan">Ryan</TabsTrigger>
          <TabsTrigger value="emily">Emily</TabsTrigger>
        </TabsList>

        <TabsContent value="both">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ProfileCard profile={ryanProfile} recipe={eroticRecipes.ryan} />
            <ProfileCard profile={emilyProfile} recipe={eroticRecipes.emily} />
          </div>
        </TabsContent>

        <TabsContent value="ryan">
          <div className="max-w-2xl">
            <ProfileCard profile={ryanProfile} recipe={eroticRecipes.ryan} />
          </div>
        </TabsContent>

        <TabsContent value="emily">
          <div className="max-w-2xl">
            <ProfileCard profile={emilyProfile} recipe={eroticRecipes.emily} />
          </div>
        </TabsContent>
      </Tabs>
    </SanctuaryLayout>
  );
}
