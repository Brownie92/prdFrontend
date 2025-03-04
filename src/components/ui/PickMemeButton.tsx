import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";

const PickMemeButton = ({
  selectedMeme,
  raceId,
  setHasConfirmedMeme,
  hasConfirmedMeme, // ✅ Nieuwe prop
}: {
  selectedMeme: string | null;
  raceId: string;
  setHasConfirmedMeme: (confirmed: boolean) => void;
  hasConfirmedMeme: boolean; // ✅ Nieuwe prop
}) => {
  const { publicKey, signTransaction, connected } = useWallet();

  const vaultWallet = new PublicKey(import.meta.env.VITE_VAULT_WALLET);
  const teamWallet = new PublicKey(import.meta.env.VITE_TEAM_WALLET);
  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );

  // ✅ **Transactie afhandelen**
  const handleTransaction = async () => {
    if (!connected || !publicKey || !signTransaction || !selectedMeme) {
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
          lamports: 0.2 * 1e9,
        })
      );

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: teamWallet,
          lamports: 0.01 * 1e9,
        })
      );

      const signedTransaction = await signTransaction(transaction);
      const txid = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );
      await connection.confirmTransaction(txid, "confirmed");

      console.log("✅ Transaction confirmed:", txid);

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

      console.log("✅ Participant data successfully sent to backend.");
      setHasConfirmedMeme(true);
      alert("🎉 Transaction successful!");
    } catch (error) {
      console.error("❌ Transaction failed:", error);
      alert(
        `Transaction failed: ${error instanceof Error ? error.message : "Unknown error occurred"}`
      );
    }
  };

  return (
    <>
      {!hasConfirmedMeme && ( // ✅ Knop verdwijnt zodra een meme is bevestigd
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
