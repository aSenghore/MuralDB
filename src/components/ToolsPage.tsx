import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Shuffle, Copy, RefreshCw, Sparkles, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

interface PromptOptions {
  genre: boolean;
  hairColor: boolean;
  eyeColor: boolean;
  personality: boolean;
  outfit: boolean;
  hairstyle: boolean;
  weapons: boolean;
  gear: boolean;
  magic: boolean;
}

interface GeneratedPrompt {
  genre?: string;
  hairColor?: string;
  eyeColor?: string;
  personality?: string;
  outfit?: string;
  hairstyle?: string;
  weapons?: string;
  gear?: string;
  magic?: string;
}

export function ToolsPage() {
  const [promptOptions, setPromptOptions] = useState<PromptOptions>({
    genre: true,
    hairColor: true,
    eyeColor: true,
    personality: true,
    outfit: true,
    hairstyle: true,
    weapons: true,
    gear: true,
    magic: true,
  });

  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedPrompt | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Data arrays for random generation
  const promptData = {
    genre: [
      'Fantasy', 'Sci-Fi', 'Steampunk', 'Cyberpunk', 'Post-Apocalyptic', 'Medieval', 'Victorian', 'Modern Urban Fantasy',
      'Space Opera', 'Dieselpunk', 'Biopunk', 'Solarpunk', 'Wild West', 'Ancient Mythology', 'Norse', 'Celtic',
      'Japanese Feudal', 'Arabian Nights', 'Pirate', 'Noir Detective', 'Superhero', 'Horror Gothic', 'Fairy Tale'
    ],
    hairColor: [
      'Raven black', 'Platinum blonde', 'Auburn red', 'Chestnut brown', 'Silver-white', 'Deep burgundy',
      'Golden blonde', 'Copper red', 'Ash brown', 'Snow white', 'Midnight blue', 'Forest green',
      'Purple amethyst', 'Rose gold', 'Steel gray', 'Crimson red', 'Honey blonde', 'Chocolate brown',
      'Electric blue', 'Lavender purple', 'Emerald green', 'Sunset orange', 'Strawberry blonde'
    ],
    eyeColor: [
      'Emerald green', 'Sapphire blue', 'Amber gold', 'Deep brown', 'Silver gray', 'Violet purple',
      'Sea foam green', 'Steel blue', 'Honey brown', 'Ice blue', 'Forest green', 'Crimson red',
      'Golden yellow', 'Stormy gray', 'Jade green', 'Royal blue', 'Copper brown', 'Amethyst purple',
      'Turquoise blue', 'Hazel brown', 'Arctic blue', 'Rose quartz pink'
    ],
    personality: [
      'Brave and impulsive', 'Mysterious and calculating', 'Cheerful and optimistic', 'Stoic and reserved',
      'Witty and sarcastic', 'Kind-hearted but naive', 'Ambitious and cunning', 'Gentle and wise',
      'Fierce and protective', 'Curious and adventurous', 'Melancholic and artistic', 'Confident and charismatic',
      'Shy but determined', 'Hot-tempered and passionate', 'Cool-headed and analytical', 'Eccentric and brilliant',
      'Loyal and steadfast', 'Rebellious and free-spirited', 'Cautious and methodical', 'Playful and mischievous',
      'Noble and honorable', 'Brooding and intense', 'Energetic and spontaneous'
    ],
    outfit: [
      'Flowing robes with intricate embroidery', 'Leather armor with metal studs', 'Elegant Victorian dress with lace',
      'Futuristic jumpsuit with glowing accents', 'Tattered cloak over simple clothing', 'Ornate military uniform',
      'Casual modern wear with magical accessories', 'Traditional kimono with weapon holsters', 'Steampunk ensemble with gears',
      'Pirate coat with weathered boots', 'Sleek bodysuit with armor plates', 'Peasant clothing with hidden pockets',
      'Royal garments with jeweled details', 'Post-apocalyptic scavenged gear', 'Monk robes with prayer beads',
      'Scholar robes with scrolls and books', 'Assassin leathers with hidden blades', 'Tribal wear with natural materials',
      'Space suit with environmental controls', 'Merchant attire with money pouches'
    ],
    hairstyle: [
      'Long and flowing', 'Short and spiky', 'Braided with charms', 'Ponytail with ribbons', 'Messy and unkempt',
      'Elegant updo with pins', 'Shaved sides with long top', 'Curly and voluminous', 'Straight and sleek',
      'Multiple small braids', 'Mohawk style', 'Bob cut with bangs', 'Dreadlocks with beads', 'Wavy shoulder-length',
      'Buzz cut', 'Twin tails', 'French braid', 'Man bun', 'Afro with headband', 'Cornrows with patterns',
      'Partially shaved with designs', 'Long with face-framing layers', 'Vintage victory rolls'
    ],
    weapons: [
      'Enchanted sword with glowing runes', 'Dual wielding daggers', 'Ornate bow with magic arrows', 'Ancient staff with crystal',
      'Futuristic energy rifle', 'Traditional katana', 'Throwing knives and stars', 'War hammer with spikes',
      'Crossbow with special bolts', 'Whip with metal barbs', 'Magical grimoire as weapon', 'Pair of chakrams',
      'Scythe with curved blade', 'Pistols with elemental bullets', 'Spear with decorative head', 'Gauntlets with claws',
      'Shield and short sword combo', 'Sniper rifle with scope', 'Chain weapon with weighted end', 'No weapons - martial arts',
      'Magical orb that floats', 'Crossbow pistols', 'Bladed fans'
    ],
    gear: [
      'Utility belt with potions', 'Backpack full of scrolls', 'Enchanted jewelry', 'Climbing gear and ropes',
      'Mechanical gadgets', 'Healing supplies', 'Lock picking tools', 'Survival equipment', 'Communication device',
      'Portable laboratory kit', 'Cartographer supplies', 'Musical instrument', 'Cooking utensils', 'Art supplies',
      'Religious artifacts', 'Merchant scales and coins', 'Spy equipment', 'Arcane focus items', 'Camping gear',
      'Engineering tools', 'Alchemical components', 'Writing materials', 'Timepiece and compass'
    ],
    magic: [
      'Fire elemental magic', 'Ice and frost spells', 'Lightning and storm powers', 'Earth and stone manipulation',
      'Plant and nature magic', 'Shadow and darkness control', 'Light and healing magic', 'Mind reading abilities',
      'Teleportation powers', 'Shape-shifting capability', 'Time manipulation', 'Necromancy and death magic',
      'Illusion and glamour spells', 'Force and kinetic magic', 'Water and ocean powers', 'Air and wind control',
      'Blood magic rituals', 'Crystal and gem magic', 'Sound and sonic abilities', 'Dimensional magic',
      'Alchemy and transmutation', 'Divination and foresight', 'No magical abilities', 'Anti-magic field generation'
    ]
  };

  const handleOptionToggle = (option: keyof PromptOptions) => {
    setPromptOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const generatePrompt = async () => {
    setIsGenerating(true);
    
    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const newPrompt: GeneratedPrompt = {};

    Object.entries(promptOptions).forEach(([key, enabled]) => {
      if (enabled) {
        const dataArray = promptData[key as keyof typeof promptData];
        const randomIndex = Math.floor(Math.random() * dataArray.length);
        newPrompt[key as keyof GeneratedPrompt] = dataArray[randomIndex];
      }
    });

    setGeneratedPrompt(newPrompt);
    setIsGenerating(false);
  };

  const copyPromptToClipboard = () => {
    if (!generatedPrompt) return;

    const promptText = Object.entries(generatedPrompt)
      .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
      .join('\n');

    navigator.clipboard.writeText(promptText).then(() => {
      toast.success('Prompt copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy prompt');
    });
  };

  const enableAllOptions = () => {
    setPromptOptions({
      genre: true,
      hairColor: true,
      eyeColor: true,
      personality: true,
      outfit: true,
      hairstyle: true,
      weapons: true,
      gear: true,
      magic: true,
    });
  };

  const disableAllOptions = () => {
    setPromptOptions({
      genre: false,
      hairColor: false,
      eyeColor: false,
      personality: false,
      outfit: false,
      hairstyle: false,
      weapons: false,
      gear: false,
      magic: false,
    });
  };

  const formatKey = (key: string) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-medium text-foreground flex items-center justify-center gap-2">
          <Wand2 className="h-8 w-8 text-primary" />
          Creative Tools
        </h1>
        <p className="text-muted-foreground">
          Generate random character design prompts to spark your creativity
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Generator Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Character Prompt Generator
            </CardTitle>
            <CardDescription>
              Toggle the elements you want to include in your character prompt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={enableAllOptions}>
                Enable All
              </Button>
              <Button variant="outline" size="sm" onClick={disableAllOptions}>
                Disable All
              </Button>
            </div>

            <Separator />

            {/* Toggle Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(promptOptions).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between space-x-2">
                  <Label htmlFor={key} className="text-sm font-medium cursor-pointer">
                    {formatKey(key)}
                  </Label>
                  <Switch
                    id={key}
                    checked={enabled}
                    onCheckedChange={() => handleOptionToggle(key as keyof PromptOptions)}
                  />
                </div>
              ))}
            </div>

            <Separator />

            {/* Generate Button */}
            <Button 
              onClick={generatePrompt} 
              className="w-full" 
              size="lg"
              disabled={isGenerating || Object.values(promptOptions).every(v => !v)}
            >
              {isGenerating ? (
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Shuffle className="h-5 w-5 mr-2" />
              )}
              {isGenerating ? 'Generating...' : 'Generate Character Prompt'}
            </Button>

            {Object.values(promptOptions).every(v => !v) && (
              <p className="text-sm text-muted-foreground text-center">
                Enable at least one option to generate a prompt
              </p>
            )}
          </CardContent>
        </Card>

        {/* Generated Prompt Display */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Character Prompt</CardTitle>
            <CardDescription>
              Your randomized character design elements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedPrompt ? (
              <>
                <div className="space-y-3">
                  {Object.entries(generatedPrompt).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {formatKey(key)}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground pl-1">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={copyPromptToClipboard}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Prompt
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={generatePrompt}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Shuffle className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 space-y-3">
                <div className="text-muted-foreground">
                  <Wand2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No prompt generated yet</p>
                  <p className="text-sm">Click "Generate Character Prompt" to create one</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips and Information */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Getting Started</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Toggle on/off any character elements you want</li>
                <li>• Click "Generate Character Prompt" to create a random character</li>
                <li>• Use the "Copy Prompt" button to save your results</li>
                <li>• Generate new prompts until you find inspiration</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Tips for Artists</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Try different combinations of enabled elements</li>
                <li>• Use prompts as starting points for your own ideas</li>
                <li>• Mix and match elements from multiple generations</li>
                <li>• Don't be afraid to modify the generated suggestions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}