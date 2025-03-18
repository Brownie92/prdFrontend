import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";

const rpcUrl = import.meta.env.VITE_RPC_URL;
const participationFee =
  parseFloat(import.meta.env.VITE_PARTICIPATION_FEE_SOL) * 1e9;
const teamFee = parseFloat(import.meta.env.VITE_TEAM_FEE_SOL) * 1e9;

const PickMemeButton = ({
  selectedMeme,
  raceId,
  setHasConfirmedMeme,
  hasConfirmedMeme,
}: {
  selectedMeme: string | null;
  raceId: string;
  setHasConfirmedMeme: (confirmed: boolean) => void;
  hasConfirmedMeme: boolean;
}) => {
  const { publicKey, signTransaction, connected, wallet } = useWallet();

  const vaultWallet = new PublicKey(import.meta.env.VITE_VAULT_WALLET);
  const teamWallet = new PublicKey(import.meta.env.VITE_TEAM_WALLET);
  const connection = new Connection(rpcUrl, "confirmed");

  const handleTransaction = async () => {
    if (
      !connected ||
      !publicKey ||
      !signTransaction ||
      !selectedMeme ||
      !wallet
    ) {
      alert("Please select a meme and connect your wallet.");
      return;
    }

    try {
      const transaction = new Transaction();
      const { blockhash } = await connection.getLatestBlockhash("confirmed");
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: vaultWallet,
          lamports: participationFee,
        })
      );

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: teamWallet,
          lamports: teamFee,
        })
      );

      const txid = await wallet?.adapter.sendTransaction(
        transaction,
        connection
      );
      await connection.confirmTransaction(txid, "confirmed");

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/participants/`,
        {
          method: "POST",
          body: JSON.stringify({
            raceId,
            walletAddress: publicKey.toString(),
            memeId: selectedMeme,
            amountSOL: 0.2,
          }),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`);
      }

      setHasConfirmedMeme(true);
      alert("🎉 Transaction successful!");
    } catch (error) {
      alert(
        `Transaction failed: ${error instanceof Error ? error.message : "Unknown error occurred"}`
      );
    }
  };

  return (
    <>
      {!hasConfirmedMeme && (
        <button
          onClick={handleTransaction}
          className="w-full bg-green-400 text-white font-bold py-3 rounded-lg mt-4 hover:bg-green-500 transition shadow-md"
          disabled={!selectedMeme}
        >
          PICK YOUR MEME!
        </button>
      )}
    </>
  );
};

export default PickMemeButton;
