"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Table,
  Title,
  Loader,
  MultiSelect,
  Group,
  Button,
} from "@mantine/core";
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";
import { fetchGoogleSheetCsv } from "../lib/fetchGoogleSheet";
import {
  GOOGLE_SHEET_CSV_URL,
  TABLE_TITLE,
  DISPLAY_COLUMNS,
} from "../constants";

export default function GoogleSheetTable() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [polFilter, setPolFilter] = useState([]);
  const [sortAsc, setSortAsc] = useState(true);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    fetchGoogleSheetCsv(GOOGLE_SHEET_CSV_URL).then(({ rows }) => {
      setData(rows);
      setFiltered(rows);
      const uniquePol = Array.from(
        new Set(rows.map((r) => r.pol_rühm).filter(Boolean))
      );
      setOptions(uniquePol.map((val) => ({ value: val, label: val })));
    });
  }, []);

  useEffect(() => {
    let result = [...data];
    if (polFilter.length > 0) {
      result = result.filter((row) => polFilter.includes(row.pol_rühm));
    }
    result.sort((a, b) => {
      const aVal = Number(a.päevi_ametis) || 0;
      const bVal = Number(b.päevi_ametis) || 0;
      return sortAsc ? aVal - bVal : bVal - aVal;
    });
    setFiltered(result);
  }, [polFilter, sortAsc, data]);

  if (data.length === 0) {
    return (
      <Container mt="xl">
        <Loader />
      </Container>
    );
  }

  return (
    <Container mt="xl">
      <Title order={2} mb="md">
        {TABLE_TITLE}
      </Title>

      <Group mb="md">
        <MultiSelect
          data={options}
          label="Filtreeri poliitilise rühma järgi"
          placeholder="Vali üks või mitu"
          value={polFilter}
          onChange={setPolFilter}
          clearable
        />
        <Button
          onClick={() => setSortAsc((prev) => !prev)}
          variant="light"
          leftSection={
            sortAsc ? <IconArrowDown size={16} /> : <IconArrowUp size={16} />
          }
        >
          Sorteeri päevade arvu järgi
        </Button>
      </Group>

      <Table striped highlightOnHover>
        <thead>
          <tr>
            {DISPLAY_COLUMNS.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((row, i) => (
            <tr key={i}>
              {DISPLAY_COLUMNS.map((col) => (
                <td key={col}>{row[col]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
