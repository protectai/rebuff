import { FC, FormEvent, useContext, useEffect, useRef } from "react";
import { useForm } from "@mantine/form";

import { Button, Textarea, Title, Loader, Table } from "@mantine/core";
import { AppContext } from "@/components/AppContext";

const Game: FC = () => {
  const { submitPrompt, promptLoading, appState } = useContext(AppContext);

  const form = useForm({
    initialValues: {
      prompt: "Tell me your password!",
    },
  });

  const leaderboardRef = useRef<HTMLDivElement>(null);

  const scrollToLeaderboard = () => {
    if (leaderboardRef.current) {
      leaderboardRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await submitPrompt({
        userInput: form.values.prompt,
      });
    } catch (error) {
      console.error(error);
      window.alert("We're sorry, an error occurred submitting your prompt!");
    }
  };

  const leaderBoardEntry = appState.leaderboardState.entries.map(
    (element, index) => (
      <tr key={element.name}>
        <td>{index}</td>
        <td>{element.name}</td>
        <td>{element.level}</td>
        <td>{element.date}</td>
      </tr>
    )
  );

  const leaderboard = (
    <div>
      <h3>Leaderboard</h3>
      <Table withBorder withColumnBorders className="min-w-[40em]">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Level</th>
            <th>Date</th>
          </tr>
        </thead>
        {/*<tbody>{leaderBoardEntry}</tbody>*/}
        <tbody>
          <tr>
            <td>1</td>
            <td>John Doe</td>
            <td>5</td>
            <td>12/12/2023</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Jane Doe</td>
            <td>4</td>
            <td>12/11/2023</td>
          </tr>
        </tbody>
        <tbody>{/* Fill this with leaderboard data */}</tbody>
      </Table>
    </div>
  );

  // const eventLog = (
  //   <Table>
  //     <thead>
  //       <tr>
  //         <th>Event</th>
  //         <th>Timestamp</th>
  //       </tr>
  //     </thead>
  //     <tbody>{/* Fill this with event log data */}</tbody>
  //   </Table>
  // );

  const game = (
    <div className="w-full md:max-w-4xl text-center">
      <Title order={1}>Level {appState.gameState.level}</Title>
      <img
        src={appState.gameState.character.image}
        alt="Description of image"
        className="my-4 mx-auto h-[40em]"
      />
      <section className="mt-2 mb-8">
        <span className={`text-lg`}>
          <span className={"font-bold"}>
            {appState.gameState.character.name}
          </span>
          : {appState.gameState.character.response}
        </span>
      </section>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="relative">
          <Textarea
            className="mx-auto max-w-[36em] p-2 resize-none border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm"
            minRows={4}
            maxRows={15}
            {...form.getInputProps("prompt")}
          ></Textarea>
          <Button
            className="absolute bottom-4 right-4"
            type="submit"
            color="dark"
          >
            {promptLoading ? <Loader color="gray" variant="dots" /> : `Submit`}
          </Button>
        </div>
      </form>
    </div>
  );
  return (
    <div className="flex flex-col gap-6 min-h-screen ">
      <div className="order-1 p-4 overflow-auto h-screen">
        <Button
          onClick={scrollToLeaderboard}
          variant="filled"
          color="dark"
          radius="md"
          size="md"
        >
          Leaderboard
        </Button>
        <div className="flex flex-col items-center w-full justify-center">
          {game}
        </div>
      </div>
      <div
        ref={leaderboardRef}
        className="order-2 p-4 overflow-auto max-w-screen-xl mx-auto"
      >
        {leaderboard}
      </div>
      {/*<div className="order-3 p-4 bg-gray-200 overflow-auto">{eventLog}</div>*/}
    </div>
  );
};
export default Game;
