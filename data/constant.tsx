import {
  Store,
  MapPin,
  Cpu,
  BarChart2,
  ShoppingCart,
  Coffee,
  BookOpen,
} from "lucide-react";
import { themeToCssVars } from "./Themes";

export const suggestions = [
  {
    icon: <MapPin className="w-5 h-5" />,
    name: "Travel Planner App",
    description:
      "Trip planning dashboard with maps, itineraries, and schedules",
  },
  {
    icon: <Cpu className="w-5 h-5" />,
    name: "AI Learning Platform",
    description:
      "Interactive platform for AI courses and hands-on projects",
  },
  {
    icon: <BarChart2 className="w-5 h-5" />,
    name: "Finance Tracker",
    description:
      "Track your expenses, budgets, and financial goals",
  },
  {
    icon: <ShoppingCart className="w-5 h-5" />,
    name: "E-commerce Store",
    description:
      "Online store with product listings, cart, and checkout",
  },
  {
    icon: <Coffee className="w-5 h-5" />,
    name: "Food Delivery App",
    description:
      "Order food from local restaurants with real-time tracking",
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    name: "Kids Learning App",
    description:
      "Educational games and lessons for children",
  },
];

export default suggestions;

/**
 * Wraps HTML content inside a full HTML document with Tailwind + theme support
 */
export const HtmlWrapper = (theme: any, htmlCode: string) => {
  const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>

  <!-- Tailwind CDN -->
  <script src="https://cdn.tailwindcss.com"></script>

  <style>
    ${theme ? themeToCssVars(theme) : ""}

    html, body {
      background: var(--background) !important;
      color: var(--foreground) !important;
      margin: 0;
      padding: 0;
    }

    /* Override Tailwind backgrounds */
    .bg-white, .bg-gray-50, .bg-gray-100, .bg-gray-200,
    .bg-gray-300, .bg-gray-800, .bg-gray-900 {
      background: var(--card) !important;
    }

    /* Override text colors */
    .text-black, .text-gray-900, .text-gray-800,
    .text-gray-700, .text-gray-600 {
      color: var(--foreground) !important;
    }

    /* Override borders */
    .border, .border-gray-200, .border-gray-300, .border-gray-400 {
      border-color: var(--border) !important;
    }

    /* Global inheritance */
    * {
      background-color: inherit;
      color: inherit;
    }

    /* Button styling */
    button {
      background: var(--primary) !important;
      color: var(--primary-foreground) !important;
    }
  </style>
</head>

<body>
  <script>
    console.log("🎨 THEME INSIDE IFRAME:", "${theme}");
  </script>

  ${htmlCode ?? ""}
</body>
</html>
`;

  return html;
};