import { FC, useContext } from "react";
import { Text, Accordion } from "@mantine/core";
import {
  IconAlertCircle,
  IconBarrierBlock,
  IconBug,
  IconCircleCheck,
} from "@tabler/icons-react";
import { AppContext } from "./AppContext";
import { Attempt } from "@types";
import { timeDifference } from "@/lib/general-helpers";
import { Prism } from "@mantine/prism";
function trimString(str: string, length = 15) {
  if (str.length > length) {
    str = str.slice(0, length) + "...";
  }
  return str;
}

function AccordionLabel({
  breach,
  error,
  input,
  output,
  detection,
  timestamp,
}: Attempt) {
  return (
    <div className="flex flex-row gap-2">
      <div className="min-w-12">
        {error ? (
          <IconBug size={32} strokeWidth={2} color={"#333"} />
        ) : breach ? (
          <IconAlertCircle size={32} strokeWidth={2} color={"#DC2626"} />
        ) : detection.injectionDetected ? (
          <IconBarrierBlock size={32} strokeWidth={2} color={"#16A34A"} />
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
            : detection.injectionDetected
            ? "prompt injection attempt detected"
            : trimString(output, 100)}
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
