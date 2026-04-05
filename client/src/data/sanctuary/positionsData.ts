// Sex Positions Data

export interface Position {
  readonly id: string;
  readonly name: string;
  readonly category: PositionCategory;
  readonly image: string;
  readonly difficulty: 1 | 2 | 3;
  readonly url: string;
}

export type PositionCategory =
  | 'man-on-top'
  | 'woman-on-top'
  | 'from-behind'
  | 'sitting'
  | 'standing'
  | 'oral';

export const positionsData: readonly Position[] = [
  // Man on Top
  { id: 'p1', name: "Missionary", category: "man-on-top", image: "https://sexinfo101.com/assets/images/positions/mobile/missionary_00.png", difficulty: 1, url: "https://sexinfo101.com/positions/missionary" },
  { id: 'p2', name: "Deep Impact", category: "man-on-top", image: "https://sexinfo101.com/assets/images/positions/mobile/missionary_04.png", difficulty: 2, url: "https://sexinfo101.com/positions/missionary/deep-impact" },
  { id: 'p3', name: "Spread Eagle", category: "man-on-top", image: "https://sexinfo101.com/assets/images/positions/mobile/guard_02.png", difficulty: 1, url: "https://sexinfo101.com/positions/guard/spread-eagle" },
  { id: 'p4', name: "Anvil", category: "man-on-top", image: "https://sexinfo101.com/assets/images/positions/mobile/missionary_06.png", difficulty: 2, url: "https://sexinfo101.com/positions/missionary/anvil" },
  { id: 'p5', name: "Butterfly", category: "man-on-top", image: "https://sexinfo101.com/assets/images/positions/mobile/butterfly_00.png", difficulty: 2, url: "https://sexinfo101.com/positions/butterfly" },
  { id: 'p6', name: "Groundhog", category: "man-on-top", image: "https://sexinfo101.com/assets/images/positions/mobile/groundhog_00.png", difficulty: 1, url: "https://sexinfo101.com/positions/groundhog" },

  // Woman on Top
  { id: 'p7', name: "Cowgirl", category: "woman-on-top", image: "https://sexinfo101.com/assets/images/positions/mobile/cowgirl_00.png", difficulty: 1, url: "https://sexinfo101.com/positions/cowgirl" },
  { id: 'p8', name: "Reverse Cowgirl", category: "woman-on-top", image: "https://sexinfo101.com/assets/images/positions/mobile/rodeo_00.png", difficulty: 2, url: "https://sexinfo101.com/positions/rodeo" },
  { id: 'p9', name: "Asian Cowgirl", category: "woman-on-top", image: "https://sexinfo101.com/assets/images/positions/mobile/cowgirl_02.png", difficulty: 2, url: "https://sexinfo101.com/positions/cowgirl/asian-cowgirl" },
  { id: 'p10', name: "Lotus", category: "woman-on-top", image: "https://sexinfo101.com/assets/images/positions/mobile/lotus_00.png", difficulty: 2, url: "https://sexinfo101.com/positions/lotus" },
  { id: 'p11', name: "Amazon", category: "woman-on-top", image: "https://sexinfo101.com/assets/images/positions/mobile/amazon_01.png", difficulty: 3, url: "https://sexinfo101.com/positions/amazon" },
  { id: 'p12', name: "Lap Dance", category: "woman-on-top", image: "https://sexinfo101.com/assets/images/positions/mobile/lap_dance_00.png", difficulty: 1, url: "https://sexinfo101.com/positions/lap-dance" },

  // From Behind
  { id: 'p13', name: "Doggy Style", category: "from-behind", image: "https://sexinfo101.com/assets/images/positions/mobile/doggy_00.png", difficulty: 1, url: "https://sexinfo101.com/positions/doggystyle" },
  { id: 'p14', name: "Prone Bone", category: "from-behind", image: "https://sexinfo101.com/assets/images/positions/mobile/doggy_05.png", difficulty: 1, url: "https://sexinfo101.com/positions/doggystyle/prone-bone" },
  { id: 'p15', name: "Bulldog", category: "from-behind", image: "https://sexinfo101.com/assets/images/positions/mobile/bull_01.png", difficulty: 2, url: "https://sexinfo101.com/positions/bull" },
  { id: 'p16', name: "Leapfrog", category: "from-behind", image: "https://sexinfo101.com/assets/images/positions/mobile/doggy_02.png", difficulty: 1, url: "https://sexinfo101.com/positions/doggystyle/leapfrog" },
  { id: 'p17', name: "Bodyguard", category: "from-behind", image: "https://sexinfo101.com/assets/images/positions/mobile/bodyguard_01.png", difficulty: 1, url: "https://sexinfo101.com/positions/bodyguard" },
  { id: 'p18', name: "Wheelbarrow", category: "from-behind", image: "https://sexinfo101.com/assets/images/positions/mobile/wheelbarrow_00.png", difficulty: 3, url: "https://sexinfo101.com/positions/wheelbarrow" },

  // Sitting
  { id: 'p19', name: "Cradle", category: "sitting", image: "https://sexinfo101.com/assets/images/positions/mobile/cradle_00.png", difficulty: 2, url: "https://sexinfo101.com/positions/cradle" },
  { id: 'p20', name: "The Chair", category: "sitting", image: "https://sexinfo101.com/assets/images/positions/mobile/butterfly_05.png", difficulty: 1, url: "https://sexinfo101.com/positions/butterfly/the-chair" },
  { id: 'p21', name: "Face to Face", category: "sitting", image: "https://sexinfo101.com/assets/images/positions/mobile/lotus_01.png", difficulty: 2, url: "https://sexinfo101.com/positions/lotus/wrapped-lotus" },
  { id: 'p22', name: "Hot Seat", category: "sitting", image: "https://sexinfo101.com/assets/images/positions/mobile/lap_dance_02.png", difficulty: 1, url: "https://sexinfo101.com/positions/lap-dance/hot-seat" },

  // Standing
  { id: 'p23', name: "Dancer", category: "standing", image: "https://sexinfo101.com/assets/images/positions/mobile/dancer_03.png", difficulty: 2, url: "https://sexinfo101.com/positions/dancer" },
  { id: 'p24', name: "Standing Doggy", category: "standing", image: "https://sexinfo101.com/assets/images/positions/mobile/dancer_01.png", difficulty: 2, url: "https://sexinfo101.com/positions/dancer/standing-doggy" },
  { id: 'p25', name: "Ballet Dancer", category: "standing", image: "https://sexinfo101.com/assets/images/positions/mobile/dancer_00.png", difficulty: 3, url: "https://sexinfo101.com/positions/dancer/ballet-dancer" },
  { id: 'p26', name: "Wall Sit", category: "standing", image: "https://sexinfo101.com/assets/images/positions/mobile/hanger_02.png", difficulty: 3, url: "https://sexinfo101.com/positions/hanger" },

  // Oral
  { id: 'p27', name: "69", category: "oral", image: "https://sexinfo101.com/assets/images/positions/mobile/69_01.png", difficulty: 2, url: "https://sexinfo101.com/positions/69" },
  { id: 'p28', name: "Facesitting", category: "oral", image: "https://sexinfo101.com/assets/images/positions/mobile/cunnilingus_04.png", difficulty: 1, url: "https://sexinfo101.com/positions/cunnilingus/facesitting" },
  { id: 'p29', name: "Kneeling BJ", category: "oral", image: "https://sexinfo101.com/assets/images/positions/mobile/fellatio_00.png", difficulty: 1, url: "https://sexinfo101.com/positions/fellatio" },
  { id: 'p30', name: "Lying Oral", category: "oral", image: "https://sexinfo101.com/assets/images/positions/mobile/cunnilingus_00.png", difficulty: 1, url: "https://sexinfo101.com/positions/cunnilingus" },
] as const;
