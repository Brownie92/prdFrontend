import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import { useState } from "react";

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
  const [isLoading, setIsLoading] = useState(false);
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
      setIsLoading(true);

      // Check wallet balance
      const walletBalance = await connection.getBalance(publicKey);
      const requiredBalance = participationFee + teamFee + 0.000005 * 1e9; // Extra fee buffer

      if (walletBalance < requiredBalance) {
        alert(`Insufficient balance for this transaction`);
        setIsLoading(false);
        return;
      }

      const transaction = new Transaction();
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");

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

      const signature = await wallet.adapter.sendTransaction(
        transaction,
        connection
      );

      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed"
      );

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
      console.error("Transaction error:", error);
      alert(
        `Transaction failed: ${error instanceof Error ? error.message : "Unknown error occurred"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!hasConfirmedMeme && (
        <button
          onClick={handleTransaction}
          className="w-full bg-green-400 text-white font-bold py-3 rounded-lg mt-4 hover:bg-green-500 transition shadow-md"
          disabled={isLoading || !selectedMeme}
        >
          {isLoading ? "Processing..." : "PICK YOUR MEME!"}
        </button>
      )}
    </>
  );
};

export default PickMemeButton;
