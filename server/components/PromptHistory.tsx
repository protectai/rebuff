import { FC, useContext } from "react";
import { Text, Accordion } from "@mantine/core";
import {
  IconAlertCircle,
  IconCircleCheck,
  IconColumnsOff,
} from "@tabler/icons-react";
import { AppContext } from "./AppContext";
import { Attempt } from "@/interfaces/ui";
import { timeDifference } from "@/lib/general-helpers";
import { Prism } from "@mantine/prism";
function trimString(str: string, length: number = 15) {
  if (str.length > length) {
    str = str.slice(0, length) + "...";
  }
  return str;
}

function AccordionLabel({
  is_injection,
  error,
  input,
  output,
  timestamp,
}: Attempt) {
  return (
    <div className="flex flex-row gap-2">
      <div className="min-w-12">
        {error ? (
          <IconAlertCircle size={32} strokeWidth={2} color={"#DC2626"} />
        ) : is_injection ? (
          <IconColumnsOff size={32} strokeWidth={2} color={"#EA580C"} />
        ) : (
          <IconCircleCheck size={32} strokeWidth={2} color={"#16A34A"} />
        )}
      </div>
      <div>
        <p className="py-0 m-0">
          <span className="text-gray pr-2 italic">
            {timeDifference(timestamp)}
          </span>
          {trimString(input, 100)}
        </p>
        <Text size="md" color="dimmed" weight={400}>
          {error
            ? "error occurred"
            : is_injection
            ? "prompt injection attempt detected"
            : output}
        </Text>
      </div>
    </div>
  );
}

const PromptHistory: FC = () => {
  const { attempts } = useContext(AppContext);
  const rows = attempts.map((element, idx) => (
    <Accordion.Item value={element.input} key={idx}>
      <Accordion.Control>
        <AccordionLabel {...element} />
      </Accordion.Control>
      <Accordion.Panel>
        <Prism copyLabel="Copy JSON" copiedLabel="Copied!" language="json">
          {JSON.stringify(element, null, 2)}
        </Prism>
      </Accordion.Panel>
    </Accordion.Item>
  ));
  return (
    <div>
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

export default PromptHistory;
