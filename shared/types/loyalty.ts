export interface LoyaltyProgram {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  points: number;
  statusTier: string;
  memberNumber: string;
  benefits: string[];
  colour: string;
  updatedAt: string;
  createdAt: string;
}
