import React from "react";

interface ProgressBarProps {
  progress: number;
  boostProgress?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  boostProgress = 0,
}) => {
  return (
    <div className="flex-1 bg-gray-300 rounded-full h-6 relative overflow-hidden">
      {/* General progress */}
      <div
        className="bg-green-400 h-6 rounded-full transition-all duration-500"
        style={{ width: `${progress}%` }}
      ></div>
      {boostProgress > 0 && (
        <div
          className="bg-purple-500 h-6 rounded-full absolute left-0 transition-all duration-500"
          style={{ width: `${boostProgress}%` }}
        ></div>
      )}
    </div>
  );
};

export default ProgressBar;
