import Image from "next/image";

type NextWallLogoProps = {
  className?: string;
  invert?: boolean;
  priority?: boolean;
};

const LOGO_WIDTH = 770;
const LOGO_HEIGHT = 115;

export default function NextWallLogo({
  className = "h-7 w-auto sm:h-8",
  invert = false,
  priority = false,
}: NextWallLogoProps) {
  return (
    <Image
      src="/nextwall-logo-transparent.png"
      alt="NextWall"
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      quality={100}
      unoptimized
      priority={priority}
      className={[className, invert ? "invert" : ""].filter(Boolean).join(" ")}
    />
  );
}
