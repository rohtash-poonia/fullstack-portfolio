import { useMemo } from "react";
import { cn } from "utils/cn";

const Meteors = ({ number = 10 }) => {
  const meteorStyles = useMemo(() => Array.from({ length: number }, (_, index) => ({
    top: -5,
    left: ((index * 173 + 11) % 100) + "%",
    animationDelay: (index % 5) * 0.2 + "s",
    animationDuration: (2 + index % 9) + "s",
  })), [number]);
  return (
    <>
      {[...meteorStyles].map((style, idx) => (
        // Meteor Head
        <span
          key={idx}
          className={cn(
            "pointer-events-none absolute left-1/2 top-1/2 h-0.5 w-0.5 rotate-[215deg] animate-meteor rounded-[9999px] bg-white shadow-[0_0_0_1px_#ffffff10]"
          )}
          style={style}
        >
          {/* Meteor Tail */}
          <div className="pointer-events-none absolute top-1/2 -z-10 h-[1px] w-[50px] -translate-y-1/2 bg-gradient-to-r from-white to-transparent" />
        </span>
      ))}
    </>
  );
};

export default Meteors;
