import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";

const PickMemeButton = ({
  selectedMeme,
  setSelectedMeme,
  connected,
  raceId,
}: {
  selectedMeme: string | null;
  setSelectedMeme: (memeId: string | null) => void;
  connected: boolean;
  raceId: string;
}) => {
  const { publicKey, signTransaction } = useWallet(); // Wallet details voor de transactie

  // ✅ Haal de vault en team wallet op uit de .env variabelen
  const vaultWallet = new PublicKey(import.meta.env.VITE_VAULT_WALLET);
  const teamWallet = new PublicKey(import.meta.env.VITE_TEAM_WALLET);

  // ✅ Devnet verbinding instellen
  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );

  const handleTransaction = async () => {
    // ✅ Extra validatie om fouten te voorkomen
    if (!connected) {
      alert("Please connect your wallet.");
      return;
    }
    if (!publicKey) {
      alert("Public key is missing. Try reconnecting your wallet.");
      return;
    }
    if (!selectedMeme) {
      alert("Please select a meme before proceeding.");
      return;
    }
    if (!signTransaction) {
      alert("Transaction signing function is not available.");
      return;
    }

    try {
      // ✅ Start de transactie
      const transaction = new Transaction();

      // ✅ Haal de meest recente blockhash op voor de transactie
      const { blockhash } = await connection.getLatestBlockhash("confirmed");
      transaction.recentBlockhash = blockhash;

      // ✅ Stel de fee payer in als de gebruiker zelf
      transaction.feePayer = publicKey;

      // ✅ Definieer de bedragen voor vault en fee
      const amountVault = 0.2 * 1e9; // 0.2 SOL in lamports
      const amountFee = 0.01 * 1e9; // 0.01 SOL in lamports

      // ✅ Voeg overdrachten toe aan de transactie
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: vaultWallet,
          lamports: amountVault,
        })
      );

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: teamWallet,
          lamports: amountFee,
        })
      );

      console.log("🔄 Signing transaction...");

      // ✅ Onderteken de transactie met de wallet
      const signedTransaction = await signTransaction(transaction);

      console.log("🚀 Sending transaction...");

      // ✅ Verstuur de transactie naar het netwerk
      const txid = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );
      console.log("✅ Transaction sent:", txid);

      // ✅ Wacht op bevestiging van de transactie
      await connection.confirmTransaction(txid, "confirmed");
      console.log("🎉 Transaction confirmed:", txid);

      // ✅ Verstuur de deelnamegegevens naar de backend
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/participants/`,
        {
          method: "POST",
          body: JSON.stringify({
            raceId,
            walletAddress: publicKey.toString(),
            memeId: selectedMeme,
            amountSOL: 0.2, // De totale ingezette SOL
          }),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`);
      }

      console.log("✅ Participant data successfully sent to backend.");

      // ✅ Reset de geselecteerde meme na succesvolle transactie
      setSelectedMeme(null);
      alert("🎉 Transaction successful!");
    } catch (error) {
      console.error("❌ Transaction failed:", error);

      // ✅ Controleer of het een Error-object is, anders gebruik een standaard melding
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      alert(`Transaction failed: ${errorMessage}`);
    }
  };

  return (
    <button
      onClick={handleTransaction}
      className="w-full bg-green-400 text-white font-bold py-3 rounded-lg mt-4 hover:bg-green-500 transition shadow-md"
    >
      PICK YOUR MEME!
    </button>
  );
};

export default PickMemeButton;
