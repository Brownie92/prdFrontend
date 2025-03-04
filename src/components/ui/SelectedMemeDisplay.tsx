const SelectedMemeDisplay = ({
  memeId,
  memes,
}: {
  memeId: string | null;
  memes: any[];
}) => {
  const selectedMeme = memes.find((m) => m.memeId === memeId);

  if (!selectedMeme)
    return <p className="text-center text-white">No meme selected</p>;

  return (
    <div className="text-center">
      <h3 className="text-lg font-semibold text-white">Your Chosen Meme</h3>
      <img
        src={selectedMeme.url}
        alt={selectedMeme.name}
        className="w-24 h-24 rounded-full shadow-lg mx-auto mt-2"
      />
    </div>
  );
};

export default SelectedMemeDisplay;
