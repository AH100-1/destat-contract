import { createModal } from "@rabby-wallet/rabbykit";
import { createConfig, http } from "@wagmi/core";
import { hardhat } from "@wagmi/core/chains";

// wallet connector kits: rainbowkit, appkit, rabbykit ...
// 로컬 hardhat 노드(31337)에 연결
export const config = createConfig({
  chains: [hardhat],
  transports: {
    [hardhat.id]: http(),
  },
});

export const rabbykit = createModal({
  wagmi: config,
});
