import React, { useState } from "react";
import * as Clipboard from "expo-clipboard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils"; // Assuming you're using cn for class management.

interface CopyToClipboardProps {
  children: React.ReactNode;
  data: string;
  className?: string; // Allows adding custom classes via `nativecn`.
  variant?: "default" | "link" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined; // ButtonProps inferred from the Button component.
}

export default function CopyToClipboard({
  children,
  data,
  className,
  variant,
}: CopyToClipboardProps) {
  const [copiedText, setCopiedText] = useState("");

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(data);
  };

  const fetchCopiedText = async () => {
    const text = await Clipboard.getStringAsync();
    setCopiedText(text);
  };

  return (
    <Button
      onPress={copyToClipboard}
      className={cn(className)} // Merge custom and passed classes.
      variant={variant} // Spread remaining ButtonProps.
    >
      {children}
    </Button>
  );
}
