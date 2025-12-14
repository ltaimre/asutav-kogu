"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Table,
  Title,
  Loader,
  MultiSelect,
  Group,
  Paper,
  ScrollArea,
  Center,
  Text,
  Button,
  Tooltip,
  Badge,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { DatePickerInput } from "@mantine/dates";
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import {
  fetchGoogleSheetCsv,
  fetchKomisjonData,
  fetchKomisjonidMetadata,
} from "../lib/fetchGoogleSheet";
import {
  GOOGLE_SHEET_CSV_URL,
  KOMISJON_CSV_URL,
  KOMISJONID_METADATA_CSV_URL,
  TABLE_TITLE,
  DISPLAY_COLUMNS,
  COLUMN_LABELS,
  AK_LOPP,
} from "../constants";
import KomisjonModal from "./Komisjonmodal";

export default function GoogleSheetTable() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [polFilter, setPolFilter] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [sortColumn, setSortColumn] = useState("päevi_ametis");
  const [options, setOptions] = useState([]);
  const [komisjonMap, setKomisjonMap] = useState(new Map());
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedLiige, setSelectedLiige] = useState(null);

  useEffect(() => {
    // Laeme kõik kolm andmekogumit paralleelselt
    Promise.all([
      fetchGoogleSheetCsv(GOOGLE_SHEET_CSV_URL),
      fetchKomisjonidMetadata(KOMISJONID_METADATA_CSV_URL),
    ]).then(([{ rows }, defaultDates]) => {
      // Nüüd laeme komisjoni andmed koos vaikimisi kuupäevadega
      fetchKomisjonData(KOMISJON_CSV_URL, defaultDates, AK_LOPP).then(
        (komisjonData) => {
          // Lisame igale reale komisjonide info
          const rowsWithKomisjon = rows.map((row) => {
            const komisjonid = komisjonData.get(row.ID) || [];
            return {
              ...row,
              komisjonid: komisjonid,
              komisjonide_arv: komisjonid.length,
            };
          });

          setData(rowsWithKomisjon);
          setFiltered(rowsWithKomisjon);
          setKomisjonMap(komisjonData);

          const uniquePol = Array.from(
            new Set(rowsWithKomisjon.map((r) => r.pol_rühm).filter(Boolean))
          );
          setOptions(uniquePol.map((val) => ({ value: val, label: val })));
        }
      );
    });
  }, []);

  useEffect(() => {
    let result = [...data];

    if (polFilter.length > 0) {
      result = result.filter((row) => polFilter.includes(row.pol_rühm));
    }

    if (selectedDate) {
      const parseDate = (str) => {
        if (!str || !str.includes(".")) return null;
        const parts = str.split(".");
        if (parts.length !== 3) return null;
        const [day, month, year] = parts;
        return new Date(year, month - 1, day);
      };

      const toDateOnly = (d) => {
        const parsed = new Date(d);
        if (!(parsed instanceof Date) || isNaN(parsed)) return null;
        return new Date(
          parsed.getFullYear(),
          parsed.getMonth(),
          parsed.getDate()
        );
      };

      const check = toDateOnly(selectedDate);

      result = result.filter((row) => {
        const start = parseDate(row.AKL_algus);
        const end = parseDate(row.AKL_lõpp);

        const cleanStart = toDateOnly(start);
        const cleanEnd = toDateOnly(end);

        if (!cleanStart || !cleanEnd || !check) {
          return false;
        }

        const included =
          cleanStart.getTime() <= check.getTime() &&
          cleanEnd.getTime() >= check.getTime();

        return included;
      });
    }

    result.sort((a, b) => {
      const aVal = a[sortColumn] ?? "";
      const bVal = b[sortColumn] ?? "";

      const parseDate = (str) => {
        const parts = str.split(".");
        if (parts.length !== 3) return null;
        return new Date(parts[2], parts[1] - 1, parts[0]);
      };

      if (["AKL_algus", "AKL_lõpp"].includes(sortColumn)) {
        const aDate = parseDate(aVal);
        const bDate = parseDate(bVal);
        if (!aDate || !bDate || isNaN(aDate) || isNaN(bDate)) return 0;
        return sortAsc ? aDate - bDate : bDate - aDate;
      }

      const aNum = Number(aVal);
      const bNum = Number(bVal);

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortAsc ? aNum - bNum : bNum - aNum;
      }

      return sortAsc
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    setFiltered(result);
  }, [polFilter, selectedDate, sortAsc, sortColumn, data]);

  const handleSort = (col) => {
    if (col === sortColumn) {
      setSortAsc((prev) => !prev);
    } else {
      setSortColumn(col);
      setSortAsc(true);
    }
  };

  const handleKomisjonClick = (row) => {
    setSelectedLiige(row);
    setModalOpened(true);
  };

  if (data.length === 0) {
    return (
      <Container mt="xl">
        <Loader />
      </Container>
    );
  }

  return (
    <Container mt="xl">
      <Title order={2} mb="md" ta="center">
        {TABLE_TITLE}
      </Title>
      <Button
        onClick={() => router.push("/timeline")}
        variant="outline"
        mb="md"
      >
        Vaata visualiseeringut
      </Button>

      <Paper shadow="md" radius="md" p="md" withBorder>
        <Group mb="md" justify="space-between" align="end">
          <MultiSelect
            data={options}
            label="Filtreeri poliitilise rühma järgi"
            placeholder="Vali üks või mitu"
            value={polFilter}
            onChange={setPolFilter}
            clearable
          />
          <DatePickerInput
            label="Filtreeri ametis oldud kuupäeva järgi"
            placeholder="Vali kuupäev"
            value={selectedDate}
            onChange={setSelectedDate}
            clearable
            allowDeselect
            minDate={new Date(1919, 3, 23)}
            maxDate={new Date(1920, 11, 20)}
            size="sm"
            locale="et"
            previousIcon={<IconChevronLeft size={16} />}
            nextIcon={<IconChevronRight size={16} />}
            styles={{
              day: { fontSize: 14 },
              calendarHeaderControl: {
                width: 22,
                height: 22,
              },
              calendarHeaderLevel: {
                fontSize: 14,
              },
              weekday: {
                fontSize: 12,
              },
            }}
          />
        </Group>

        <Text size="sm" mb="xs" ta="right" c="dimmed">
          Kuvatakse {filtered.length} liiget
        </Text>

        <ScrollArea>
          <Table
            striped
            highlightOnHover
            withTableBorder
            withColumnBorders
            verticalSpacing="sm"
          >
            <Table.Thead>
              <Table.Tr>
                {DISPLAY_COLUMNS.map((col) => (
                  <Table.Th
                    key={col}
                    onClick={() => handleSort(col)}
                    style={{ cursor: "pointer" }}
                  >
                    <Group gap={4}>
                      <Text size="sm" fw={500} c="dark" tt="uppercase">
                        {COLUMN_LABELS[col] || col.replace("_", " ")}
                      </Text>
                      {sortColumn === col ? (
                        sortAsc ? (
                          <IconArrowUp size={16} color="black" />
                        ) : (
                          <IconArrowDown size={16} color="black" />
                        )
                      ) : (
                        <IconArrowUp size={14} style={{ opacity: 0.15 }} />
                      )}
                    </Group>
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map((row, i) => (
                <Table.Tr key={i}>
                  {DISPLAY_COLUMNS.map((col) => (
                    <Table.Td key={col}>
                      {col === "komisjonide_arv" ? (
                        <Center>
                          {row.komisjonid && row.komisjonid.length > 0 ? (
                            <Tooltip
                              label={
                                <div style={{ maxWidth: 300 }}>
                                  <Text size="sm" fw={500} mb={4}>
                                    Klõpsa detailide vaatamiseks
                                  </Text>
                                  <Text size="xs" c="dimmed">
                                    {row.komisjonid.length} komisjoni
                                  </Text>
                                </div>
                              }
                              withArrow
                              position="top"
                              transitionProps={{
                                transition: "fade",
                                duration: 200,
                              }}
                            >
                              <Badge
                                variant="light"
                                color="blue"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleKomisjonClick(row)}
                              >
                                {row.komisjonide_arv} 🔍
                              </Badge>
                            </Tooltip>
                          ) : (
                            <Text size="sm" c="dimmed">
                              0
                            </Text>
                          )}
                        </Center>
                      ) : ["AKL_algus", "AKL_lõpp", "päevi_ametis"].includes(
                          col
                        ) ? (
                        <Center>{row[col]}</Center>
                      ) : (
                        row[col]
                      )}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      {/* Komisjoni Modal */}
      <KomisjonModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        liige={selectedLiige}
        komisjonid={selectedLiige?.komisjonid || []}
      />
    </Container>
  );
}
