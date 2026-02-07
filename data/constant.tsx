import { Store, MapPin, Cpu, BarChart2, ShoppingCart, Coffee, BookOpen } from "lucide-react";

export const suggestions = [
  {
    icon: <MapPin className="w-5 h-5" />,
    name: "Travel Planner App",
    description: "Trip planning dashboard with maps, itineraries, and schedules",
  },
  {
    icon: <Cpu className="w-5 h-5" />,
    name: "AI Learning Platform",
    description: "Interactive platform for AI courses and hands-on projects",
  },
  {
    icon: <BarChart2 className="w-5 h-5" />,
    name: "Finance Tracker",
    description: "Track your expenses, budgets, and financial goals",
  },
  {
    icon: <ShoppingCart className="w-5 h-5" />,
    name: "E-commerce Store",
    description: "Online store with product listings, cart, and checkout",
  },
  {
    icon: <Coffee className="w-5 h-5" />,
    name: "Food Delivery App",
    description: "Order food from local restaurants with real-time tracking",
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    name: "Kids Learning App",
    description: "Educational games and lessons for children",
  },
];

export default suggestions;
