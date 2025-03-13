import { useWallet } from "@solana/wallet-adapter-react";

const ConnectButton = () => {
  const { select, connect, wallets, connected, connecting } = useWallet();

  const handleWalletConnect = async () => {
    try {
      const modalButton = document.querySelector(
        "button.wallet-adapter-button-trigger"
      );
      if (modalButton) {
        (modalButton as HTMLElement).click();
        return;
      }

      if (wallets.length > 0) {
        await select(wallets[0].adapter.name);
        await new Promise((resolve) => setTimeout(resolve, 500));
        await connect();
      } else {
        alert("No wallets found. Please install a Solana wallet.");
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  if (connected) return null;

  return (
    <button
      onClick={handleWalletConnect}
      className="w-full bg-blue-400 text-white font-bold py-3 rounded-lg mt-4 hover:bg-blue-500 transition shadow-md"
      disabled={connecting}
    >
      {connecting ? "CONNECTING..." : "CONNECT WALLET"}
    </button>
  );
};

export default ConnectButton;
