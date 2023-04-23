import React from "react";

interface EngGameProps {
  Won: boolean;
  Attempts: number;
  Level: number;
}

const EndGame: React.FC<EngGameProps> = ({ Won, Attempts, Level }) => {
  return (
    <div className="flex items-center justify-center mt-8 flex flex-col gap-4">
      <div className="mr-2 text-5xl">{Won ? "😃" : "😔"}</div>
      <h1 className="text-3xl font-bold">
        {Won ? "You won!" : "Darn, you ran out of attempts"}
      </h1>
      <p className="text-xl font-bold">{`You took ${Attempts} attempts`}</p>
      {!Won && (
        <p className="text-xl font-bold">{`You got to level ${Level}`}</p>
      )}
    </div>
  );
};

export default EndGame;
