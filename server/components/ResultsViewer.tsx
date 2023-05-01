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
import { IconPrompt } from "@tabler/icons-react";
import { AppContext } from "./AppContext";

const ResultsViewer: FC = () => {
  const { appState, loading } = useContext(AppContext);
  const results = appState.attempts;
  return (
    <Box>
      <Title order={2}>Results</Title>
      <Space h="md" />
      <LoadingOverlay visible={loading} />
      {results.length === 0 && (
        <Text size="sm" color="gray">
          Submit a prompt to see results.
        </Text>
      )}
      <Tabs
        color="dark"
        variant="pills"
        orientation="vertical"
        defaultValue="0"
      >
        <Tabs.List>
          {results.map((result, index) => (
            <Tabs.Tab value={`${index}`} icon={<IconPrompt size="0.8rem" />}>
              {`${result.vectorScore}`}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {results.map((result, index) => (
          <Tabs.Panel value={`${index}`} pl="xs">
            <Table withBorder>
              <tbody>
                {result &&
                  Object.entries(result).map(([key, value]) => (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>{value.toString()}</td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </Tabs.Panel>
        ))}
      </Tabs>
    </Box>
  );
};

export default ResultsViewer;
