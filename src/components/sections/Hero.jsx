import { SplineScene } from "../ui/Splite";
import { ROBOT_SCENE } from "../ui/spline-loader";

const Hero = () => (
  <section
    aria-label="Interactive robot"
    className="w-full h-screen relative"
  >
    <SplineScene scene={ROBOT_SCENE} className="w-full h-full" />
  </section>
);

export default Hero;
