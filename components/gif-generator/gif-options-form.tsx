"use client";

import { GifOptions } from "@/lib/gif-generator/types";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface GifOptionsFormProps {
  options: GifOptions;
  onChange: (options: GifOptions) => void;
  disabled?: boolean;
}

export function GifOptionsForm({
  options,
  onChange,
  disabled,
}: GifOptionsFormProps) {
  return (
    <div className="space-y-6">
      {/* Frame Delay */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Frame Delay</Label>
          <span className="text-sm text-muted-foreground">
            {options.frameDelay}ms
          </span>
        </div>
        <Slider
          value={[options.frameDelay]}
          onValueChange={([value]) =>
            onChange({ ...options, frameDelay: value })
          }
          min={100}
          max={2000}
          step={100}
          disabled={disabled}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Faster (100ms)</span>
          <span>Slower (2000ms)</span>
        </div>
      </div>

      {/* Output Size */}
      <div className="space-y-2">
        <Label>Output Size</Label>
        <Select
          value={String(options.outputSize)}
          onValueChange={(value) =>
            onChange({ ...options, outputSize: Number(value) as 320 | 480 | 640 })
          }
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="320">Small (320px)</SelectItem>
            <SelectItem value="480">Medium (480px)</SelectItem>
            <SelectItem value="640">Large (640px)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loop Setting */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Loop Animation</Label>
          <p className="text-sm text-muted-foreground">
            {options.loop ? "Plays forever" : "Plays once"}
          </p>
        </div>
        <Switch
          checked={options.loop}
          onCheckedChange={(loop) => onChange({ ...options, loop })}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
