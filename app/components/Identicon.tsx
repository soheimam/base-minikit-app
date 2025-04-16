import Image from "next/image.js";
import React from "react";

export type IdenticonProps = {
  size?: number | string;
  name: string;
};

export const Identicon: React.FC<IdenticonProps> = ({
  // name,
  size = "100%",
}) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        aspectRatio: "1 / 1",
      }}
    >
      <Image src="/snake.png" alt="" height={350} width={350} />
    </div>
  );
};

export default Identicon;
