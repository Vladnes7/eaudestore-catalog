import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export const buttonMarkup = renderToStaticMarkup(
  <InteractiveHoverButton text="__EAU_BUTTON_TEXT__" className="interactive-hover w-auto px-5 py-2 font-medium" />,
);
