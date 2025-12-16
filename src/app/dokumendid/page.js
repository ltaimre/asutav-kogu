"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Paper,
  Stack,
  Loader,
  Text,
  Button,
  Group,
  Card,
  Modal,
  ScrollArea,
  Code,
  Box,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import {
  IconFileText,
  IconDownload,
  IconEye,
  IconCode,
} from "@tabler/icons-react";
import { extractTeiMetadata } from "@/lib/xmlParser";
import XmlDocument from "@/components/XmlDocument";

export default function DokumendidPage() {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [showRawXml, setShowRawXml] = useState(false);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/github-xml");
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setFiles(data.files);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFileContent = async (fileName) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/github-xml?file=${fileName}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setFileContent(data.content);
      setSelectedFile(fileName);
      setModalOpened(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpened(false);
    setSelectedFile(null);
    setFileContent(null);
    setShowRawXml(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const metadata = fileContent ? extractTeiMetadata(fileContent) : null;

  if (loading && files.length === 0) {
    return (
      <Container mt="xl">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">Laadin dokumente...</Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container mt="xl">
        <Paper shadow="md" radius="md" p="xl" withBorder>
          <Stack align="center">
            <Text c="red" size="lg" fw={600}>
              Viga andmete laadimisel
            </Text>
            <Text c="dimmed">{error}</Text>
            <Button onClick={loadFiles}>Proovi uuesti</Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container mt="xl" size="lg">
      <Stack gap="lg">
        <Group justify="space-between">
          <Box>
            <Title order={2}>Asutava Kogu dokumendid</Title>
            <Text c="dimmed" size="sm" mt={4}>
              Tokyo nüüdne (Toimetatud kokku)
            </Text>
          </Box>
          <Button onClick={() => router.push("/")} variant="outline">
            Tagasi avalehele
          </Button>
        </Group>

        <Paper shadow="sm" radius="md" p="md" withBorder>
          <Group gap="xl">
            <Box>
              <Text size="xs" c="dimmed" tt="uppercase">
                Dokumente kokku
              </Text>
              <Text size="xl" fw={600} c="blue">
                {files.length}
              </Text>
            </Box>
            <Box>
              <Text size="xs" c="dimmed" tt="uppercase">
                Allikas
              </Text>
              <Text size="sm" fw={500}>
                GitHub Repository
              </Text>
            </Box>
          </Group>
        </Paper>

        <Stack gap="sm">
          {files.map((file, idx) => (
            <Card key={idx} shadow="sm" radius="md" p="md" withBorder>
              <Group justify="space-between">
                <Group gap="md">
                  <IconFileText size={24} color="#228be6" />
                  <Box>
                    <Text fw={500}>{file.name}</Text>
                    <Text size="xs" c="dimmed">
                      {formatFileSize(file.size)}
                    </Text>
                  </Box>
                </Group>
                <Group gap="xs">
                  <Button
                    size="sm"
                    variant="light"
                    leftSection={<IconEye size={16} />}
                    onClick={() => loadFileContent(file.name)}
                  >
                    Vaata
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    leftSection={<IconDownload size={16} />}
                    component="a"
                    href={file.downloadUrl}
                    download
                  >
                    Lae alla
                  </Button>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      </Stack>

      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={
          <Group gap="sm">
            <IconFileText size={20} />
            <Text fw={600}>{selectedFile}</Text>
          </Group>
        }
        size="xl"
        padding="lg"
      >
        {fileContent && (
          <Stack gap="md">
            <Group>
              <Button
                variant={!showRawXml ? "filled" : "light"}
                onClick={() => setShowRawXml(false)}
                size="sm"
              >
                Vormindatud vaade
              </Button>
              <Button
                variant={showRawXml ? "filled" : "light"}
                onClick={() => setShowRawXml(true)}
                leftSection={<IconCode size={16} />}
                size="sm"
              >
                XML kood
              </Button>
            </Group>

            <ScrollArea h={600}>
              {showRawXml ? (
                <Code block style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>
                  {fileContent}
                </Code>
              ) : (
                <XmlDocument metadata={metadata} />
              )}
            </ScrollArea>
          </Stack>
        )}
      </Modal>
    </Container>
  );
}
