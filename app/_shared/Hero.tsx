"use client";

import React, { useState } from "react";
import { ChevronRight, Loader, Send } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import suggestions from "@/data/constant";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";

function Hero() {
  const [userInput, setUserInput] = useState<string>(""); // fixed
  const [device, setDevice] = useState<string>("website");
  const { user } = useUser();
  const router = useRouter();
  const [loading, setloading] = useState(false);

  const onCreateProject = async () => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    // create new Project
    setloading(true);

    const projectId = crypto.randomUUID(); // browser-safe

    const result = await axios.post("/api/project", {
      userInput: userInput,
      device: device,
      projectId: projectId,
    });

    console.log(result.data);
    setloading(false);

    //Navigate to project Route

    router.push('/project/'+projectId);
  };

  return (
    <div className="p-10 md:px-24 lg:px-48 xl:px-60 mt-20">
      {/* Gradient Banner */}
      <div className="group relative max-w-sm mx-auto flex items-center justify-center rounded-full px-4 py-2 shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f]">
        <span
          className={cn(
            "animate-gradient absolute inset-0 block h-full w-full rounded-full bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:300%_100%] p-[1px]"
          )}
          style={{
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "destination-out",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "subtract",
            WebkitClipPath: "padding-box",
          }}
        />
        <div className="relative z-10 flex items-center gap-2">
          🎉
          <hr className="h-4 w-px bg-neutral-500" />
          <AnimatedGradientText className="text-sm font-medium text-center">
            Introducing Magic UI
          </AnimatedGradientText>
          <ChevronRight className="ml-1 w-4 h-4 stroke-neutral-500 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
        </div>
      </div>

      {/* Hero Title */}
      <h2 className="text-5xl font-bold text-center mt-8">
        Design High Quality{" "}
        <span style={{ color: "var(--primary-color)" }}>
          Website and Mobile App
        </span>{" "}
        Designs
      </h2>
      <p className="text-center text-gray-600 text-lg mt-3">
        Imagine your idea and turn it into reality
      </p>

      {/* Input / Select / Send */}
      <div className="flex mt-6 w-full gap-4 items-center justify-center">
        <InputGroup className="max-w-xl bg-white rounded-2xl">
          <InputGroupTextarea
            data-slot="input-group-control"
            className="flexfield-sizing-content min-h-24 w-full resize-none rounded-md bg-transparent px-3 py-2.5 text-base outline-none transition-[color,box-shadow] md:text-sm"
            placeholder="Enter what design you want to create"
            value={userInput}
            onChange={(event) => setUserInput(event.target.value)}
          />
          <InputGroupAddon align="block-end" className="flex items-center gap-2">
            <Select
              defaultValue="website"
              onValueChange={(value) => setDevice(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
              </SelectContent>
            </Select>

            <InputGroupButton
              className="ml-auto"
              disabled={loading}
              size="sm"
              variant="default"
              aria-label="Send"
              onClick={onCreateProject}
            >
              {loading ? <Loader className="animate-spin" /> : <Send />}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>

      {/* Suggestions */}
      <div className="flex items-center justify-between gap-4 mt-4">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center bg-white cursor-pointer rounded-xl shadow-sm hover:shadow-md transition p-4 flex-1 min-w-[120px]"
            onClick={() => setUserInput(suggestion.description)}
          >
            <div className="mb-2">{suggestion.icon}</div>
            <h3 className="text-sm font-medium text-center">
              {suggestion.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Hero;
