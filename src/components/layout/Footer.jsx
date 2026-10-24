import { useState } from "react";
import { Fade } from "react-reveal";
import { Howl } from "howler";
import Button from "../common/Button";
import FooterBg from "./FooterBg";
import Profiles from "../common/Profiles";
import { MENULINKS } from "../../constants/constants";
import heartClickSoundFile from "../../assets/audio/glug-a.mp3";
import footerCurve from "../../assets/images/footer-curve.svg";

const Footer = () => {
  const [playbackRate, setPlaybackRate] = useState(0.75);

  const heartClickSound = new Howl({
    src: [heartClickSoundFile],
    rate: playbackRate,
    volume: 0.5,
  });

  const handleClick = () => {
    setPlaybackRate((rate) => rate + 0.1);
    heartClickSound.play();
  };

  return (
    <footer
      className="w-full relative select-none bg-cover bg-gradient-to-r from-indigo-900 to-indigo-700"
    >
      <FooterBg />
      <Fade bottom distance={"4rem"}>
        <div className="w-full h-full pt-32">
          <div className="section-container flex flex-col h-full justify-end z-10 items-center py-12">
            <h1 className="font-medium text-3xl md:text-4xl text-center">
              Feel free to connect on social media.
            </h1>
            <div className="text-center">
              <Profiles />
            </div>
            <div className="pt-4 text-center">
              <Button
                href={`#${MENULINKS[5].ref}`}
                classes="link"
                type="secondary"
              >
                Let&apos;s Talk
              </Button>
            </div>
            <p className="text-center text-white text-sm sm:text-base font-medium tracking-wide mt-8">
              Developed with{" "}
              <button onClick={handleClick} className="link cursor-none">
                <span className="block animate-bounce">❤️</span>
              </button>{" "}
              by <span className="text-white">Rohtash poonia</span>
            </p>
          </div>
        </div>
      </Fade>
      <img
        src={footerCurve}
        className="w-full rotate-180"
        alt="footer curve"
        loading="eager"
        height={180}
      />
    </footer>
  );
};

export default Footer;
