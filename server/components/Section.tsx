import { Title } from "@mantine/core";
import { FC, ReactNode } from "react";

interface SectionProps {
  id?: string;
  title: string;
  children: ReactNode;
}

const Section: FC<SectionProps> = ({ title, children, id }) => {
  return (
    <div className="py-4" id={id}>
      <Title order={4}>{title}</Title>
      {children}
    </div>
  );
};

export default Section;
