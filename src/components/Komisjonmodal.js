"use client";

import { Modal, Text, Stack, Group, Badge, Box, Divider } from "@mantine/core";
import { AK_ALGUS, AK_LOPP } from "../constants";

/**
 * Arvutab päevade arvu kahe kuupäeva vahel
 */
function calculateDays(startStr, endStr) {
  const parseDate = (str) => {
    if (!str || str === "") return null;

    // Kui formaat on YYYY-MM-DD
    if (str.includes("-")) {
      return new Date(str);
    }

    // Kui formaat on DD.MM.YYYY
    if (str.includes(".")) {
      const parts = str.split(".");
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }

    return null;
  };

  const start = parseDate(startStr);
  const end = parseDate(endStr);

  if (!start || !end) return 0;

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((end - start) / msPerDay);
}

/**
 * Vormindab kuupäeva DD.MM.YYYY formaati
 */
function formatDate(dateStr) {
  if (!dateStr || dateStr === "") return "";

  // Kui on juba õiges formaadis
  if (dateStr.includes(".")) return dateStr;

  // Kui on YYYY-MM-DD formaadis
  if (dateStr.includes("-")) {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  return dateStr;
}

/**
 * Timeline visualiseeringu komponent
 */
function TimelineBar({ algus, lopp, komisjonNimi }) {
  const akStart = new Date("1919-04-23");
  const akEnd = new Date("1920-12-20");

  const parseDate = (str) => {
    if (!str) return null;
    if (str.includes("-")) return new Date(str);
    if (str.includes(".")) {
      const parts = str.split(".");
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    return null;
  };

  const startDate = parseDate(algus) || akStart;
  const endDate = parseDate(lopp) || akEnd;

  // Arvutame positsioonid protsentides
  const totalDuration = akEnd - akStart;
  const startOffset = ((startDate - akStart) / totalDuration) * 100;
  const barWidth = ((endDate - startDate) / totalDuration) * 100;

  return (
    <Box style={{ position: "relative", height: 30, marginBottom: 8 }}>
      {/* Taustariba */}
      <Box
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 10,
          height: 8,
          backgroundColor: "#f1f3f5",
          borderRadius: 4,
        }}
      />

      {/* Aktiivne periood */}
      <Box
        style={{
          position: "absolute",
          left: `${startOffset}%`,
          width: `${barWidth}%`,
          top: 8,
          height: 12,
          backgroundColor: "#228be6",
          borderRadius: 4,
          boxShadow: "0 2px 4px rgba(34, 139, 230, 0.3)",
        }}
      />

      {/* Ajamärgised */}
      <Group
        gap={4}
        style={{
          position: "absolute",
          top: 22,
          left: 0,
          right: 0,
          fontSize: 10,
          color: "#868e96",
        }}
      >
        <Text size="xs">1919</Text>
        <Box style={{ flex: 1 }} />
        <Text size="xs">1920</Text>
      </Group>
    </Box>
  );
}

/**
 * Komisjoni kuulumise modaal
 */
export default function KomisjonModal({ opened, onClose, liige, komisjonid }) {
  if (!liige || !komisjonid) return null;

  // Arvutame statistika
  const totalDays = komisjonid.reduce((sum, k) => {
    return sum + calculateDays(k.algus, k.lopp);
  }, 0);

  const avgDays =
    komisjonid.length > 0 ? Math.round(totalDays / komisjonid.length) : 0;

  // Sorteerime komisjonid alguskuupäeva järgi
  const sortedKomisjonid = [...komisjonid].sort((a, b) => {
    const dateA = new Date(a.algus || "1919-04-23");
    const dateB = new Date(b.algus || "1919-04-23");
    return dateA - dateB;
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <Text fw={600} size="lg">
            {liige.eesnimi} {liige.perekonnanimi}
          </Text>
          <Badge color="blue" variant="light">
            {komisjonid.length} komisjoni
          </Badge>
        </Group>
      }
      size="lg"
      padding="lg"
    >
      <Stack gap="md">
        {/* Statistika */}
        <Group gap="xl">
          <Box>
            <Text size="xs" c="dimmed" tt="uppercase">
              Kokku päevi
            </Text>
            <Text size="xl" fw={600} c="blue">
              {totalDays}
            </Text>
          </Box>
          <Box>
            <Text size="xs" c="dimmed" tt="uppercase">
              Keskmine kestus
            </Text>
            <Text size="xl" fw={600} c="blue">
              {avgDays} päeva
            </Text>
          </Box>
          <Box>
            <Text size="xs" c="dimmed" tt="uppercase">
              Komisjone
            </Text>
            <Text size="xl" fw={600} c="blue">
              {komisjonid.length}
            </Text>
          </Box>
        </Group>

        <Divider />

        {/* Timeline visualiseering */}
        <Box>
          <Text size="sm" fw={500} mb="xs" c="dimmed">
            Ajatelg (Asutava Kogu periood)
          </Text>
          <Box mb="md">
            {sortedKomisjonid.map((k, idx) => (
              <TimelineBar
                key={idx}
                algus={k.algus}
                lopp={k.lopp}
                komisjonNimi={k.nimi}
              />
            ))}
          </Box>
        </Box>

        <Divider />

        {/* Detailne loend */}
        <Box>
          <Text size="sm" fw={500} mb="md" c="dimmed">
            Komisjonide loend
          </Text>
          <Stack gap="sm">
            {sortedKomisjonid.map((k, idx) => {
              const days = calculateDays(k.algus, k.lopp);
              return (
                <Box
                  key={idx}
                  p="sm"
                  style={{
                    backgroundColor: "#f8f9fa",
                    borderRadius: 8,
                    borderLeft: "3px solid #228be6",
                  }}
                >
                  <Group justify="space-between" align="start">
                    <Box style={{ flex: 1 }}>
                      <Text fw={500} size="sm">
                        {k.nimi}
                      </Text>
                      <Text size="xs" c="dimmed" mt={4}>
                        {formatDate(k.algus)} - {formatDate(k.lopp)}
                      </Text>
                    </Box>
                    <Badge color="gray" variant="light" size="sm">
                      {days} päeva
                    </Badge>
                  </Group>
                </Box>
              );
            })}
          </Stack>
        </Box>
      </Stack>
    </Modal>
  );
}
