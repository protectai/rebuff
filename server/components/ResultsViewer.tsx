import { FC, useContext } from "react";
import {
  Space,
  Title,
  LoadingOverlay,
  Text,
  Group,
  Accordion,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCircleCheck,
  IconMoodSad,
} from "@tabler/icons-react";
import { AppContext } from "./AppContext";
import { Attempt } from "@/interfaces/ui";
import { timeDifference } from "@/lib/general-helpers";
function trimString(str: string, length: number = 15) {
  if (str.length > length) {
    str = str.slice(0, length) + "...";
  }
  return str;
}
function formatDictionary(dictionary: Record<string, any>) {
  let result = "";
  for (const key in dictionary) {
    if (dictionary.hasOwnProperty(key)) {
      result += `${key}: ${dictionary[key]}\n`;
    }
  }
  return result;
}

function AccordionLabel({
  is_injection,
  error,
  input,
  llm_query,
  timestamp,
}: Attempt) {
  return (
    <Group noWrap>
      {error ? (
        <IconMoodSad size={48} strokeWidth={2} color={"#bf4040"} />
      ) : is_injection ? (
        <IconAlertCircle size={48} strokeWidth={2} color={"#bf4040"} />
      ) : (
        <IconCircleCheck size={48} strokeWidth={2} color={"#2d863e"} />
      )}
      <div>
        <p className="py-1 m-0">
          <span className="text-gray pr-2 italic">
            {timeDifference(timestamp)}
          </span>
          {trimString(input, 100)}
        </p>
        <Text size="md" color="dimmed" weight={400}>
          {error
            ? "error occurred"
            : is_injection
            ? "prompt injection detected"
            : llm_query}
        </Text>
      </div>
    </Group>
  );
}

const ResultsViewer: FC = () => {
  const { attempts, loading } = useContext(AppContext);
  const rows = attempts.map((element, idx) => (
    <Accordion.Item value={element.input} key={idx}>
      <Accordion.Control>
        <AccordionLabel {...element} />
      </Accordion.Control>
      <Accordion.Panel>
        <Text size="sm">{JSON.stringify(element)}</Text>
      </Accordion.Panel>
    </Accordion.Item>
  ));
  return (
    <div>
      <Title order={2}>Results</Title>
      <Space h="md" />
      <LoadingOverlay visible={loading} />
      {attempts.length == 0 ? (
        <Text size="sm" color="gray">
          Submit a prompt to see results.
        </Text>
      ) : (
        <Accordion chevronPosition="right" variant="contained">
          {rows}
        </Accordion>
      )}
    </div>
  );
};

export default ResultsViewer;
