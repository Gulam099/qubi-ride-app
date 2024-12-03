import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";

export default function LangToggleButton(props:{className?:string}) {
  const [Lang, setLang] = useState("Hello");
  const {className} = props;

  const toggleLang = () => {
    setLang(Lang === "عربي" ? "Hello" : "عربي");
  };

  return (
    <Button onPress={toggleLang} className={cn(className)}>
      <Text>{Lang}</Text>
    </Button>
  );
}
