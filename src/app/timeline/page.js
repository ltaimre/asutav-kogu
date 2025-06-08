"use client";

import { useEffect, useState } from "react";
import { Container, Title, Paper, ScrollArea, Button } from "@mantine/core";
import { useRouter } from "next/navigation";
import * as d3 from "d3";
import { fetchGoogleSheetCsv } from "@/lib/fetchGoogleSheet";
import { GOOGLE_SHEET_CSV_URL } from "@/constants";

export default function TimelinePage() {
  const [data, setData] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchGoogleSheetCsv(GOOGLE_SHEET_CSV_URL).then(({ rows }) => {
      const parsed = rows
        .map((row) => {
          const parseDate = (str) => {
            if (!str || !str.includes(".")) return null;
            const [day, month, year] = str.split(".");
            return new Date(year, month - 1, day);
          };

          const start = parseDate(row.AKL_algus);
          const end = parseDate(row.AKL_lõpp);

          if (!start || !end) return null;

          return {
            ...row,
            start,
            end,
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.start - b.start);

      setData(parsed);
    });
  }, []);

  useEffect(() => {
    if (data.length === 0) return;

    const margin = { top: 20, right: 20, bottom: 30, left: 150 };
    const width = 1200 - margin.left - margin.right;
    const rowHeight = 20;
    const height = data.length * rowHeight;

    const svg = d3
      .select("#timeline-svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .select("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.selectAll("*").remove();

    const x = d3
      .scaleTime()
      .domain([new Date(1919, 3, 23), new Date(1920, 11, 20)])
      .range([0, width]);

    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.eesnimi + " " + d.perekonnanimi))
      .range([0, height])
      .padding(0.1);

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(d3.timeMonth.every(2))
          .tickFormat(d3.timeFormat("%b %Y"))
      );

    svg.append("g").attr("class", "y-axis").call(d3.axisLeft(y));

    svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.start))
      .attr("y", (d) => y(d.eesnimi + " " + d.perekonnanimi))
      .attr("width", (d) => x(d.end) - x(d.start))
      .attr("height", y.bandwidth())
      .attr("fill", "#4c6ef5");
  }, [data]);

  return (
    <Container mt="xl">
      <Title order={2} ta="center" mb="md">
        Asutava Kogu liikmete ametis olemise ajaskaala
      </Title>

      <Button onClick={() => router.push("/")} variant="outline" mb="md">
        Tagasi andmetabeli juurde
      </Button>

      <Paper shadow="md" radius="md" p="md" withBorder>
        <ScrollArea>
          <svg id="timeline-svg">
            <g />
          </svg>
        </ScrollArea>
      </Paper>
    </Container>
  );
}
