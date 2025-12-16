"use client";

import { Paper, Text, Stack, Divider, Badge, Group, Box } from "@mantine/core";
import {
  IconCalendar,
  IconUser,
  IconFileText,
  IconBook,
} from "@tabler/icons-react";

export default function XmlDocument({ metadata }) {
  if (!metadata) {
    return (
      <Paper shadow="sm" radius="md" p="lg" withBorder>
        <Text c="dimmed">Ei saanud dokumenti laadida</Text>
      </Paper>
    );
  }

  return (
    <Paper shadow="sm" radius="md" p="lg" withBorder>
      <Stack gap="md">
        {metadata.title && (
          <Box>
            <Group gap="xs" mb="xs">
              <IconFileText size={20} color="#228be6" />
              <Text size="xs" tt="uppercase" fw={600} c="dimmed">
                Protokoll
              </Text>
            </Group>
            <Text size="lg" fw={600}>
              {metadata.title}
            </Text>
          </Box>
        )}

        <Group gap="xl">
          {(metadata.date || metadata.year) && (
            <Box>
              <Group gap="xs" mb={4}>
                <IconCalendar size={16} color="#868e96" />
                <Text size="xs" c="dimmed">
                  Aasta
                </Text>
              </Group>
              <Badge variant="light" size="lg">
                {metadata.date || metadata.year}
              </Badge>
            </Box>
          )}

          {metadata.documentId && (
            <Box>
              <Group gap="xs" mb={4}>
                <IconBook size={16} color="#868e96" />
                <Text size="xs" c="dimmed">
                  Dokument
                </Text>
              </Group>
              <Text size="sm" fw={500}>
                {metadata.documentId}
              </Text>
            </Box>
          )}
        </Group>

        {metadata.description && (
          <>
            <Divider />
            <Box>
              <Text size="xs" tt="uppercase" fw={600} c="dimmed" mb="xs">
                Dokumendi nimi
              </Text>
              <Text size="sm" c="dimmed" style={{ fontStyle: "italic" }}>
                {metadata.description}
              </Text>
            </Box>
          </>
        )}

        {metadata.author && (
          <Box>
            <Group gap="xs" mb={4}>
              <IconUser size={16} color="#868e96" />
              <Text size="xs" c="dimmed">
                E-versioon
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              {metadata.author}
            </Text>
          </Box>
        )}

        {metadata.content && metadata.content.length > 0 && (
          <>
            <Divider />
            <Box>
              <Text size="xs" tt="uppercase" fw={600} c="dimmed" mb="md">
                Sisu
              </Text>
              <Stack gap="md">
                {metadata.content.map((item, idx) => {
                  if (item.type === "heading") {
                    return (
                      <Text key={idx} size="md" fw={600} c="blue" mt="md">
                        {item.text}
                      </Text>
                    );
                  } else if (item.type === "speaker") {
                    return (
                      <Text key={idx} size="sm" fw={600} mt="sm" c="dark">
                        {item.text}
                      </Text>
                    );
                  } else if (item.type === "toc") {
                    return (
                      <Paper key={idx} p="sm" bg="gray.0" radius="sm">
                        <Text size="xs" fw={600} c="dimmed" mb={4}>
                          SISUKORD
                        </Text>
                        <Text size="sm" style={{ lineHeight: 1.6 }}>
                          {item.text}
                        </Text>
                      </Paper>
                    );
                  } else {
                    return (
                      <Text
                        key={idx}
                        size="sm"
                        style={{
                          lineHeight: 1.8,
                          textAlign: "justify",
                        }}
                      >
                        {item.text}
                      </Text>
                    );
                  }
                })}
              </Stack>
            </Box>
          </>
        )}

        {(!metadata.content || metadata.content.length === 0) && (
          <Box>
            <Text size="sm" c="dimmed" ta="center" py="xl">
              Sisu puudub või ei saanud parsida
            </Text>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
