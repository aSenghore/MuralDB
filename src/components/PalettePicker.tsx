import * as React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Palette, Copy, Lock, Unlock, Pipette } from 'lucide-react';
import { toast } from 'sonner';

interface ColorData {
    hex: string;
    label: string;
    locked: boolean;
}

export function PalettePicker() {
    const [colors, setColors] = useState<ColorData[]>([
        { hex: '#808080', label: 'Color', locked: false },
        { hex: '#808080', label: 'Complementary', locked: false },
        { hex: '#808080', label: 'Extra 1', locked: false },
        { hex: '#808080', label: 'Extra 2', locked: false },
        { hex: '#808080', label: 'Extra 3', locked: false },
    ]);
    const [customColor, setCustomColor] = useState<string>('#3b82f6');
    const [customShades, setCustomShades] = useState<string[]>([]);

    // Generate a random hex color
    const generateRandomColor = (): string => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    // Convert hex to RGB
    const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    };

    // Convert RGB to HSL
    const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        let s = 0;
        const l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r:
                    h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                    break;
                case g:
                    h = ((b - r) / d + 2) / 6;
                    break;
                case b:
                    h = ((r - g) / d + 4) / 6;
                    break;
            }
        }

        return { h: h * 360, s, l };
    };

    // Convert HSL to RGB
    const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
        h /= 360;

        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p: number, q: number, t: number) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    };

    // Convert RGB to hex
    const rgbToHex = (r: number, g: number, b: number): string => {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('').toUpperCase();
    };

    // Get complementary color
    const getComplementaryColor = (hex: string): string => {
        const rgb = hexToRgb(hex);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

        // Add 180 degrees to hue for complementary color
        let newHue = (hsl.h + 180) % 360;

        const newRgb = hslToRgb(newHue, hsl.s, hsl.l);
        return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    };

    // Generate palette
    const generatePalette = () => {
        const newColors = [...colors];

        // Color 1: Random (unless locked)
        if (!newColors[0].locked) {
            newColors[0].hex = generateRandomColor();
        }

        // Color 2: Complementary to Color 1 (unless locked)
        if (!newColors[1].locked) {
            newColors[1].hex = getComplementaryColor(newColors[0].hex);
        }

        // Colors 3-5: Random (unless locked)
        for (let i = 2; i < 5; i++) {
            if (!newColors[i].locked) {
                newColors[i].hex = generateRandomColor();
            }
        }

        setColors(newColors);
        toast.success('Palette generated!');
    };

    // Toggle lock on a color
    const toggleLock = (index: number) => {
        const newColors = [...colors];
        newColors[index].locked = !newColors[index].locked;
        setColors(newColors);
    };

    // Copy color to clipboard
    const copyColor = (hex: string, label: string) => {
        navigator.clipboard.writeText(hex).then(() => {
            toast.success(`${label} (${hex}) copied to clipboard!`);
        }).catch(() => {
            toast.error('Failed to copy color');
        });
    };

    // Copy entire palette
    const copyPalette = () => {
        const paletteText = colors.map(c => `${c.label}: ${c.hex}`).join('\n');
        navigator.clipboard.writeText(paletteText).then(() => {
            toast.success('Palette copied to clipboard!');
        }).catch(() => {
            toast.error('Failed to copy palette');
        });
    };

    // Generate random shades from a base color
    const generateCustomShades = (baseColor: string) => {
        const rgb = hexToRgb(baseColor);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

        const shades: string[] = [baseColor]; // Start with the base color

        // Generate 9 random variations
        for (let i = 0; i < 9; i++) {
            // Randomly vary hue, saturation, and lightness
            const hueVariation = (Math.random() - 0.5) * 30; // ±15 degrees
            const satVariation = (Math.random() - 0.5) * 0.3; // ±0.15
            const lightVariation = (Math.random() - 0.5) * 0.4; // ±0.2

            let newHue = (hsl.h + hueVariation + 360) % 360;
            let newSat = Math.max(0, Math.min(1, hsl.s + satVariation));
            let newLight = Math.max(0.1, Math.min(0.9, hsl.l + lightVariation));

            const newRgb = hslToRgb(newHue, newSat, newLight);
            shades.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
        }

        setCustomShades(shades);
        toast.success('Shades generated!');
    };

    // Copy custom shades
    const copyCustomShades = () => {
        const shadesText = customShades.join('\n');
        navigator.clipboard.writeText(shadesText).then(() => {
            toast.success('Shades copied to clipboard!');
        }).catch(() => {
            toast.error('Failed to copy shades');
        });
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-primary" />
                        Color Palette Generator
                    </CardTitle>
                    <CardDescription>
                        Generate harmonious color palettes with complementary colors. Lock colors to keep them while generating new palettes.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Generate Button */}
                    <Button onClick={generatePalette} className="w-full" size="lg">
                        <Palette className="h-5 w-5 mr-2" />
                        Go!
                    </Button>

                    {/* Color Display */}
                    <div className="grid grid-cols-3 gap-4">
                        {colors.map((color, index) => (
                            <div key={index} className="space-y-2">
                                <div className="relative group">
                                    {/* Color Swatch */}
                                    <div
                                        className="w-full h-32 rounded-lg border-2 border-border shadow-sm transition-transform hover:scale-105"
                                        style={{ backgroundColor: color.hex }}
                                    />

                                    {/* Lock Button Overlay */}
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => toggleLock(index)}
                                    >
                                        {color.locked ? (
                                            <Lock className="h-4 w-4" />
                                        ) : (
                                            <Unlock className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>

                                {/* Color Info */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <Badge variant={color.locked ? "default" : "secondary"} className="text-xs">
                                            {color.label}
                                            {color.locked && <Lock className="h-3 w-3 ml-1" />}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <code className="text-xs bg-muted px-2 py-1 rounded flex-1 text-center">
                                            {color.hex}
                                        </code>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0"
                                            onClick={() => copyColor(color.hex, color.label)}
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Copy Palette Button */}
                    <Button variant="outline" onClick={copyPalette} className="w-full">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Entire Palette
                    </Button>
                </CardContent>
            </Card>

            {/* Custom Color Shade Generator */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Pipette className="h-5 w-5 text-primary" />
                        Custom Color Shades
                    </CardTitle>
                    <CardDescription>
                        Pick a color and generate 9 random shades based on it.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Color Picker Input */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium">Pick a Color</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        type="color"
                                        value={customColor}
                                        onChange={(e) => setCustomColor(e.target.value)}
                                        className="h-12 cursor-pointer"
                                    />
                                </div>
                                <Input
                                    type="text"
                                    value={customColor}
                                    onChange={(e) => setCustomColor(e.target.value)}
                                    className="w-32 font-mono"
                                    placeholder="#000000"
                                />
                            </div>
                        </div>
                        <div className="pt-8">
                            <Button
                                onClick={() => generateCustomShades(customColor)}
                                size="lg"
                            >
                                <Pipette className="h-4 w-4 mr-2" />
                                Generate Shades
                            </Button>
                        </div>
                    </div>

                    {/* Display Shades */}
                    {customShades.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium">Generated Shades</h4>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={copyCustomShades}
                                >
                                    <Copy className="h-3 w-3 mr-2" />
                                    Copy All
                                </Button>
                            </div>
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {customShades.map((shade, index) => (
                                    <div key={index} className="flex-shrink-0 space-y-2 w-28">
                                        <div className="relative group">
                                            <div
                                                className="w-full h-24 rounded-lg border-2 border-border shadow-sm transition-transform hover:scale-105 cursor-pointer"
                                                style={{ backgroundColor: shade }}
                                                onClick={() => copyColor(shade, index === 0 ? 'Base Color' : `Shade ${index}`)}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Copy className="h-5 w-5 text-white drop-shadow-lg" />
                                            </div>
                                        </div>
                                        <code className="text-xs bg-muted px-2 py-1 rounded block text-center truncate">
                                            {shade}
                                        </code>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Tips */}
            <Card>
                <CardHeader>
                    <CardTitle>How to Use</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-6 text-sm">
                        <div className="space-y-2">
                            <h4 className="font-medium">Color Generation</h4>
                            <ul className="space-y-1 text-muted-foreground">
                                <li>• Click "Go!" to generate a new color palette</li>
                                <li>• The first color is randomly generated</li>
                                <li>• The second color is complementary to the first</li>
                                <li>• The last three colors are random extras</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-medium">Locking Colors</h4>
                            <ul className="space-y-1 text-muted-foreground">
                                <li>• Hover over a color and click the lock icon to keep it</li>
                                <li>• Locked colors won't change when generating new palettes</li>
                                <li>• Click the lock again to unlock the color</li>
                                <li>• Copy individual colors or the entire palette</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
