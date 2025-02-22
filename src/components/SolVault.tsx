import React from "react";

interface SolVaultProps {
  totalVault: number;
  totalWinners: number;
}

const SolVault: React.FC<SolVaultProps> = ({ totalVault, totalWinners }) => {
  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg text-center mt-4">
      <h3 className="text-lg font-semibold">WINNERS VAULT</h3>
      <p className="text-xl font-bold">{totalVault.toFixed(2)} SOL</p>
      <p className="text-sm">TOTAL WINNERS: {totalWinners}</p>
    </div>
  );
};

export default SolVault;
