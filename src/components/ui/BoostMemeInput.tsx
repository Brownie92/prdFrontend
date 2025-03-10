import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import useRaceData from "../../hooks/useRaceData";

// ✅ Voeg een vaste API Base URL toe
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
console.log("[DEBUG] API Base URL:", API_BASE_URL);

interface BoostMemeInputProps {
  raceId: string;
  currentRound: number; // ✅ Voeg currentRound toe als prop
}

const BoostMemeInput: React.FC<BoostMemeInputProps> = ({
  raceId,
  currentRound,
}) => {
  const { publicKey, signTransaction, connected } = useWallet();
  const { fetchBoostsData } = useRaceData();
  const [boostAmount, setBoostAmount] = useState<string>("");
  const [isBoosting, setIsBoosting] = useState(false);
  const [userMeme, setUserMeme] = useState<string | null>(null);
  const [memeData, setMemeData] = useState<{
    memeId: string;
    url: string;
    name: string;
  } | null>(null);

  const vaultWallet = new PublicKey(import.meta.env.VITE_VAULT_WALLET);
  const teamWallet = new PublicKey(import.meta.env.VITE_TEAM_WALLET);
  const connection = new Connection(import.meta.env.VITE_RPC_URL, "confirmed");

  // ✅ **Haal de meme op die de gebruiker in ronde 1 heeft gekozen**
  useEffect(() => {
    const fetchParticipantMeme = async () => {
      if (!publicKey || !raceId) return;
      console.log(
        "[DEBUG] Fetching participant meme for",
        raceId,
        publicKey.toString()
      );

      try {
        const response = await fetch(
          `${API_BASE_URL}/participants/check/${raceId}/${publicKey.toString()}`
        );
        if (!response.ok) return;
        const data = await response.json();
        console.log("[DEBUG] Participant meme:", data);
        setUserMeme(data.memeId);
      } catch (error) {
        console.error("[API] ❌ Error fetching participant meme:", error);
      }
    };

    fetchParticipantMeme();
  }, [publicKey, raceId]);

  // ✅ **Haal meme details op**
  useEffect(() => {
    const fetchMemeData = async () => {
      if (!userMeme) return;
      console.log("[DEBUG] Fetching meme data for memeId:", userMeme);

      try {
        const response = await fetch(`${API_BASE_URL}/memes/${userMeme}`);
        if (!response.ok) return;
        const data = await response.json();
        console.log("[DEBUG] Meme data received:", data);
        setMemeData(data);
      } catch (error) {
        console.error("[API] ❌ Error fetching meme data:", error);
      }
    };

    fetchMemeData();
  }, [userMeme]);

  // ✅ **Check of de gebruiker op de juiste meme inzet**
  const isCorrectMeme = userMeme !== null;
  const isValidBoost = boostAmount && parseFloat(boostAmount) > 0;

  // ✅ **Boost transactie afhandelen**
  const handleBoostTransaction = async () => {
    if (!connected || !publicKey || !signTransaction || !isCorrectMeme) {
      alert("Invalid boost attempt. Check your selected meme and try again.");
      return;
    }

    try {
      setIsBoosting(true);

      const transaction = new Transaction();
      const { blockhash } = await connection.getLatestBlockhash("confirmed");
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const lamports = parseFloat(boostAmount) * 1e9;

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: vaultWallet,
          lamports,
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

      console.log("✅ Boost transaction confirmed:", txid);

      // ✅ **Log boost in backend**
      console.log("[DEBUG] Sending boost data to backend...");
      const response = await fetch(`${API_BASE_URL}/boosts/`, {
        method: "POST",
        body: JSON.stringify({
          raceId,
          walletAddress: publicKey.toString(),
          memeId: userMeme,
          amountSOL: parseFloat(boostAmount),
          round: currentRound, // ✅ Gebruik currentRound
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`);
      }

      console.log("✅ Boost data successfully sent to backend.");
      alert("🎉 Boost successful!");

      // ✅ **Force API refresh voor UI-update**
      await fetchBoostsData(raceId, currentRound);

      setBoostAmount("");
    } catch (error) {
      console.error("❌ Boost transaction failed:", error);
      alert(
        `Transaction failed: ${error instanceof Error ? error.message : "Unknown error occurred"}`
      );
    } finally {
      setIsBoosting(false);
    }
  };

  return (
    <div className="mt-4 flex flex-col items-center">
      {memeData && (
        <div className="flex flex-col items-center mb-4">
          <p className="text-white text-lg font-bold">Your Chosen Meme</p>
          <img
            src={memeData.url}
            alt={memeData.name}
            className="w-24 h-24 rounded-full border-4 border-green-400 shadow-lg"
          />
        </div>
      )}
      {isCorrectMeme ? (
        <>
          <input
            type="number"
            value={boostAmount}
            onChange={(e) => setBoostAmount(e.target.value)}
            className="w-full px-3 py-2 text-center text-black bg-[#FFB877] border border-orange-500 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-600 placeholder-gray-700 shadow-sm"
            placeholder="Enter SOL amount"
            min="0.01"
            step="0.01"
            disabled={isBoosting}
          />
          <button
            onClick={handleBoostTransaction}
            className="w-full bg-green-500 text-white font-bold py-3 rounded-lg mt-3 hover:bg-green-600 transition shadow-lg"
            disabled={!isValidBoost || isBoosting}
          >
            {isBoosting ? "Processing..." : "BOOST MEME!"}
          </button>
        </>
      ) : (
        <p className="text-red-400 text-sm text-center mt-2">
          You can only boost your selected meme!
        </p>
      )}
    </div>
  );
};

export default BoostMemeInput;
