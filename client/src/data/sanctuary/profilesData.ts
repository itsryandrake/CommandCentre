// Partner Profiles - Ryan & Emily's profiles, traits, blueprints, erotic recipes

export interface BdsmTrait {
  readonly name: string;
  readonly percentage: number;
}

export interface LoveLanguage {
  readonly rank: number;
  readonly name: string;
}

export interface HumanDesign {
  readonly type: string;
  readonly strategy: string;
  readonly authority: string;
  readonly signature: string;
  readonly notSelf: string;
  readonly description: string;
  readonly birthDetails: string;
}

export interface SexMapTag {
  readonly name: string;
  readonly highlight: boolean;
}

export interface IgniteIdea {
  readonly icon: string;
  readonly title: string;
  readonly desc: string;
}

export interface EroticRecipe {
  readonly name: string;
  readonly preHeating: readonly string[];
  readonly smokeSignals: readonly string[];
  readonly fireStarters: readonly string[];
  readonly lumpsOfCoal: readonly string[];
  readonly closedForBusiness: readonly string[];
  readonly coolDown: readonly string[];
  readonly igniteIdeas: readonly IgniteIdea[];
}

export interface PartnerProfile {
  readonly name: string;
  readonly initial: string;
  readonly role: string;
  readonly eroticBlueprint: {
    readonly type: string;
    readonly description: string;
    readonly quizUrl?: string;
    readonly awaiting?: boolean;
  };
  readonly bdsmTraits: readonly BdsmTrait[];
  readonly sexMapTags: readonly SexMapTag[];
  readonly humanDesign: HumanDesign;
  readonly loveLanguages: {
    readonly receives: readonly LoveLanguage[];
    readonly gives: readonly LoveLanguage[];
  };
}

export const ryanProfile: PartnerProfile = {
  name: "Ryan",
  initial: "R",
  role: "Dominant",
  eroticBlueprint: {
    type: "Shapeshifter",
    description: "Aroused by all Blueprint Types. Speaks all erotic languages and adapts fluidly. The most sophisticated lover when aligned.",
  },
  bdsmTraits: [
    { name: "Dominant", percentage: 93 },
    { name: "Rigger", percentage: 89 },
    { name: "Master", percentage: 86 },
    { name: "Primal (Hunter)", percentage: 78 },
  ],
  sexMapTags: [
    { name: "Power Exchange", highlight: true },
    { name: "Bondage", highlight: true },
    { name: "Role Play", highlight: true },
    { name: "Sensory Play", highlight: false },
    { name: "Impact", highlight: false },
    { name: "Exhibitionism", highlight: false },
  ],
  humanDesign: {
    type: "Manifesting Generator",
    strategy: "To Respond, Then Inform",
    authority: "Emotional (Solar Plexus)",
    signature: "Satisfaction",
    notSelf: "Frustration & Anger",
    description: "Multi-passionate powerhouse designed to respond to life, then move quickly into action. Your sacral energy gives you sustainable power when aligned. Wait for the gut response, ride emotional waves before big decisions, then inform others before acting.",
    birthDetails: "19 Apr 1994 · 19:10 · Port Moresby, PNG",
  },
  loveLanguages: {
    receives: [
      { rank: 1, name: "Words of Affirmation" },
      { rank: 2, name: "Quality Time" },
      { rank: 3, name: "Gifts" },
    ],
    gives: [
      { rank: 1, name: "Gifts" },
      { rank: 2, name: "Words of Affirmation" },
      { rank: 3, name: "Physical Touch" },
    ],
  },
};

export const emilyProfile: PartnerProfile = {
  name: "Emily",
  initial: "E",
  role: "Submissive",
  eroticBlueprint: {
    type: "Awaiting Results",
    description: "Discover your primary erotic language together...",
    quizUrl: "https://missjaiya.com/erotic-blueprint-quiz/",
    awaiting: true,
  },
  bdsmTraits: [],
  sexMapTags: [],
  humanDesign: {
    type: "Manifesting Generator",
    strategy: "To Respond, Then Inform",
    authority: "Sacral",
    signature: "Satisfaction",
    notSelf: "Frustration & Anger",
    description: "Multi-passionate powerhouse designed to respond to life. Your sacral gives immediate \"uh-huh\" (yes) or \"un-uhn\" (no) gut responses. Trust that instant knowing and inform others before taking action.",
    birthDetails: "Birth details pending",
  },
  loveLanguages: {
    receives: [
      { rank: 1, name: "Quality Time" },
      { rank: 2, name: "Acts of Service" },
      { rank: 3, name: "Words of Affirmation" },
    ],
    gives: [
      { rank: 1, name: "Physical Touch" },
      { rank: 2, name: "Words of Affirmation" },
      { rank: 3, name: "Quality Time" },
    ],
  },
};

export const eroticRecipes: Record<'ryan' | 'emily', EroticRecipe> = {
  ryan: {
    name: 'RYAN',
    preHeating: [
      "Quality time together without distractions — put the phones away",
      "Words of affirmation and genuine compliments throughout the day",
      "Physical affection that builds gradually — hand on the small of the back, lingering touches",
      "Feeling desired and wanted — knowing Emily is thinking about me",
      "A clean, tidy space — mental clutter kills the mood",
      "Exercise earlier in the day to feel confident and energised",
    ],
    smokeSignals: [
      "Prolonged eye contact with a knowing look",
      "Moving physically closer, finding excuses to touch",
      "Suggestive comments or double meanings in conversation",
      "Sending a flirty text during the day",
      "Suggesting an early night or afternoon 'rest'",
      "Putting on music and dimming the lights",
    ],
    fireStarters: [
      "Being told explicitly what she wants",
      "Neck kisses from behind, unexpected",
      "Wearing something specifically chosen for me",
      "Initiating with confidence and clear desire",
      "Whispering something dirty in my ear",
      "Taking control and telling me where to go",
    ],
    lumpsOfCoal: [
      "Feeling disconnected or like we haven't really talked",
      "Unresolved tension or conflict that hasn't been addressed",
      "Being overly tired or stressed from work",
      "Feeling like intimacy is an obligation rather than desire",
      "Distractions — phones, TV, unfinished tasks",
      "Lack of enthusiasm or going through the motions",
    ],
    closedForBusiness: [
      "Before 5am — sleep is sacred",
      "When genuinely exhausted (not just tired)",
      "During important work deadlines or high-stress periods",
      "When either of us is unwell",
    ],
    coolDown: [
      "Physical closeness — staying connected, not immediately separating",
      "Genuine words of affirmation about the experience",
      "Quiet time together without jumping to other activities",
      "Gentle touch and stroking — the transition matters",
      "Feeling appreciated and knowing it was good for her too",
      "Sometimes a shower together to extend the intimacy",
    ],
    igniteIdeas: [
      { icon: "💬", title: "Text Him First", desc: "Send a suggestive message during the day. Let him know you're thinking about tonight." },
      { icon: "👁️", title: "Eye Contact", desc: "Hold his gaze longer than usual. Let him see your desire before you say a word." },
      { icon: "🖤", title: "Dress for Him", desc: "Wear something you know he loves. The anticipation starts when he notices." },
      { icon: "✋", title: "Take the Lead", desc: "Don't wait — initiate with confidence. Tell him exactly what you want." },
      { icon: "💋", title: "Neck Kisses", desc: "Come up behind him unexpectedly. Soft kisses on the neck are instant ignition." },
      { icon: "🗣️", title: "Use Your Words", desc: "Whisper what you're going to do to him. Explicit desire is his fire-starter." },
    ],
  },
  emily: {
    name: 'EMILY',
    preHeating: [
      "Feeling emotionally connected — real conversation, not just logistics",
      "Acts of service that show thoughtfulness and care",
      "Feeling beautiful and desired — compliments that feel genuine",
      "Time to transition from 'mum mode' to feeling like myself",
      "A relaxed atmosphere — not rushing into anything",
      "Feeling safe and unhurried",
    ],
    smokeSignals: [
      "Lingering hugs that last longer than usual",
      "Playing with hair or gentle touches",
      "Suggesting we go to bed early together",
      "Wearing something comfortable but cute",
      "Being more affectionate than usual throughout the day",
      "Creating a cozy atmosphere — candles, soft music",
    ],
    fireStarters: [
      "Being desired vocally — hearing exactly what he wants",
      "Dominant energy — being guided and directed",
      "Feeling completely focused on — undivided attention",
      "The anticipation of restraint or power exchange",
      "Deep, intense kisses that communicate urgency",
      "Being told I'm beautiful in a raw, honest way",
    ],
    lumpsOfCoal: [
      "Feeling touched out from the baby",
      "Mental load — thinking about tasks and to-dos",
      "Feeling self-conscious about body after pregnancy",
      "Rushing — needing time to get in the headspace",
      "Not feeling heard or emotionally connected first",
      "Being tired without the energy to fully engage",
    ],
    closedForBusiness: [
      "When completely exhausted from baby duties",
      "If we haven't connected emotionally that day",
      "During the heaviest days of menstruation",
      "When feeling unwell or touched out",
    ],
    coolDown: [
      "Being held — physical closeness and warmth",
      "Words of affirmation — hearing it was good for him",
      "Gentle conversation or comfortable silence together",
      "Not being left alone immediately afterwards",
      "Feeling cared for — water, a warm towel, tenderness",
      "Processing together if we tried something new",
    ],
    igniteIdeas: [
      { icon: "🛁", title: "Create Space", desc: "Help her transition out of 'mum mode'. Run a bath, handle the tasks so she can relax." },
      { icon: "💭", title: "Real Connection", desc: "Have a genuine conversation first. Ask about her day, her thoughts. Emotional connection is her foundation." },
      { icon: "🌹", title: "Make Her Feel Beautiful", desc: "Compliment her specifically and genuinely. Tell her what you see when you look at her." },
      { icon: "⏰", title: "Don't Rush", desc: "Give her time to shift gears. Patience and presence show you want HER, not just sex." },
      { icon: "🎯", title: "Take Control", desc: "Once she's warmed up, be decisive. Guide her with confidence — dominant energy ignites her." },
      { icon: "🔥", title: "Voice Your Desire", desc: "Tell her explicitly what you want to do. Your desire for her is a powerful fire-starter." },
    ],
  },
};

export interface BlueprintContent {
  readonly title: string;
  readonly tagline: string;
  readonly content: string;
}

export const blueprintContent: Record<string, BlueprintContent> = {
  'shapeshifter': {
    title: 'SHAPESHIFTER',
    tagline: 'The master of all erotic languages',
    content: `The Shapeshifter is the most sophisticated of all the Erotic Blueprint types. You are aroused by everything — the energetic, sensual, sexual, and kinky. You speak all erotic languages fluently and can adapt to become an incredible lover for any partner.

As a Shapeshifter, you have insatiable appetites for erotic pleasure and remarkable range in your sexuality. You're like a Stradivarius violin of eroticism — a finely tuned instrument capable of extraordinary depth and variation.

Superpowers: You can shapeshift to please any Blueprint type. Your sexual intelligence allows you to be malleable and cater to anyone. You're erotically expansive and thrive on variety. You have access to ALL the superpowers of every Blueprint type.

Shadow Side: You may feel starved because you're always shapeshifting to feed others' needs while neglecting your own. You might feel "too much" for partners. You can experience ALL the shadows of every Blueprint type, which can be overwhelming.

What Turns You On:
- Variety and novelty in erotic experiences
- Partners who can match your range and enthusiasm
- Moving fluidly between energetic, sensual, sexual, and kinky
- Long, immersive erotic sessions that explore multiple modalities
- Creative exploration and trying new things
- Deep connection combined with raw sexuality

How to Feed a Shapeshifter:
- Embrace variety — don't let sex become routine
- Be willing to explore all the Blueprint types together
- Give them permission to want "all of it"
- Learn to speak multiple erotic languages
- Create space for long, immersive experiences
- Ask what THEY want — they often prioritize their partner's needs

Healing the Shadow: The key to healing the Shapeshifter shadow is to stop always adapting to others and start claiming your own desires. You are NOT too much. The people who've made you feel that way simply couldn't play at your level. Practice asking for what YOU want. Let your partner know your needs matter too. Your incredible range is a gift — but only when you're also being fed.`,
  },
  'manifesting-generator': {
    title: 'MANIFESTING GENERATOR',
    tagline: 'Multi-passionate powerhouse designed for speed and variety',
    content: `Manifesting Generators are one of the five energy types in Human Design, representing about 32-35% of the population. You're a hybrid type combining the sustainable energy of Generators with the initiating power of Manifestors.

You have a defined Sacral Center (your life force energy) and a motor center connected to your Throat, giving you the ability to respond AND move quickly into action. You're designed to be multi-passionate, juggling multiple interests and projects with ease.

Strengths: Incredible energy and stamina when aligned. Natural multi-taskers who find shortcuts to mastery. Fast learners who can accomplish in hours what takes others days. Inspiring and energizing to those around you.

Challenges: Can spread energy too thin across too many projects. May skip steps and need to go back. Can feel frustrated when forced to do things the "normal" way. May struggle with consistency if bored.

Your Strategy - Respond, Then Inform:
- Wait to Respond: Let life come to you. Your Sacral activates when something external sparks your interest
- Trust Your Gut: Your Sacral gives binary yes/no responses — "uh-huh" or "un-uhn"
- Visualize First: Take a moment to imagine the outcome before acting
- Inform Others: Let people know what you're about to do before you do it
- Move Quickly: Once you've responded, you can act fast

If Emotional Authority (Solar Plexus defined): Never make decisions in emotional highs or lows. Ride the wave and wait for clarity. Sleep on big decisions. Your truth reveals itself over time.

If Sacral Authority (Solar Plexus undefined): Trust your immediate gut response. Your Sacral knows instantly. Ask yes/no questions to access it.

Signature (Satisfaction): When you're living in alignment — responding to what lights you up, informing others, and using your energy on things that truly spark joy — you feel deep satisfaction. This is your compass.

Not-Self (Frustration & Anger): When you initiate without responding, override your gut, or feel stuck doing things that don't light you up, you experience frustration (Generator) and anger (Manifestor). These feelings signal misalignment.

Living Your Design:
- It's okay to have many interests — being multi-passionate is your genius
- Empty your energy tank each day through physical activity
- Go to bed only when exhausted; wake up with renewed energy
- Don't force yourself to finish things that no longer light you up
- Surround yourself with environments that honor your varied skills
- Remember: Satisfaction is your guide, frustration is your course-corrector`,
  },
};
