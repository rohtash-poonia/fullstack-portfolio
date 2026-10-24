import { useState } from "react";

export default function Stars({ count = 30 }) {
  // Random placement is stable for the life of the section, including slider/form updates.
  const [stars] = useState(() => Array.from({ length: count }, () => ({
    top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
    width: `${Math.random() * 3}px`, height: `${Math.random() * 3}px`,
    "--duration": `${2 + Math.random() * 3}s`,
  })));
  return <div className="stars-container" aria-hidden="true">
    {stars.map((style, index) => <span key={index} className="star" style={style} />)}
  </div>;
}
