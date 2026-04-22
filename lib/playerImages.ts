import p1 from "../assets/players/player_1.jpeg";
import p2 from "../assets/players/player_2.jpeg";
import p3 from "../assets/players/player_3.jpeg";
import p4 from "../assets/players/player_4.jpeg";
import p5 from "../assets/players/player_5.jpeg";
import p7 from "../assets/players/player_7.jpeg";
import p8 from "../assets/players/player_8.jpeg";
import p9 from "../assets/players/player_9.jpeg";
import p11 from "../assets/players/player_11.jpeg";
import p12 from "../assets/players/player_12.jpeg";
import p13 from "../assets/players/player_13.jpeg";
import p17 from "../assets/players/player_17.jpeg";
import p19 from "../assets/players/player_19.jpeg";
import p20 from "../assets/players/player_20.jpeg";
import p22 from "../assets/players/player_22.jpeg";
import p23 from "../assets/players/player_23.jpeg";
import p26 from "../assets/players/player_26.jpeg";
import p32 from "../assets/players/player_32.jpeg";
import p35 from "../assets/players/player_35.jpeg";
import p36 from "../assets/players/player_36.jpeg";
import p39 from "../assets/players/player_39.jpeg";
import defaultImg from "../assets/players/default.jpg";
import { StaticImageData } from "next/image";

const imageMap: Record<string, StaticImageData> = {
  player_1: p1,
  player_2: p2,
  player_3: p3,
  player_4: p4,
  player_5: p5,
  player_7: p7,
  player_8: p8,
  player_9: p9,
  player_11: p11,
  player_12: p12,
  player_13: p13,
  player_17: p17,
  player_19: p19,
  player_20: p20,
  player_22: p22,
  player_23: p23,
  player_26: p26,
  player_32: p32,
  player_35: p35,
  player_36: p36,
  player_39: p39,
};

export function getPlayerImage(avatarKey: string): StaticImageData {
  return imageMap[avatarKey] ?? defaultImg;
}
