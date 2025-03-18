import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import useRaceData from "../../hooks/useRaceData";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface BoostMemeInputProps {
  raceId: string;
  currentRound: number;
}

const BoostMemeInput: React.FC<BoostMemeInputProps> = ({
  raceId,
  currentRound,
}) => {
  const { publicKey, connected, wallet } = useWallet();
  const { fetchBoostsData } = useRaceData();
  const [boostAmount, setBoostAmount] = useState<string>("");
  const [isBoosting, setIsBoosting] = useState(false);
  const [userMeme, setUserMeme] = useState<string | null>(null);
  const [memeData, setMemeData] = useState<{
    memeId: string;
    url: string;
    name: string;
  } | null>(null);

  const vaultWalletKey = import.meta.env.VITE_VAULT_WALLET;
  const teamWalletKey = import.meta.env.VITE_TEAM_WALLET;

  if (!vaultWalletKey || !teamWalletKey) {
    throw new Error(
      "❌ Environment variables VITE_VAULT_WALLET or VITE_TEAM_WALLET are missing."
    );
  }

  const vaultWallet = new PublicKey(vaultWalletKey);
  const teamWallet = new PublicKey(teamWalletKey);
  const teamFeeSOL =
    parseFloat(import.meta.env.VITE_TEAM_FEE_SOL || "0.01") * 1e9;
  const connection = new Connection(import.meta.env.VITE_RPC_URL, "confirmed");

  // Fetch the meme chosen by the user in round 1
  useEffect(() => {
    const fetchParticipantMeme = async () => {
      if (!publicKey || !raceId) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/participants/check/${raceId}/${publicKey.toString()}`
        );
        if (!response.ok) return;
        const data = await response.json();
        setUserMeme(data.memeId);
      } catch (error) {
        console.error("[API] ❌ Error fetching participant meme:", error);
      }
    };

    fetchParticipantMeme();
  }, [publicKey, raceId]);

  // Fetch meme details
  useEffect(() => {
    const fetchMemeData = async () => {
      if (!userMeme) return;

      try {
        const response = await fetch(`${API_BASE_URL}/memes/${userMeme}`);
        if (!response.ok) return;
        const data = await response.json();
        setMemeData(data);
      } catch (error) {
        console.error("[API] ❌ Error fetching meme data:", error);
      }
    };

    fetchMemeData();
  }, [userMeme]);

  // Display Boost Input only if a meme is selected in rounds 2-6
  if (!userMeme || currentRound < 2 || currentRound > 6) {
    return null;
  }

  const handleBoostTransaction = async () => {
    if (!connected || !publicKey || !wallet || !userMeme) {
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
          lamports: teamFeeSOL,
        })
      );

      const txid = await wallet.adapter.sendTransaction(
        transaction,
        connection
      );
      await connection.confirmTransaction(txid, "confirmed");

      const response = await fetch(`${API_BASE_URL}/boosts/`, {
        method: "POST",
        body: JSON.stringify({
          raceId,
          walletAddress: publicKey.toString(),
          memeId: userMeme,
          amountSOL: parseFloat(boostAmount),
          round: currentRound,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`);
      }

      alert("🎉 Boost successful!");

      await fetchBoostsData(raceId, currentRound);

      setBoostAmount("");
    } catch (error) {
      console.error("❌ Boost transaction failed:", error);
      alert(
        `Transaction failed: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`
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
        disabled={!boostAmount || parseFloat(boostAmount) <= 0 || isBoosting}
      >
        {isBoosting ? "Processing..." : "BOOST MEME!"}
      </button>
    </div>
  );
};

export default BoostMemeInput;
