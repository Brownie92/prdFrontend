import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

const useWalletActions = () => {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();

  const handlePickMeme = (selectedMeme: string | null) => {
    if (!connected) {
      setVisible(true);
    } else {
      console.log(`Meme selected: ${selectedMeme}`);
    }
  };

  return { connected, handlePickMeme };
};

export default useWalletActions;