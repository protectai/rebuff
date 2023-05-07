import { FC, useContext } from "react";
import {
  Space,
  Table,
  Tabs,
  Title,
  LoadingOverlay,
  Box,
  Text,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCircleCheck,
  IconClock,
  IconPrompt,
} from "@tabler/icons-react";
import { AppContext } from "./AppContext";
function trimString(str: string, length: number = 15) {
  if (str.length > length) {
    str = str.slice(0, 15) + "...";
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
const ResultsViewer: FC = () => {
  const { attempts, loading } = useContext(AppContext);
  const rows = attempts.map((element, idx) => (
    <tr key={idx}>
      <td>
        <IconPrompt className="pr-1" />
        {element.timestamp}
      </td>
      <td alt-text={element.input}>{trimString(element.input)}</td>
      <td>
        {element.is_injection ? (
          <IconAlertCircle size={48} strokeWidth={2} color={"#bf4040"} />
        ) : (
          <IconCircleCheck size={48} strokeWidth={2} color={"#2d863e"} />
        )}
      </td>
      <td>
        <Text>Heuristics</Text>
        {element.metrics.runHeuristicCheck
          ? element.metrics.heuristicScore
          : "Not enabled"}
        <Text>VectorDB</Text>
        {element.metrics.runVectorCheck
          ? formatDictionary(element.metrics.vectorScore)
          : "Not enabled"}
        <Text>LLM</Text>
        {element.metrics.runLanguageModelCheck
          ? element.metrics.modelScore
          : "Not enabled"}
      </td>
    </tr>
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
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>
                <IconClock />
              </th>
              <th>Prompt</th>
              <th>Injection Detected?</th>
              <th>Checks</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      )}
    </div>
  );
};

export default ResultsViewer;
